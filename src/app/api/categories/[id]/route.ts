import { NextRequest, NextResponse } from "next/server";
import { categoryPayloadSchema } from "@/lib/validation";
import { deleteCategory, updateCategory } from "@/services/category.service";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const payload = categoryPayloadSchema.parse(await request.json());
    return NextResponse.json(await updateCategory(id, payload));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to update category." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const moveToCategoryId = mode === "move" ? searchParams.get("moveToCategoryId") : mode === "remove" ? null : undefined;
    const result = await deleteCategory(id, moveToCategoryId);
    const status = result.blocked ? 409 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Failed to delete category." }, { status: 400 });
  }
}
