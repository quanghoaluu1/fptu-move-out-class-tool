import { useEffect, useState } from "react";
import * as cheerio from "cheerio";
import { classData, slots, weekdays } from "./constants/classData";
import { formGetter, secondFormGetter } from "./constants/formData";
import { textToColor, mapToObject, objectToMap } from "./utils";

export default function App() {
  // Setup metadata
  const url = window.location.href;
  const id = url.slice(url.indexOf("=") + 1);
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

  useEffect(() => {
    crawlAndSave();
  }, []);

  const refresh = async () => {
    localStorage.removeItem(subject);
    window.location.reload();
  };

  const crawlAndSave = async () => {
    // Check cached or not
    if (timeTableData) {
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
    const secondFormData = await secondFormGetter(secondId, id);
    for (const [key, _item] of classes) {
      formData.set("ctl00$mainContent$dllCourse", key);
      let nextClass;
      if (key == id) {
        nextClass = await (
          await fetch(baseUrl + `?id=${secondId}`, {
            method: "POST",
            headers: {},
            body: secondFormData,
          })
        ).text();
      } else {
        nextClass = await (
          await fetch(window.location.href, {
            method: "POST",
            headers: {},
            body: formData,
          })
        ).text();
      }
      const $$ = cheerio.load(nextClass);
      const classInfo = $$("#ctl00_mainContent_lblNewSlot").text();
      const className = $$(
        "#ctl00_mainContent_dllCourse > option:selected"
      ).text();
      const classDetail = classInfo.split(",");
      for (const detail of classDetail) {
        const weekday = detail.slice(0, 3);
        const slot = detail.slice(11, 12);
        const lecture = detail.slice(detail.indexOf("Lecture:") + 9);

        if (weekdays.indexOf(weekday) >= 0) {
          const updatedClassData = new Map(classData); // Create a new map object
          const slotMap =
            updatedClassData.get(weekday) || new Map<string, string[]>();
          const classNames = slotMap.get(slot) || [];
          classNames.push(
            className + ` (${lecture.length > 0 ? lecture : "N/A"})`
          );
          slotMap.set(slot, classNames);
          updatedClassData.set(weekday, slotMap);
          setTimeTable(updatedClassData);
        }
      }
      setGotten((prev) => prev + 1);
    }
    localStorage.setItem(subject, JSON.stringify(mapToObject(timeTable)));
  };

  return (
    <div className="w-full">
      <div className="my-8">
        <span
          onClick={refresh}
          className="font-bold p-2 text-white text-3xl rounded-md bg-green-500 cursor-pointer"
        >
          Refresh timetable
        </span>
        {gotten < total && (
          <span className="my-4 flex gap-4 justify-between items-center w-full">
            <span className="text-2xl">Loading...</span>
            <progress value={gotten} max={total} className="w-full" />
          </span>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr className="">
            <td></td>
            {weekdays.map((day) => (
              <td className="text-white bg-blue-500 font-bold border p-2 w-[200px] text-center">
                {day}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot: any) => (
            <tr className="">
              <td className="text-white bg-blue-500 font-bold border w-[80px] text-center py-2 m-auto">
                Slot {slot}
              </td>
              {weekdays.map((day) => (
                <td className="border col-span-1 p-2 w-[200px]">
                  {timeTable
                    ?.get(day)
                    ?.get(slot)
                    ?.map((item: string) => {
                      return (
                        <div
                          className="border-[0.5px] border-black font-bold p-2 rounded-md mb-2 bg-opacity-10"
                          style={{
                            backgroundColor: textToColor(item),
                            // color: "black",
                          }}
                        >
                          {item}
                        </div>
                      );
                    })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
