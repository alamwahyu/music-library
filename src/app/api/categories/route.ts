import { NextRequest, NextResponse } from "next/server";
import { categoryPayloadSchema } from "@/lib/validation";
import { createCategory, listCategories } from "@/services/category.service";

export async function GET() {
  return NextResponse.json(await listCategories());
}

export async function POST(request: NextRequest) {
  try {
    const payload = categoryPayloadSchema.parse(await request.json());
    const category = await createCategory(payload);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to create category." }, { status: 400 });
  }
}
