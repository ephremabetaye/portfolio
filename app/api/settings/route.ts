import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { enforceMediaField } from "@/lib/media";
import { getDemoStore, isDemoMode, persistDemoStore } from "@/lib/demo-store";

export async function GET() {
  if (isDemoMode()) return jsonOk(getDemoStore().settings);
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    return jsonOk(settings || {});
  } catch (e) {
    return jsonError("Database unavailable", 503);
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  try {
    const body = await req.json();
    if (isDemoMode()) {
      const store = getDemoStore();
      // Showreel is link-only (YouTube or Google Cloud/Drive); the logo, when set, is a Google Cloud/Drive image.
      const reelCheck = enforceMediaField("video", body, "showreelUrl", store.settings);
      if (!reelCheck.ok) return jsonError(reelCheck.error, 400);
      const logoCheck = enforceMediaField("image", body, "logoUrl", store.settings);
      if (!logoCheck.ok) return jsonError(logoCheck.error, 400);
      store.settings = { ...store.settings, ...body, _id: store.settings._id };
      persistDemoStore();
      return jsonOk(store.settings);
    }
    await connectDB();
    let settings = await SiteSettings.findOne();
    const reelCheck = enforceMediaField("video", body, "showreelUrl", settings as unknown as Record<string, unknown> | null);
    if (!reelCheck.ok) return jsonError(reelCheck.error, 400);
    const logoCheck = enforceMediaField("image", body, "logoUrl", settings as unknown as Record<string, unknown> | null);
    if (!logoCheck.ok) return jsonError(logoCheck.error, 400);
    if (!settings) settings = await SiteSettings.create(body);
    else {
      Object.assign(settings, body);
      await settings.save();
    }
    return jsonOk(settings);
  } catch (e) {
    return jsonError("Failed to update settings", 500);
  }
}