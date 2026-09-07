import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    fromName: { type: String, required: true },
    fromAddress: { type: String, required: true },
    fromMobile: { type: String, required: true },
    customerId: { type: String, required: true },
    contractId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
