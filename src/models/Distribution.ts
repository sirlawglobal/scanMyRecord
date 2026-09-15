import mongoose, { Schema } from "mongoose";

const DistributionSchema = new Schema(
  {
    programmeId: { type: Schema.Types.ObjectId, ref: "Programme", required: true, index: true },
    registrationId: { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    distributedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Distribution || mongoose.model("Distribution", DistributionSchema);
