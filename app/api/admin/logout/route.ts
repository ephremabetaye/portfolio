import { clearAdminSessionCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/utilities";

export async function POST() {
  await clearAdminSessionCookie();
  return jsonOk({ authenticated: false });
}