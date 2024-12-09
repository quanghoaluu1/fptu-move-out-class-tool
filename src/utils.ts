import * as cheerio from "cheerio";

export function mapToObject(map: Map<string, Map<string, string[]>>) {
  const obj: any = {};
  map.forEach((value, key: any) => {
    obj[key] = {};
    value.forEach((innerValue, innerKey) => {
      obj[key][innerKey] = innerValue;
    });
  });
  return obj;
}

export function objectToMap(obj: any): Map<string, Map<string, string[]>> {
  const map = new Map<string, Map<string, string[]>>();
  for (const [key, value] of Object.entries(obj as { [s: string]: unknown })) {
    const innerMap = new Map<string, string[]>();
    for (const [innerKey, innerValue] of Object.entries(
      value as { [s: string]: string[] }
    )) {
      innerMap.set(innerKey, innerValue);
    }
    map.set(key, innerMap);
  }
  return map;
}

export const textToColor = (text: string): string => {
  const intensity = 120;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 255;
    // Increase each RGB component to make the color lighter
    value = Math.min(value + intensity, 255); // Add 100 to make it lighter
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

export const getClassKey = (): any => {
  const id = window.location.href.slice(window.location.href.indexOf("=") + 1);

  const data: string =
    document.querySelector("#ctl00_mainContent_dllCourse")?.innerHTML || "";
  const $ = cheerio.load(data);
  const classes = new Map<string, string>();
  classes.set(
    document.getElementById("ctl00_mainContent_lblOldGroup")?.innerText || "",
    id
  );
  $("option").each((_i, e) => {
    const value = $(e).attr("value");
    if (value) {
      classes.set($(e).text(), value);
    }
  });

  return classes;
};
