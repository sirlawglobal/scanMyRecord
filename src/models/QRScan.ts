import mongoose, { Schema } from "mongoose";

const QRScanSchema = new Schema(
  {
    qrCodeId: { type: Schema.Types.ObjectId, ref: "QRCode", required: true, index: true },
    userAgent: { type: String, default: "" },
    ipHash: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.QRScan || mongoose.model("QRScan", QRScanSchema);
