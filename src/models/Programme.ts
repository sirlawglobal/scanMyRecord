import mongoose, { Schema } from "mongoose";

const ProgrammeSchema = new Schema(
  {
    politicianId: { type: Schema.Types.ObjectId, ref: "Politician", required: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["active", "paused", "closed"], default: "active", index: true },
    registrationOpen: { type: Boolean, default: true },
    capacity: { type: Number, default: null },
    registrationDeadline: { type: Date, default: null },
    images: [{ type: String }],
    fields: [{ type: Schema.Types.ObjectId, ref: "ProgrammeField" }],
  },
  { timestamps: true },
);

export default mongoose.models.Programme || mongoose.model("Programme", ProgrammeSchema);
