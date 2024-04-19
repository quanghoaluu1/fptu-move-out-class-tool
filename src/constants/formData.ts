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

const formGetter = () => {
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
  return formData;
};
