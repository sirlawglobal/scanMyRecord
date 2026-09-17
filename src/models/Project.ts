import mongoose, { Schema } from "mongoose";

const ProjectMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], default: "image" },
    stage: { type: String, enum: ["before", "after", "general"], default: "general" },
    caption: { type: String, default: "" },
  },
  { _id: false },
);

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
    // Legacy flat gallery, kept for backward compatibility with existing
    // records; new writes derive this from `media`. Prefer `media` for reads.
    images: [{ type: String }],
    media: [ProjectMediaSchema],
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
