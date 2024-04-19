import { useEffect, useState } from "react";
import * as cheerio from "cheerio";
import { classData, slots, weekdays } from "./constants/classData";
import { formGetter, secondFormGetter } from "./constants/formData";

export default function App() {
  const url = window.location.href;
  const id = url.slice(url.indexOf("=") + 1);
  const baseUrl = window.location.origin + window.location.pathname;
  const formData = formGetter(id);
  let secondId = "";
  const [timeTable, setTimeTable] =
    useState<Map<string, Map<string, string[]>>>(classData);
  const [total, setTotal] = useState(0);
  const [gotten, setGotten] = useState(0);
  useEffect(() => {
    (async () => {
      const data: string =
        document.querySelector("#ctl00_mainContent_dllCourse")?.innerHTML || "";
      const $ = cheerio.load(data);
      const classes = new Map<string, string>();
      classes.set(
        id,
        document.getElementById("ctl00_mainContent_lblOldGroup")?.innerText ||
          ""
      );
      $("option").each((_i, e) => {
        const value = $(e).attr("value");
        if (value) {
          secondId = value;
          classes.set(value, $(e).text());
        }
      });
      setTotal(classes.size);
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
        const weekday = classInfo.slice(0, 3);
        const slot = classInfo.slice(11, 12);
        const updatedClassData = new Map(classData); // Create a new map object
        const slotMap =
          updatedClassData.get(weekday) || new Map<string, string[]>();
        const classNames = slotMap.get(slot) || [];
        classNames.push(className);
        slotMap.set(slot, classNames);
        updatedClassData.set(weekday, slotMap);
        setGotten((prev) => prev + 1);
        setTimeTable(updatedClassData);
      }
    })();
  }, []);

  return (
    <div>
      <progress value={gotten} max={total}>
        {gotten}%
      </progress>
      <table>
        <thead>
          <tr>
            <td></td>
            {weekdays.map((day) => (
              <td className="text-red-500 font-bold border">{day}</td>
            ))}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot: any) => (
            <tr>
              <td className="text-red-500 font-bold border">Slot {slot}</td>
              {weekdays.map((day) => (
                <td className="border">
                  {timeTable?.get(day)?.get(slot)?.join(", ")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
