import React from "react";

export default function Test() {
  return (
    <div>
      <div
        className="p-2 rounded-md bg-blue-400"
        onClick={async () => {
          const __VIEWSTATE = encodeURIComponent(
            document.getElementById("__VIEWSTATE")?.getAttribute("value") || ""
          );
          const __VIEWSTATEGENERATOR = encodeURIComponent(
            document
              .getElementById("__VIEWSTATEGENERATOR")
              ?.getAttribute("value") || ""
          );
          const __EVENTVALIDATION = encodeURIComponent(
            document
              .getElementById("__EVENTVALIDATION")
              ?.getAttribute("value") || ""
          );
          const ctl00$mainContent$lblNewCoureId = "49960";
          const rollNumber = "se182394";
          await fetch("https://fap.fpt.edu.vn/Schedule/CrossChange.aspx", {
            headers: {
              accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
              "cache-control": "max-age=0",
              "content-type": "application/x-www-form-urlencoded",
              priority: "u=0, i",
              "sec-ch-ua":
                '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
              "sec-ch-ua-arch": '"x86"',
              "sec-ch-ua-bitness": '"64"',
              "sec-ch-ua-full-version": '"131.0.2903.70"',
              "sec-ch-ua-full-version-list":
                '"Microsoft Edge";v="131.0.2903.70", "Chromium";v="131.0.6778.86", "Not_A Brand";v="24.0.0.0"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-model": '""',
              "sec-ch-ua-platform": '"Windows"',
              "sec-ch-ua-platform-version": '"10.0.0"',
              "sec-fetch-dest": "document",
              "sec-fetch-mode": "navigate",
              "sec-fetch-site": "same-origin",
              "sec-fetch-user": "?1",
              "upgrade-insecure-requests": "1",
            },
            referrer: "https://fap.fpt.edu.vn/Schedule/CrossChange.aspx",
            referrerPolicy: "same-origin",
            body: `__EVENTTARGET=ctl00%24mainContent%24ddlSelfClass&__EVENTARGUMENT=&__LASTFOCUS=&__VIEWSTATE=${__VIEWSTATE}&__VIEWSTATEGENERATOR=${__VIEWSTATEGENERATOR}&__EVENTVALIDATION=${__EVENTVALIDATION}&ctl00%24mainContent%24ddlSelfClass=49959&ctl00%24mainContent%24txtRollNumber=${rollNumber}&ctl00%24mainContent%24lblNewCoureId=${ctl00$mainContent$lblNewCoureId}&ctl00%24mainContent%24hdException=`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          });
        }}
      >
        Ahihi
      </div>
    </div>
  );
}
