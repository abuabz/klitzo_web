import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/klitzo_web";

const OrderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

async function test() {
  await mongoose.connect(MONGODB_URI);
  const orders = await Order.find({ status: { $in: ["pending", "paid", "shipping"] } });
  
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
  
  let successCount = 0;
  
  for (const row of rows) {
    const { articleNumber, pincode, receiverName, eventDescription } = row;

    const matchedOrder = orders.find(o => {
      const oPincode = o.shippingAddress?.pincode?.toString().trim();
      const rPincode = pincode.toString().trim();
      
      console.log(`Checking DB Order: ${o.shippingAddress?.name} (${oPincode}) against Excel: ${receiverName} (${rPincode})`);

      if (oPincode !== rPincode) return false;

      const oName = (o.shippingAddress?.name || "").toLowerCase().trim();
      const rName = receiverName.toString().toLowerCase().trim();

      if (!oName || !rName) return false;

      const oFirstName = oName.split(" ")[0];
      const rFirstName = rName.split(" ")[0];

      return oName.includes(rName) || rName.includes(oName) || oFirstName === rFirstName;
    });
    
    if (matchedOrder) {
      console.log(`Matched! -> ${matchedOrder.shippingAddress?.name}`);
      successCount++;
    }
  }
  
  console.log(`Success Count: ${successCount}`);
  process.exit(0);
}
test();
