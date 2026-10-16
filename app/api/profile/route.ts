import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { enforceMediaField } from "@/lib/media";
import { getDemoStore, isDemoMode, persistDemoStore } from "@/lib/demo-store";

export async function GET() {
  if (isDemoMode()) return jsonOk(getDemoStore().profile);
  try {
    await connectDB();
    const profile = await Profile.findOne().lean();
    return jsonOk(profile || {});
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
      // Profile photos are link-only: Google Cloud/Drive links, or a YouTube thumbnail.
      const imageCheck = enforceMediaField("image", body, "image", store.profile);
      if (!imageCheck.ok) return jsonError(imageCheck.error, 400);
      store.profile = { ...store.profile, ...body, _id: store.profile._id };
      persistDemoStore();
      return jsonOk(store.profile);
    }
    await connectDB();
    let profile = await Profile.findOne();
    const imageCheck = enforceMediaField("image", body, "image", profile as unknown as Record<string, unknown> | null);
    if (!imageCheck.ok) return jsonError(imageCheck.error, 400);
    if (!profile) profile = await Profile.create(body);
    else {
      Object.assign(profile, body);
      await profile.save();
    }
    return jsonOk(profile);
  } catch (e) {
    return jsonError("Failed to update profile", 500);
  }
}