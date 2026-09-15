import { NextResponse } from "next/server";

import { getPublicProjectList } from "@/lib/site/projects";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;
  const category = searchParams.get("category") || undefined;
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  const projects = await getPublicProjectList({ status, category, year });

  return NextResponse.json({ projects });
}
