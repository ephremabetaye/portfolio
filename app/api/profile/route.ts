import { connectDB } from "@/lib/mongodb";
import { Profile } from "@/models/Profile";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
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
      store.profile = { ...store.profile, ...body, _id: store.profile._id };
      persistDemoStore();
      return jsonOk(store.profile);
    }
    await connectDB();
    let profile = await Profile.findOne();
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