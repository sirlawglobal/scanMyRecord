import mongoose, { Schema } from "mongoose";

const RegistrationSchema = new Schema(
  {
    programmeId: { type: Schema.Types.ObjectId, ref: "Programme", required: true, index: true },
    reference: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

RegistrationSchema.index({ email: 1, programmeId: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
