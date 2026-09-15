import { NextResponse } from "next/server";
import { createDonation } from "@/services/fundraising.service";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await createDonation(body);

    if (!result.ok) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({ reference: result.reference, authorizationUrl: result.authorizationUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
