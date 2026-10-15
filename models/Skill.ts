import mongoose from "mongoose";

const LangText = new mongoose.Schema({ en: { type: String, default: "" }, am: { type: String, default: "" } }, { _id: false });

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "Editing" },
  description: { type: LangText, default: {} },
  proficiency: { type: Number, min: 0, max: 100, default: 0 },
  icon: { type: String, default: "" },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export const Skill = mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
export default Skill;