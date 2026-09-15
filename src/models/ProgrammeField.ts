import mongoose, { Schema } from "mongoose";

const ProgrammeFieldSchema = new Schema(
  {
    programmeId: { type: Schema.Types.ObjectId, ref: "Programme", required: true, index: true },
    label: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "email", "number", "select", "textarea", "date"],
      default: "text",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { timestamps: true },
);

export default mongoose.models.ProgrammeField || mongoose.model("ProgrammeField", ProgrammeFieldSchema);
