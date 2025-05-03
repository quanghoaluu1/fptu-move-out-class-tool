import React, { useEffect, useState } from "react";
import * as cheerio from "cheerio";
import { classData, slots, weekdays } from "./constants/classData";
import { formGetter, secondFormGetter } from "./constants/formData";
import {
  textToColor,
  mapToObject,
  objectToMap,
  getClassKey,
  send,
  getCurrentSubjects,
  getCurrentStatus,
  handleDownload,
  cleanTimetable,
} from "./utils";
import { sendTrackingEvent } from "./tracking";
import Header from "./components/Header";
import Timetable from "./components/Timetable";
import FilterSection from "./components/FilterSection";
import ClassListDetails from "./components/ClassListDetails";
import TimetableDetails from "./components/TimetableDetails";

export default function App() {
  // Setup metadata
  const url = window.location.href;
  const id = url.slice(url.indexOf("id=") + 3).split("&")[0];
  const baseUrl = window.location.origin + window.location.pathname;
  const formData = formGetter(id);
  let secondId = "";
  let subject =
    document.getElementById("ctl00_mainContent_lblSubject")?.textContent || "";

  // Get cached data
  let cached = localStorage.getItem(subject);
  let timeTableData = cached ? JSON.parse(cached) : null;

  // Setup state
  const [timeTable, setTimeTable] = useState<
    Map<string, Map<string, string[]>>
  >(timeTableData ? objectToMap(timeTableData) : classData);
  const [total, setTotal] = useState(0);
  const [gotten, setGotten] = useState(0);
  const [isLoading, setIsLoading] = useState<any>({
    moving: false,
    fetching: false,
  });
  const [moveList, setMoveList] = useState<any>([]);
  const [studentCount, setStudentCount] = useState<any>({});
  const [changeSubjectForm, setChangeSubjectForm] = useState<any>({});
  const [lecturerList, setLecturerList] = useState<any>([]);
  const [filter, setFilter] = useState<any>({
    lecturer: "",
    classId: "",
    studentCount: 100,
    excludeSlots: [],
    excludeWeekdays: [],
  });
  const [isFull, setIsFull] = useState(false);

  const handleStudentCount = async () => {
    await sendTrackingEvent();
    setIsLoading((prev: any) => ({
      ...prev,
      fetching: true,
    }));
    getCurrentStatus().then((res) => {
      setStudentCount(res);
      setIsLoading((prev: any) => ({
        ...prev,
        fetching: false,
      }));
      setFilter((prev: any) => ({
        ...prev,
        studentCount:
          Math.max(...Object.values(res).map((value) => Number(value))) ?? 100,
      }));
      alert("Đã lấy xong sĩ số!");
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await crawlAndSave();
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchClassListAndSubjects = async () => {
      fetch(`https://fap.fpt.edu.vn/Course/Groups.aspx?group=${id}`)
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const element = doc.querySelector("#ctl00_mainContent_divStudents");
          if (element) {
            document.getElementById("class-list")?.appendChild(element);
          }
        });

      const data = await getCurrentSubjects();
      setMoveList(data.currentSubjects);
      setChangeSubjectForm({
        __VIEWSTATE: data.__VIEWSTATE,
        __VIEWSTATEGENERATOR: data.__VIEWSTATEGENERATOR,
        __EVENTVALIDATION: data.__EVENTVALIDATION,
        ctl00_mainContent_ddlCampuses: data.ctl00_mainContent_ddlCampuses,
      });
      handleToggleOldFeature();
    };

    fetchClassListAndSubjects();
  }, []);

  const refresh = async () => {
    await sendTrackingEvent();
    localStorage.removeItem(subject);
    window.location.reload();
  };

  const crawlAndSave = async () => {
    // Check cached or not
    if (
      Date.now() < Number(localStorage.getItem("expireAt")) &&
      timeTableData
    ) {
      let lecturerList: any = [];
      slots.forEach((slot: any) => {
        weekdays.forEach((day: any) => {
          timeTable
            .get(day)
            ?.get(slot)
            ?.forEach((item: any) => {
              if (!lecturerList.includes(item.split("(")[1].replace(")", ""))) {
                lecturerList.push(item.split("(")[1].replace(")", ""));
              }
            });
        });
      });
      setLecturerList(lecturerList);
      return;
    }

    // Parse classes
    const data: string =
      document.querySelector("#ctl00_mainContent_dllCourse")?.innerHTML || "";
    const $ = cheerio.load(data);
    const classes = new Map<string, string>();
    classes.set(
      id,
      document.getElementById("ctl00_mainContent_lblOldGroup")?.innerText || ""
    );
    $("option").each((_i, e) => {
      const value = $(e).attr("value");
      if (value) {
        secondId = value;
        classes.set(value, $(e).text());
      }
    });

    setTotal(classes.size);

    // Fetch classes's time table
    // console.time("Execution Time"); // Start timer
    const secondFormData = await secondFormGetter(secondId, id);
    for (const [key, _item] of classes) {
      formData.set("ctl00$mainContent$dllCourse", key);
      let nextClass;
      // if (key == id) {
      //   nextClass = await (
      //     await fetch(baseUrl + `?id=${secondId}`, {
      //       method: "POST",
      //       headers: {},
      //       body: secondFormData,
      //     })
      //   ).text();
      // } else {
      //   nextClass = await (
      //     await fetch(window.location.href, {
      //       method: "POST",
      //       headers: {},
      //       body: formData,
      //     })
      //   ).text();
      // }
      nextClass = await (
        await fetch(window.location.href, {
          method: "POST",
          headers: {},
          body: formData,
        })
      ).text();
      const $$ = cheerio.load(nextClass);

      const classInfo = $$("#ctl00_mainContent_lblNewSlot").text();
      const className = $$(
        "#ctl00_mainContent_dllCourse > option:selected"
      ).text();
      console.log("className", classInfo);

      const classDetail = classInfo.split(",");
      const lecture = classDetail[0].slice(
        classDetail[0].indexOf("Lecture:") + 9
      );
      const classRoom = classDetail[0].slice(
        classDetail[0].indexOf("RoomNo:") + 9,
        classDetail[0].indexOf(" - Lecture:")
      );

      //TODO: allow user to see classroom number
      for (const detail of classDetail) {
        const weekday = detail.slice(0, 3);
        const slot = detail.slice(11, 12);

        if (weekdays.indexOf(weekday) >= 0) {
          const updatedClassData = new Map(classData); // Create a new map object
          const slotMap =
            updatedClassData.get(weekday) || new Map<string, string[]>();
          const classNames = slotMap.get(slot) || [];
          classNames.push(
            className +
              ` (${lecture.length > 0 ? lecture : "N/A"}) \n${classRoom}`
          );
          slotMap.set(slot, classNames);
          updatedClassData.set(weekday, slotMap);
          setTimeTable(updatedClassData);
        }
      }
      setGotten((prev) => prev + 1);
    }

    // console.timeEnd("Execution Time");
    localStorage.setItem(subject, JSON.stringify(mapToObject(timeTable)));
    let lecturerListTemp: any = [];
    slots.forEach((slot: any) => {
      weekdays.forEach((day: any) => {
        timeTable
          .get(day)
          ?.get(slot)
          ?.forEach((item: any) => {
            if (
              !lecturerListTemp.includes(
                item.slice(item.indexOf("(") + 1, item.indexOf(")"))
              )
            ) {
              lecturerListTemp.push(
                item.slice(item.indexOf("(") + 1, item.indexOf(")"))
              );
              // lecturerListTemp.push(item.split("(")[1].replace(")", ""));
            }
          });
      });
    });
    setLecturerList(lecturerListTemp);
    localStorage.setItem(
      "expireAt",
      (Date.now() + 1000 * 60 * 60 * 24).toString()
    );
  };

  const handleToggleOldFeature = () => {
    document
      .getElementById("ctl00_mainContent_divMoveSubject")
      ?.classList.toggle("hidden");
    document
      .getElementById("ctl00_mainContent_divNewGroupInfo")
      ?.classList.toggle("hidden");
  };

  const MoveToFilledClass = () => (
    <div className="text-xl font-semibold flex gap-16 items-center mt-6">
      <a
        href="https://chromewebstore.google.com/detail/fptu-move-out-class-tool/bmpjlffjfcpkjhgfjgponabjhkfmjkcb/reviews"
        target="_blank"
        className="text-blue-500 hover:underline"
      >
        Feedback
      </a>
      <div className="flex gap-6">
        Move to filled class:
        <a
          href="https://www.facebook.com/trinh.thai.1111/"
          target="_blank"
          className="text-blue-500 hover:underline"
        >
          All campus
        </a>
      </div>
    </div>
  );

  const ShowOldFeature = () => (
    <div className="flex items-center gap-2 mt-4">
      <input
        id="showOldFeature"
        type="checkbox"
        defaultChecked={false}
        onChange={handleToggleOldFeature}
      />
      <label
        className="text-xl mb-0 mt-2 leading-none"
        htmlFor="showOldFeature"
      >
        Hiện chức năng FAP cũ
      </label>
    </div>
  );

  return (
    <div className="w-full">
      <div className="my-8">
        <Header
          isLoading={isLoading}
          refresh={refresh}
          handleStudentCount={handleStudentCount}
        />
        <FilterSection
          filter={filter}
          setFilter={setFilter}
          studentCount={studentCount}
          lecturerList={lecturerList}
          moveList={moveList}
          subject={subject}
          changeSubjectForm={changeSubjectForm}
          setIsLoading={setIsLoading}
          send={send}
        />
        {gotten < total && (
          <span className="my-4 flex gap-4 justify-between items-center w-full">
            <span className="text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-rotate-cw rotate"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </span>
            <progress
              value={gotten}
              max={total}
              className="w-full border border-zinc-500"
            />
          </span>
        )}
      </div>
      {isFull && (
        <div className="text-2xl mb-4">
          Nếu bạn có nhu cầu cần chuyển lớp đã full, liên hệ anh{" "}
          <a
            href="https://www.facebook.com/trinh.thai.1111/"
            target="_blank"
            rel="noreferrer"
          >
            Thái
          </a>{" "}
          (All cơ sở)
        </div>
      )}
      <Timetable
        timeTable={timeTable}
        filter={filter}
        studentCount={studentCount}
        getClassKey={getClassKey}
        sendTrackingEvent={sendTrackingEvent}
        setIsLoading={setIsLoading}
        formData={formData}
        setIsFull={setIsFull}
        subject={subject}
      />

      <ClassListDetails handleDownload={handleDownload} />
      <TimetableDetails />
      <MoveToFilledClass />
      <ShowOldFeature />
    </div>
  );
}
