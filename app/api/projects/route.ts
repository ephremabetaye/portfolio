import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, slugify, safeUrl } from "@/lib/utilities";
import { getDemoStore, isDemoMode, nextDemoId, persistDemoStore } from "@/lib/demo-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const session = await getAdminSession();
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured");
  const search = url.searchParams.get("q");

  if (isDemoMode()) {
    let data = [...getDemoStore().projects];
    if (!(all && session)) data = data.filter((p: any) => p.published);
    if (category && category !== "all") data = data.filter((p: any) => p.category === category);
    if (featured === "1") data = data.filter((p: any) => p.featured);
    if (search) data = data.filter((p: any) => ((p.title?.en || "") + (p.title?.am || "")).toLowerCase().includes(search.toLowerCase()));
    return jsonOk(data);
  }

  try {
    await connectDB();
    const q: Record<string, unknown> = {};
    if (!(all && session)) q.published = true;
    if (category && category !== "all") q.category = category;
    if (featured === "1") q.featured = true;
    if (search) {
      q.$or = [
        { "title.en": { $regex: search, $options: "i" } },
        { "title.am": { $regex: search, $options: "i" } },
      ];
    }
    const items = await Project.find(q).sort({ order: 1, createdAt: -1 }).lean();
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
    if (!body.slug && body.title?.en) body.slug = slugify(body.title.en);
    body.thumbnail = safeUrl(body.thumbnail);
    body.videoUrl = safeUrl(body.videoUrl);
    if (isDemoMode()) {
      const store = getDemoStore();
      const item = { ...body, _id: nextDemoId("p"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.projects.push(item);
      persistDemoStore();
      return jsonOk(item, 201);
    }
    await connectDB();
    const item = await Project.create(body);
    return jsonOk(item, 201);
  } catch (e: any) {
    if (e?.code === 11000) return jsonError("Slug already exists", 409);
    if (isDemoMode()) return jsonError("Failed to create project", 500);
    return jsonError("Database unavailable", 503);
  }
}