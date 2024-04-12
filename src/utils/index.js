import { appendHeader } from "./appendHeader.js";
import { getData } from "./getData.js";

appendHeader();
(async () => {
  let data = await getData();
  console.log(data);
  console.log("get data success ahihi");
})();
