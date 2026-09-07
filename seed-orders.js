const mongoose = require("mongoose");
const fs = require("fs");

const tsvData = `S.No	customer-id	customer-name	customer-type-id	customer-type	contract-id	payment-mode-code	payment_mode_description	book-channel-id	book-channel-name	book-type-id	book-type-name	user-id	user-name	article-number	article-type	booking-date-time	booking-office-pin	booking-office-id	booking-office-name	destination-country	destination-pin	destination-office-name	sender-name	sender-address	receiver-name	receiver-address	event-code	event-description	tarrif	weight	vp-cod-type	vp-cod-value	customer-bulk-reference	td-ntd	base-amount	file-upload
1	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740170IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	690542	Athinad North SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	ANANDU PRASAD	ATHINAD NORTH SO ATHINAD NORTH SO ATHINAD NORTH SO	1	Item Delivered(Addressee)	42.47	260		0	2642/888	NTD	36	hard copy
2	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740166IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	679575	Nannamukku SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	SHOUKATHALI	NANNAMUKKU SO NANNAMUKKU SO NANNAMUKKU SO	1	Item Delivered(Addressee)	57.81	630	cod	798	2642/889	NTD	49	hard copy
3	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740223IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	673004	Calicut City SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	THEJAS	PUTHIYARA SO PUTHIYARA SO PUTHIYARA SO	1	Item Delivered(Addressee)	42.47	260	cod	349	2642/890	NTD	36	hard copy
4	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740118IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	577124	Kalasa S.O	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	MAIDEEN	KALASA S.O KALASA S.O KALASA S.O	1	Item Delivered(Sender)	47.19	460	cod	549	2642/891	NTD	40	hard copy
5	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844739993IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	678544	Palampalakode SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	ASHARAF	PALAMPALAKODE SO PALAMPALAKODE SO PALAMPALAKODE SO	1	Item Delivered(Addressee)	42.47	460	cod	549	2642/892	NTD	36	hard copy
6	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740104IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	691003	Kavanad SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	PAUL	KAVANAD SO KAVANAD SO KAVANAD SO	1	Item Delivered(Addressee)	42.47	460	cod	549	2642/893	NTD	36	hard copy
7	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740002IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	670706	Kiliyanthara SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	JABIR PATTATH	KILIYANTHARA SO KILIYANTHARA SO KILIYANTHARA SO	1	Item Delivered(Addressee)	42.47	460	cod	549	2642/894	NTD	36	hard copy
8	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740237IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	670611	Mamba SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	ADINAN	MAMBA SO MAMBA SO MAMBA SO	1	Item Delivered(Addressee)	42.47	460	cod	549	2642/895	NTD	36	hard copy
9	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844739980IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	670141	Delivery Centre Taliparamba	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	MUTHALIB CP	TALIPARAMBA HO TALIPARAMBA HO TALIPARAMBA HO	1	Item Delivered(Addressee)	42.47	460	cod	549	2642/896	NTD	36	hard copy
10	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740016IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	678721	Kuttanur SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	MUSHAD S	KUTTANUR SO KUTTANUR SO KUTTANUR SO	1	Item Delivered(Addressee)	42.47	260	cod	349	2642/897	NTD	36	hard copy
11	1683565443	KLITZO MUHAMMED FAZIL	["1", "2"]	Individual, Bulk Customer	41132043	CO	Contract	I	Internal Portal	RBC	Registered Bulk Customer	10382317	MAHESH KUMAR  	EL844740245IN	SP_INLAND_PARCEL	2026/08/20T13:46:09	676304	22661430	Vengara MLP SO	India	678631	Kongad SO	KLITZO	AL JASEERA TRADE CITY MELMURI MALAPPURAM - 676519	BABU VA	KONGAD SO KONGAD SO KONGAD SO	1	Item Delivered(Addressee)	42.47	260	cod	349	2642/898	NTD	36	hard copy`;

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/klitzo");
  
  const OrderSchema = new mongoose.Schema(
    {
      userId: mongoose.Schema.Types.ObjectId,
      userEmail: String,
      userMobile: String,
      userName: String,
      productId: Number,
      productName: String,
      productImage: String,
      amount: Number,
      currency: { type: String, default: "INR" },
      status: { type: String, default: "pending" },
      shippingAddress: {
        name: String,
        phone: String,
        address: String,
        place: String,
        post: String,
        district: String,
        landmark: String,
        pincode: String,
      },
      notes: String,
      quantity: { type: Number, default: 1 },
      trackingId: String,
    },
    { timestamps: true }
  );

  const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

  const lines = tsvData.split("\n");
  const headers = lines[0].split("\t");
  
  const rcNameIdx = headers.indexOf("receiver-name");
  const pinIdx = headers.indexOf("destination-pin");
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split("\t");
    if (row.length < 2) continue;

    const receiverName = row[rcNameIdx];
    const destinationPin = row[pinIdx];
    
    await Order.create({
      userName: receiverName,
      userEmail: receiverName.toLowerCase().replace(" ", "") + "@example.com",
      productName: "Test Product Added From Script",
      amount: 500,
      status: "pending",
      shippingAddress: {
        name: receiverName,
        pincode: destinationPin,
        address: "Test address"
      }
    });
  }

  console.log("Successfully seeded 11 test orders without tracking ID.");
  process.exit(0);
}

seed().catch(console.error);
