import * as cheerio from "cheerio";
export const getData = async (url) => {
  let rows = [];
  let data = await (await fetch(url)).text();
  const $ = cheerio.load(data);
  $("#id tbody tr").each((i, e) => {
    rows.push({
      student_id: $(e).find("td:nth-child(3)").text(),
      name: [
        $(e).find("td:nth-child(4)").text(),
        $(e).find("td:nth-child(5)").text(),
        $(e).find("td:nth-child(6)").text(),
      ].join(" "),
    });
  });
  return rows;
};
