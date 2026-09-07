import * as XLSX from "xlsx";
import * as fs from "fs";

const data = [
  {
    "article-number": "EL844740170IN",
    "destination-pin": "690542",
    "receiver-name": "ANANDU PRASAD",
    "event-description": "Item Delivered(Addressee)"
  },
  {
    "article-number": "EL844740166IN",
    "destination-pin": "679575",
    "receiver-name": "SHOUKATHALI",
    "event-description": "Item Dispatched"
  },
  {
    "article-number": "EL844740223IN",
    "destination-pin": "673004",
    "receiver-name": "THEJAS",
    "event-description": "Item Delivered(Addressee)"
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

XLSX.writeFile(workbook, "sample_india_post.xlsx");
console.log("sample_india_post.xlsx created successfully!");
