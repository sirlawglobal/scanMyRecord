import mongoose, { Schema } from "mongoose";

const PoliticianSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    office: { type: String, required: true },
    constituency: { type: String, required: true },
    servicePeriod: { type: String, required: true },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    socialLinks: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true },
);

export default mongoose.models.Politician || mongoose.model("Politician", PoliticianSchema);
