import mongoose, { Schema } from "mongoose";

export interface IOutbox {
  _id: string;
  recipient: string;
  subject: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  lastError?: string;
  lockedAt?: Date | null;
  sentAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OutboxSchema = new Schema(
  {
    recipient: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    eventType: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["pending", "processing", "sent", "failed"],
      default: "pending",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    lockedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Compound index to help the sweeper query pending/failed outbox jobs efficiently
OutboxSchema.index({ status: 1, createdAt: 1 });

export default mongoose.models.Outbox || mongoose.model("Outbox", OutboxSchema);
