import { db } from "@/lib/db";
import { slugify } from "@/lib/validation";

export async function listCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { music: true } } }
  });
}

export async function createCategory(data: { name: string; description?: string | null; icon?: string | null }) {
  return db.category.create({
    data: { ...data, slug: slugify(data.name) }
  });
}

export async function updateCategory(id: string, data: { name: string; description?: string | null; icon?: string | null }) {
  return db.category.update({
    where: { id },
    data: { ...data, slug: slugify(data.name) }
  });
}

export async function deleteCategory(id: string, moveToCategoryId?: string | null) {
  const count = await db.music.count({ where: { categoryId: id } });
  if (count > 0 && moveToCategoryId === undefined) {
    return { blocked: true, count };
  }

  await db.$transaction(async (tx) => {
    await tx.music.updateMany({
      where: { categoryId: id },
      data: { categoryId: moveToCategoryId || null }
    });
    await tx.category.delete({ where: { id } });
  });

  return { blocked: false, count };
}
