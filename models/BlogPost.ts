import mongoose from "mongoose";

const LangText = new mongoose.Schema({ en: { type: String, default: "" }, am: { type: String, default: "" } }, { _id: false });

const BlogPostSchema = new mongoose.Schema({
  title: { type: LangText, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  excerpt: { type: LangText, default: {} },
  content: { type: LangText, default: {} },
  featuredImage: { type: String, default: "" },
  author: { type: String, default: "Amanuel Bekele" },
  categories: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

export const BlogPost = mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
export default BlogPost;