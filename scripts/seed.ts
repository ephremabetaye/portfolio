import dotenv from "dotenv";
import { connectDB } from "../lib/mongodb";
import { Profile } from "../models/Profile";
import { SiteSettings } from "../models/SiteSettings";
import { Project } from "../models/Project";
import { Skill } from "../models/Skill";
import { BlogPost } from "../models/BlogPost";

// Load .env.local first (Next.js convention), then .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

async function run() {
  await connectDB();
  const profile = await Profile.findOne();
  if (!profile) {
    await Profile.create({
      name: "Amanuel Bekele",
      title: "Senior Video Editor & Graphic Designer",
      bio: { en: "I craft cinematic stories for brands, artists, and creators. Specializing in commercials, music videos, documentaries, and social content.", am: "" },
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
      resumeUrl: "",
      yearsExperience: 7,
      services: ["Commercial Editing", "Music Video Editing", "Color Grading", "Motion Graphics", "Social Content"],
      tools: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Photoshop", "Audition"],
      skills: ["Storytelling", "Pacing", "Sound Design"],
      achievements: ["50+ brand projects", "Featured on Vimeo Staff Pick", "Music video for top-charting artist"],
      philosophy: { en: "Every frame should serve the story. Editing is rhythm, emotion, and intention.", am: "" },
      social: { instagram: "https://instagram.com", youtube: "https://youtube.com", vimeo: "https://vimeo.com", linkedin: "https://linkedin.com", email: "hello@example.com" },
      contactEmail: "hello@example.com",
      phone: "+251 900 000 000",
      location: "Addis Ababa, Ethiopia",
    });
  }

  const settings = await SiteSettings.findOne();
  if (!settings) {
    await SiteSettings.create({
      siteName: "CineCut Portfolio",
      logoText: "CineCut",
      accentColor: "#7c5cff",
      defaultLanguage: "en",
      heroHeading: { en: "Crafting cinematic stories frame by frame", am: "" },
      heroSubtitle: { en: "I am a professional video editor and Graphic Designer delivering commercials, music videos, documentaries, and social content that moves audiences.", am: "" },
      introText: { en: "From first cut to final polish, I shape raw footage into compelling narratives.", am: "" },
      primaryButtonText: { en: "View My Work", am: "" },
      primaryButtonLink: "/projects",
      secondaryButtonText: { en: "Contact Me", am: "" },
      secondaryButtonLink: "/contact",
      showreelUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      aboutHeading: { en: "About", am: "" },
      aboutText: { en: "I partner with brands, agencies, and artists to deliver edits that elevate their message.", am: "" },
      contactCtaHeading: { en: "Let's create something unforgettable", am: "" },
      contactCtaText: { en: "Available for freelance projects, commercial work, and collaborations.", am: "" },
      footerText: { en: "Crafting cinematic stories.", am: "" },
      seoTitle: "Amanuel Bekele — Video Editor",
      seoDescription: "Portfolio of a professional video editor.",
      contactEmail: "hello@example.com",
    });
  }

  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    const skills = [
      { name: "Adobe Premiere Pro", category: "Editing", description: { en: "Professional non-linear editing", am: "" }, proficiency: 95, order: 1 },
      { name: "Adobe After Effects", category: "Motion Graphics", description: { en: "Motion graphics and compositing", am: "" }, proficiency: 90, order: 2 },
      { name: "DaVinci Resolve", category: "Color", description: { en: "Color grading and finishing", am: "" }, proficiency: 85, order: 3 },
      { name: "Adobe Photoshop", category: "Design", description: { en: "Visual design and assets", am: "" }, proficiency: 80, order: 4 },
      { name: "Adobe Audition", category: "Audio", description: { en: "Audio editing and mixing", am: "" }, proficiency: 75, order: 5 },
      { name: "Color Grading", category: "Post-Production", description: { en: "Cinematic color work", am: "" }, proficiency: 90, order: 6 },
      { name: "Sound Design", category: "Audio", description: { en: "Atmosphere and Foley", am: "" }, proficiency: 80, order: 7 },
      { name: "Motion Graphics", category: "Motion", description: { en: "Kinetic typography and animation", am: "" }, proficiency: 85, order: 8 },
      { name: "Storytelling", category: "Creative", description: { en: "Narrative structure", am: "" }, proficiency: 95, order: 9 },
      { name: "Social Media Editing", category: "Social", description: { en: "Short-form platform content", am: "" }, proficiency: 90, order: 10 },
    ];
    await Skill.insertMany(skills);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    const imgs = [
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200",
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200",
    ];
    const items = [
      { slug: "neon-brand-launch", title: { en: "Neon Brand Launch", am: "" }, description: { en: "High-energy commercial spot for a tech startup launch, featuring dynamic transitions and bold color.", am: "" }, category: "Commercial", client: "NovaTech", tools: ["Premiere Pro", "After Effects"], projectDate: new Date("2025-11-10"), thumbnail: imgs[0], featured: true, published: true, order: 1 },
      { slug: "echoes-music-video", title: { en: "Echoes — Music Video", am: "" }, description: { en: "Cinematic music video with narrative storytelling and stylized lighting.", am: "" }, category: "Music Videos", client: "Echoes Band", tools: ["Premiere Pro", "DaVinci Resolve"], projectDate: new Date("2025-09-02"), thumbnail: imgs[1], featured: true, published: true, order: 2 },
      { slug: "summit-doc-short", title: { en: "Summit — Documentary Short", am: "" }, description: { en: "Short documentary following climbers preparing for a summit attempt.", am: "" }, category: "Documentary", client: "Summit Films", tools: ["Premiere Pro", "Audition"], projectDate: new Date("2025-06-15"), thumbnail: imgs[2], published: true, order: 3 },
      { slug: "threads-social-campaign", title: { en: "Threads Social Campaign", am: "" }, description: { en: "Series of short-form vertical edits for a fashion brand social campaign.", am: "" }, category: "Social Media", client: "Threads", tools: ["Premiere Pro", "Photoshop"], projectDate: new Date("2025-04-20"), thumbnail: imgs[3], published: true, order: 4 },
      { slug: "kinetic-titles-pack", title: { en: "Kinetic Titles Pack", am: "" }, description: { en: "Motion graphics title pack for broadcast and digital use.", am: "" }, category: "Motion Graphics", client: "Self", tools: ["After Effects"], projectDate: new Date("2025-02-01"), thumbnail: imgs[4], published: true, order: 5 },
      { slug: "silent-river-trailer", title: { en: "Silent River — Trailer", am: "" }, description: { en: "Cinematic trailer edit with custom sound design and color grade.", am: "" }, category: "Cinematic", client: "River Studios", tools: ["Premiere Pro", "DaVinci Resolve", "Audition"], projectDate: new Date("2024-12-12"), thumbnail: imgs[5], featured: true, published: true, order: 6 },
    ];
    await Project.insertMany(items);
  }

  const postCount = await BlogPost.countDocuments();
  if (postCount === 0) {
    await BlogPost.insertMany([
      { title: { en: "The Art of the Invisible Cut", am: "" }, slug: "art-of-invisible-cut", excerpt: { en: "How seamless transitions keep viewers immersed.", am: "" }, content: { en: "Great editing is editing you never notice. In this post we explore rhythm, pacing, and match cuts.", am: "" }, featuredImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200", author: "Amanuel Bekele", categories: ["Editing"], tags: ["editing", "craft"], published: true, publishedAt: new Date() },
      { title: { en: "Color Grading for Mood", am: "" }, slug: "color-grading-for-mood", excerpt: { en: "Using color to shape emotion and narrative.", am: "" }, content: { en: "Color is storytelling. Learn how to approach grading with intention.", am: "" }, featuredImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200", author: "Amanuel Bekele", categories: ["Color"], tags: ["color", "grading"], published: true, publishedAt: new Date() },
      { title: { en: "Editing Short-Form Social Content", am: "" }, slug: "editing-short-form-social", excerpt: { en: "Tips for vertical video that hooks in the first second.", am: "" }, content: { en: "Short-form is about impact. Here are principles that keep retention high.", am: "" }, featuredImage: "https://images.unsplash.com/photo-1611162617223-7d3f0d1e9c3b?w=1200", author: "Amanuel Bekele", categories: ["Social"], tags: ["social", "short-form"], published: true, publishedAt: new Date() },
    ]);
  }

  console.log("Seed complete");
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });