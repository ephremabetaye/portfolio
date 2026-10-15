import { connectDB } from "@/lib/mongodb";
import { Skill } from "@/models/Skill";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { getDemoStore, isDemoMode, persistDemoStore } from "@/lib/demo-store";
import { isValidObjectId } from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = await req.json();
    if (isDemoMode()) {
      const store = getDemoStore();
      const idx = store.skills.findIndex((s: any) => s._id === id);
      if (idx === -1) return jsonError("Not found", 404);
      store.skills[idx] = { ...store.skills[idx], ...body, _id: id };
      persistDemoStore();
      return jsonOk(store.skills[idx]);
    }
    if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
    await connectDB();
    const item = await Skill.findByIdAndUpdate(id, body, { new: true });
    if (!item) return jsonError("Not found", 404);
    return jsonOk(item);
  } catch (e) {
    return jsonError("Failed to update", 500);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;
  if (isDemoMode()) {
    const store = getDemoStore();
    const idx = store.skills.findIndex((s: any) => s._id === id);
    if (idx === -1) return jsonError("Not found", 404);
    store.skills.splice(idx, 1);
    persistDemoStore();
    return jsonOk({ deleted: true });
  }
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  try {
    await connectDB();
    const item = await Skill.findByIdAndDelete(id);
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed to delete", 500);
  }
}