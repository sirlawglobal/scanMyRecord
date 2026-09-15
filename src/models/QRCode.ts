import mongoose, { Schema } from "mongoose";

const QRCodeSchema = new Schema(
  {
    politicianId: { type: Schema.Types.ObjectId, ref: "Politician", required: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    targetType: { type: String, enum: ["politician", "project", "programme", "fundraising"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
  },
  { timestamps: true },
);

export default mongoose.models.QRCode || mongoose.model("QRCode", QRCodeSchema);
