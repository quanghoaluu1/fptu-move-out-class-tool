import React from "react";
import { weekdays, slots } from "../constants/classData";
import { textToColor } from "../utils";

interface TimetableProps {
  timeTable: Map<string, Map<string, string[]>> | undefined;
  filter: any;
  studentCount: any;
  getClassKey: () => Map<string, string>;
  sendTrackingEvent: () => Promise<void>;
  setIsLoading: (value: any) => void;
  formData: any;
  setIsFull: (value: boolean) => void;
  subject: string;
}

const Timetable: React.FC<TimetableProps> = ({
  timeTable,
  filter,
  studentCount,
  getClassKey,
  sendTrackingEvent,
  setIsLoading,
  formData,
  setIsFull,
  subject,
}) => {
  const handleClassClick = async (item: string) => {
    const userConfirmed = window.confirm(
      `Bạn có chắc muốn chuyển qua lớp ${item} không?`
    );
    if (userConfirmed) {
      await sendTrackingEvent();
      setIsLoading((prev: any) => ({
        ...prev,
        moving: true,
      }));

      const classId = getClassKey().get(item.split(" ")[0]);
      formData.set("ctl00$mainContent$dllCourse", classId);
      formData.set("ctl00$mainContent$btSave", "Save");
      fetch(window.location.href, {
        method: "POST",
        headers: {},
        body: formData,
        priority: "high",
      })
        .then((res) => res.text())
        .then((text) => {
          const alertTextRegex = /alert\('([^']*)'\)/;
          const match = text.match(alertTextRegex);
          let res = match?.[1]?.replaceAll("</br>", "\n");
          if (res) {
            alert(res);
            if (res?.includes("Bạn không thể chuyển tới lớp này, bởi vì")) {
              setIsFull(true);
            }
            if (res?.includes("đã được chấp nhận")) {
              const url = new URL(window.location.href);
              if (classId) {
                url.searchParams.set("id", classId);
              }
              window.location.href = url.toString();
            } else if (
              res?.includes("Bạn không thể chuyển tới lớp này, bởi vì")
            ) {
              setIsFull(true);
            }
          } else {
            alert("Bạn đã ở trong lớp này rồi");
          }
          setIsLoading((prev: any) => ({
            ...prev,
            moving: false,
          }));
        });
    }
  };

  return (
    <table className="w-full rounded-lg">
      <thead>
        <tr className="">
          <td className="text-white bg-blue-500 font-bold border p-2 w-[100px] text-center"></td>
          {weekdays.map((day) => (
            <td
              key={day}
              className="text-white bg-blue-500 font-bold border px-2 py-3 w-[200px] text-center"
            >
              <label
                htmlFor={day}
                className="flex justify-center items-center gap-2 !m-0 cursor-pointer"
              >
                <input
                  defaultChecked
                  className="!mt-0"
                  type="checkbox"
                  id={day}
                  checked={!filter.excludeWeekdays.includes(day)}
                  onChange={(e) => {}}
                />
                {day}
              </label>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {slots.map((slot: any) => (
          <tr className="" key={slot}>
            <td className="text-white bg-blue-500 font-bold border w-[80px] text-center px-3 py-4 m-auto">
              <label
                htmlFor={slot}
                className="flex justify-center items-center gap-2 !m-0 cursor-pointer"
              >
                <input
                  defaultChecked
                  className="!mt-0"
                  type="checkbox"
                  id={slot}
                  checked={!filter.excludeSlots.includes(slot)}
                  onChange={(e) => {}}
                />
                Slot {slot}
              </label>
            </td>
            {weekdays.map((day) => (
              <td
                key={day}
                className="border col-span-1 p-2 w-[200px]"
                onClick={() => {}}
              >
                {timeTable
                  ?.get(day)
                  ?.get(slot)
                  ?.map((item: string) => {
                    return (
                      <div
                        key={item}
                        className={`border-[0.5px] border-black font-bold p-2 rounded-md mb-2 bg-opacity-5 cursor-pointer hover:scale-[1.03] duration-200 ${
                          item.includes(filter.lecturer) &&
                          item
                            .toLocaleLowerCase()
                            .includes(filter.classId.toLowerCase()) &&
                          (Object.keys(studentCount).length > 0
                            ? studentCount?.[item.split(" ")[0]] <=
                              filter.studentCount
                            : true) &&
                          !filter.excludeWeekdays.includes(day) &&
                          !filter.excludeSlots.includes(slot)
                            ? ""
                            : "hidden"
                        }`}
                        style={{
                          backgroundColor: textToColor(item),
                        }}
                        title={getClassKey().get(item.split(" ")[0]) || ""}
                        onClick={() => handleClassClick(item)}
                      >
                        {item.split("\n").map((line, index) => (
                          <React.Fragment key={line + index}>
                            {line}
                            <br />
                          </React.Fragment>
                        ))}
                        <span className="text-lg mt-1">
                          {`${studentCount?.[item.split(" ")[0]] ?? ""} ${
                            studentCount?.[item.split(" ")[0]] ? "students" : ""
                          }`}
                        </span>
                      </div>
                    );
                  })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Timetable;
