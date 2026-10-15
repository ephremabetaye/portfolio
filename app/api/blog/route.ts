import { connectDB } from "@/lib/mongodb";
import { BlogPost } from "@/models/BlogPost";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk, slugify } from "@/lib/utilities";
import { getDemoStore, isDemoMode, nextDemoId, persistDemoStore } from "@/lib/demo-store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "1";
  const session = await getAdminSession();
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("q");

  if (isDemoMode()) {
    let data = [...getDemoStore().posts];
    if (!(all && session)) data = data.filter((p: any) => p.published);
    if (category && category !== "all") data = data.filter((p: any) => (p.categories || []).includes(category));
    if (search) data = data.filter((p: any) => ((p.title?.en || "") + (p.excerpt?.en || "")).toLowerCase().includes(search.toLowerCase()));
    return jsonOk(data);
  }

  try {
    await connectDB();
    const q: Record<string, unknown> = {};
    if (!(all && session)) q.published = true;
    if (category && category !== "all") q.categories = category;
    if (search) {
      q.$or = [
        { "title.en": { $regex: search, $options: "i" } },
        { "title.am": { $regex: search, $options: "i" } },
        { "excerpt.en": { $regex: search, $options: "i" } },
      ];
    }
    const items = await BlogPost.find(q).sort({ publishedAt: -1, createdAt: -1 }).lean();
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
    if (body.published && !body.publishedAt) body.publishedAt = new Date();
    if (isDemoMode()) {
      const store = getDemoStore();
      const item = { ...body, _id: nextDemoId("b"), createdAt: new Date().toISOString() };
      store.posts.unshift(item);
      persistDemoStore();
      return jsonOk(item, 201);
    }
    await connectDB();
    const item = await BlogPost.create(body);
    return jsonOk(item, 201);
  } catch (e: any) {
    if (e?.code === 11000) return jsonError("Slug already exists", 409);
    return jsonError("Failed to create article", 500);
  }
}