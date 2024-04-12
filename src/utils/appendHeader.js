// import { getData } from "./getData";

export const appendHeader = () => {
  const tableContainer = document.querySelector(
    "#aspnetForm > table > tbody > tr:nth-child(1) > td > div > h2"
  );

  const row1 = document.createElement("div");
  row1.innerText = "Lop1";
  const row2 = document.createElement("div");
  row2.innerText = "Lop2";
  //   row.classList.add("");
  // const data = getData("https://fap.fpt.edu.vn/Course/Groups.aspx?group=39459");
  // console.log(data);
  // row1.onclick = (e: any) => {};

  // row2.onclick = (e: any) => {};

  tableContainer.appendChild(row1);
  tableContainer.appendChild(row2);
};
