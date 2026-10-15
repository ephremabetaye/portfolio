import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, safeUrl } from "@/lib/utilities";
import { getDemoStore, isDemoMode, persistDemoStore } from "@/lib/demo-store";
import { isValidObjectId } from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (isDemoMode()) {
    const item = getDemoStore().projects.find((p: any) => p._id === id || p.slug === id);
    if (!item || !item.published) return jsonError("Not found", 404);
    return jsonOk(item);
  }
  try {
    await connectDB();
    const session = await getAdminSession();
    let item = null;
    if (isValidObjectId(id)) item = await Project.findById(id).lean();
    if (!item) item = await Project.findOne({ slug: id }).lean();
    if (!item) return jsonError("Not found", 404);
    if (!session && !item.published) return jsonError("Not found", 404);
    return jsonOk(item);
  } catch (e) {
    return jsonError("Database unavailable", 503);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = await req.json();
    body.thumbnail = body.thumbnail !== undefined ? safeUrl(body.thumbnail) : body.thumbnail;
    body.videoUrl = body.videoUrl !== undefined ? safeUrl(body.videoUrl) : body.videoUrl;
    if (isDemoMode()) {
      const store = getDemoStore();
      const idx = store.projects.findIndex((p: any) => p._id === id);
      if (idx === -1) return jsonError("Not found", 404);
      store.projects[idx] = { ...store.projects[idx], ...body, _id: id, updatedAt: new Date().toISOString() };
      persistDemoStore();
      return jsonOk(store.projects[idx]);
    }
    if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
    await connectDB();
    const item = await Project.findByIdAndUpdate(id, body, { new: true });
    if (!item) return jsonError("Not found", 404);
    return jsonOk(item);
  } catch (e: any) {
    if (e?.code === 11000) return jsonError("Slug already exists", 409);
    return jsonError("Failed to update", 500);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);
  const { id } = await params;
  if (isDemoMode()) {
    const store = getDemoStore();
    const idx = store.projects.findIndex((p: any) => p._id === id);
    if (idx === -1) return jsonError("Not found", 404);
    store.projects.splice(idx, 1);
    persistDemoStore();
    return jsonOk({ deleted: true });
  }
  if (!isValidObjectId(id)) return jsonError("Invalid id", 400);
  try {
    await connectDB();
    const item = await Project.findByIdAndDelete(id);
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ deleted: true });
  } catch (e) {
    return jsonError("Failed to delete", 500);
  }
}