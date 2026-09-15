import { NextResponse } from "next/server";
import { getRegistrationByReference } from "@/services/registration.service";

export async function GET(_request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const registration = await getRegistrationByReference(reference);

  if (!registration) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(registration);
}
