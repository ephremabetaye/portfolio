import { connectDB } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { BlogPost } from "@/models/BlogPost";
import { Skill } from "@/models/Skill";
import { ContactMessage } from "@/models/ContactMessage";
import { getAdminSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/utilities";
import { getDemoStore, isDemoMode } from "@/lib/demo-store";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return jsonError("Unauthorized", 401);

  if (isDemoMode()) {
    const store = getDemoStore();
    return jsonOk({
      stats: {
        projects: store.projects.filter((p: any) => p.published).length,
        posts: store.posts.filter((p: any) => p.published).length,
        skills: store.skills.length,
        messages: store.messages.length,
        unread: store.messages.filter((m: any) => !m.read).length,
      },
      recentMessages: store.messages.slice(0, 5),
      recentProjects: store.projects.slice(-5).reverse(),
    });
  }

  try {
    await connectDB();
    const [projects, posts, skills, messages, unread] = await Promise.all([
      Project.countDocuments({ published: true }),
      BlogPost.countDocuments({ published: true }),
      Skill.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ read: false }),
    ]);
    const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentProjects = await Project.find().sort({ updatedAt: -1 }).limit(5).lean();
    return jsonOk({ stats: { projects, posts, skills, messages, unread }, recentMessages, recentProjects });
  } catch (e) {
    return jsonError("Database unavailable", 503);
  }
}