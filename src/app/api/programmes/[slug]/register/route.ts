import { NextResponse } from "next/server";
import { createRegistration } from "@/services/registration.service";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const result = await createRegistration(slug, body);

    if (!result.ok) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({ reference: result.reference }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
}
