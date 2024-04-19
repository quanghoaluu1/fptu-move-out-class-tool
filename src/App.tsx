import { useEffect, useState } from "react";
import * as cheerio from "cheerio";
import { classData, slots, weekdays } from "./constants/classData";

export default function App() {
  const __EVENTTARGET = document
    .getElementById("__EVENTTARGET")
    ?.getAttribute("value");
  const __EVENTARGUMENT = document
    .getElementById("__EVENTARGUMENT")
    ?.getAttribute("value");
  const __LASTFOCUS = document
    .getElementById("__LASTFOCUS")
    ?.getAttribute("value");
  const __VIEWSTATEGENERATOR = document
    .getElementById("__VIEWSTATEGENERATOR")
    ?.getAttribute("value");
  const __VIEWSTATE = document
    .getElementById("__VIEWSTATE")
    ?.getAttribute("value");
  const __EVENTVALIDATION = document
    .getElementById("__EVENTVALIDATION")
    ?.getAttribute("value");
  const url = window.location.href;
  const id = url.slice(url.indexOf("=") + 1);

  const formData = new FormData();
  formData.append("__EVENTTARGET", "ctl00$mainContent$dllCourse");
  formData.append("__EVENTARGUMENT", __EVENTARGUMENT || "");
  formData.append("__LASTFOCUS", __LASTFOCUS || "");
  formData.append("__EVENTVALIDATION", __EVENTVALIDATION || "");
  formData.append("__VIEWSTATE", __VIEWSTATE || "");
  formData.append("__VIEWSTATEGENERATOR", __VIEWSTATEGENERATOR || "");
  formData.append("ctl00$mainContent$dllCourse", id + "");
  formData.append("ctl00$mainContent$hdException", "");
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
      let secondId;
      classes.set(
        id,
        document.getElementById("ctl00_mainContent_lblOldGroup")?.innerText ||
          ""
      );
      $("option").each((_i, e) => {
        const value = $(e).attr("value");
        secondId = value;
        if (value) {
          classes.set(value, $(e).text());
        }
      });
      console.log(classes);
      setTotal(classes.size);

      for (const [key, _item] of classes) {
        formData.set("ctl00$mainContent$dllCourse", key);
        if (key == id) {
          // formData.set("ctl00$mainContent$dllCourse", secondId);
        }
        const nextClass = await (
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
