import mongoose, { Schema } from "mongoose";

const DonationSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "FundraisingCampaign", required: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    donorName: { type: String, default: "Anonymous" },
    donorEmail: { type: String, default: "" },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending", index: true },
    paymentReference: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export default mongoose.models.Donation || mongoose.model("Donation", DonationSchema);
