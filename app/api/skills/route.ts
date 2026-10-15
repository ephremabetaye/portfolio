import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { getDemoStore, isDemoMode, nextDemoId, persistDemoStore } from "@/lib/demo-store";

export async function GET() {
  if (isDemoMode()) return jsonOk([...getDemoStore().skills].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
  try {
    await connectDB();
    const items = await Skill.find().sort({ order: 1, createdAt: 1 }).lean();
    return jsonOk(items);
  } catch (e) {
    return jsonError("Database unavailable", 503);
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  try {
    const body = await req.json();
    if (isDemoMode()) {
      const store = getDemoStore();
      const item = { ...body, _id: nextDemoId("s") };
      store.skills.push(item);
      persistDemoStore();
      return jsonOk(item, 201);
    }
    await connectDB();
    const item = await Skill.create(body);
    return jsonOk(item, 201);
  } catch (e) {
    return jsonError("Failed to create skill", 500);
  }
}