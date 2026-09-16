import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectToDatabase, hasValidMongoUri } from "@/lib/db/connection";
import Outbox, { type IOutbox } from "@/models/Outbox";
import {
  renderRegistrationConfirmationEmail,
  type RegistrationEmailPayload,
} from "@/lib/email/templates/registration-confirmation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!hasValidMongoUri()) {
    return NextResponse.json({ message: "Database not connected" }, { status: 500 });
  }

  const { id } = await params;

  await connectToDatabase();
  const job = (await Outbox.findById(id).lean()) as IOutbox | null;

  if (!job) {
    return NextResponse.json({ message: "Outbox item not found" }, { status: 404 });
  }

  let html = "";
  let text = "";

  if (job.eventType === "programme.registration") {
    const rendered = renderRegistrationConfirmationEmail(
      job.payload as unknown as RegistrationEmailPayload,
    );
    html = rendered.html;
    text = rendered.text;
  } else {
    html = `<div style="font-family: sans-serif; padding: 20px;"><h3>${job.subject}</h3><p>Recipient: ${job.recipient}</p></div>`;
    text = job.subject;
  }

  return NextResponse.json({
    item: job,
    html,
    text,
  });
}
