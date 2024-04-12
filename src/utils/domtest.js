export const appendToPage = (rows) => {
  // Create a table element
  const tableContainer = document.querySelector(
    "#aspnetForm > table > tbody > tr:nth-child(1) > td > div > h2"
  );
  const table = document.createElement("table");

  // Create the table head (thead) element
  const thead = document.createElement("thead");

  // Create the table row (tr) for the head
  const headRow = document.createElement("tr");

  // Create the table data (td) for each header
  ["Student ID", "Name"].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headRow.appendChild(th);
  });

  // Append the head row to the thead
  thead.appendChild(headRow);

  // Append the thead to the table
  table.appendChild(thead);

  // Create the table body (tbody) element
  const tbody = document.createElement("tbody");

  // Iterate over each item in the rows array and create a row for each
  rows.forEach((item) => {
    // Create a table row (tr)
    const row = document.createElement("tr");

    // Create a table data (td) for student ID
    const idCell = document.createElement("td");
    idCell.textContent = item.student_id;
    console.log(item.student_id);

    // Create a table data (td) for name
    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;

    // Append the cells to the row
    row.appendChild(idCell);
    row.appendChild(nameCell);

    // Append the row to the tbody
    tbody.appendChild(row);
  });
  // Append the tbody to the table
  table.appendChild(tbody);

  // Now, you can append the table to a container in your HTML document, for example:
  // const container = document.getElementById('container');
  // container.appendChild(table);
  tableContainer.append(table);
};
