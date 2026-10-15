import mongoose from "mongoose";

const LangText = new mongoose.Schema({ en: { type: String, default: "" }, am: { type: String, default: "" } }, { _id: false });

const SiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: "CineCut" },
  logoText: { type: String, default: "CineCut" },
  logoUrl: { type: String, default: "" },
  accentColor: { type: String, default: "#7c5cff" },
  defaultLanguage: { type: String, default: "en" },
  availableLanguages: { type: [String], default: ["en", "am"] },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  heroHeading: { type: LangText, default: {} },
  heroSubtitle: { type: LangText, default: {} },
  introText: { type: LangText, default: {} },
  primaryButtonText: { type: LangText, default: {} },
  primaryButtonLink: { type: String, default: "/projects" },
  secondaryButtonText: { type: LangText, default: {} },
  secondaryButtonLink: { type: String, default: "/contact" },
  showreelUrl: { type: String, default: "" },
  featuredProjectIds: { type: [String], default: [] },
  aboutHeading: { type: LangText, default: {} },
  aboutText: { type: LangText, default: {} },
  contactCtaHeading: { type: LangText, default: {} },
  contactCtaText: { type: LangText, default: {} },
  footerText: { type: LangText, default: {} },
  social: { type: Object, default: {} },
  contactEmail: { type: String, default: "" },
}, { timestamps: true });

export const SiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);
export default SiteSettings;