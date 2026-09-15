import mongoose, { Schema } from "mongoose";

const FundraisingCampaignSchema = new Schema(
  {
    politicianId: { type: Schema.Types.ObjectId, ref: "Politician", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active", index: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.FundraisingCampaign || mongoose.model("FundraisingCampaign", FundraisingCampaignSchema);
