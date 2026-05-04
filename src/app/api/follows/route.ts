import { NextRequest } from "next/server";
import { demoCurrentUserId, follows } from "@/lib/seed-data";
import { fail, ok } from "@/lib/api-utils";

export async function GET() {
  return ok(follows.filter((follow) => follow.userId === demoCurrentUserId));
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.targetType || !body?.targetValue) {
    return fail("targetType and targetValue are required.", 422);
  }

  return ok(
    {
      id: `follow-${Date.now()}`,
      userId: demoCurrentUserId,
      targetType: body.targetType,
      targetValue: body.targetValue,
      createdAt: new Date().toISOString(),
    },
    { status: 201 },
  );
}
