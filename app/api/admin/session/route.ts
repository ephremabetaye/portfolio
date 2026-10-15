import { getAdminSession } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/utilities";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  return jsonOk({ authenticated: true, email: session });
}