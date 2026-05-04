import { NextRequest } from "next/server";
import { demoCurrentUserId, savedItems } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET() {
  return ok(savedItems.filter((item) => item.userId === demoCurrentUserId));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.itemType || !body?.itemId) {
    return fail("itemType and itemId are required.", 422);
  }

  return ok(
    {
      id: `saved-${Date.now()}`,
      userId: demoCurrentUserId,
      itemType: body.itemType,
      itemId: body.itemId,
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
