import fetch from "node-fetch";

const rows = [
  {
    "articleNumber": "EL844740170IN",
    "pincode": "690542",
    "receiverName": "ANANDU PRASAD",
    "eventDescription": "Item Delivered(Addressee)"
  },
  {
    "articleNumber": "EL844740166IN",
    "pincode": "679575",
    "receiverName": "SHOUKATHALI",
    "eventDescription": "Item Delivered(Addressee)"
  },
  {
    "articleNumber": "EL844740223IN",
    "pincode": "673004",
    "receiverName": "THEJAS",
    "eventDescription": "Item Delivered(Addressee)"
  }
];

async function test() {
  const res = await fetch("http://localhost:3000/api/orders/bulk-tracking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminEmail: "adminklitzo@gmail.com", rows })
  });
  
  const data = await res.json();
  console.log(data);
}
test();
