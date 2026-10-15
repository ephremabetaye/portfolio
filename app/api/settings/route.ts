import { connectDB } from "@/lib/mongodb";
import { SiteSettings } from "@/models/SiteSettings";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
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
      store.settings = { ...store.settings, ...body, _id: store.settings._id };
      persistDemoStore();
      return jsonOk(store.settings);
    }
    await connectDB();
    let settings = await SiteSettings.findOne();
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