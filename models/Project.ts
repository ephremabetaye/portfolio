import mongoose from "mongoose";

const LangText = new mongoose.Schema({ en: { type: String, default: "" }, am: { type: String, default: "" } }, { _id: false });

const ProjectSchema = new mongoose.Schema({
  title: { type: LangText, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: LangText, default: {} },
  category: { type: String, default: "Commercial" },
  tags: { type: [String], default: [] },
  tools: { type: [String], default: [] },
  client: { type: String, default: "" },
  projectDate: { type: Date },
  thumbnail: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export default Project;