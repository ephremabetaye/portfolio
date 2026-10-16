import mongoose from "mongoose";

const LangText = new mongoose.Schema({ en: { type: String, default: "" }, am: { type: String, default: "" } }, { _id: false });

const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Amanuel Bekele" },
  title: { type: String, default: "Video Editor & Graphic Designer" },
  bio: { type: LangText, default: { en: "", am: "" } },
  image: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  yearsExperience: { type: Number, default: 5 },
  services: { type: [String], default: [] },
  tools: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  achievements: { type: [String], default: [] },
  philosophy: { type: LangText, default: { en: "", am: "" } },
  social: {
    type: new mongoose.Schema({
      instagram: String,
      youtube: String,
      vimeo: String,
      linkedin: String,
      twitter: String,
      whatsapp: String,
      email: String,
      website: String,
    }, { _id: false }),
    default: {},
  },
  contactEmail: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
}, { timestamps: true });

export const Profile = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export default Profile;