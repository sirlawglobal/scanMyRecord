import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    politicianId: { type: Schema.Types.ObjectId, ref: "Politician", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, default: "" },
    status: { type: String, enum: ["completed", "ongoing", "proposed"], default: "proposed", index: true },
    category: { type: String, required: true, index: true },
    year: { type: Number, index: true },
    location: { type: String, default: "" },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    images: [{ type: String }],
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
