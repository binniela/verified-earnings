import { getAdminQueue } from "@/lib/data";
import { ok } from "@/lib/api-utils";

export async function GET() {
  return ok(
    getAdminQueue().map((item) => ({
      ...item,
      signedUrlExpiresInSeconds: 60,
    })),
  );
}
