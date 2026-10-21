/**
 * Copy the local demo store (.data/demo-store.json) into MongoDB.
 *
 * Use this after adding MONGODB_URI to .env.local so the content you created
 * while running locally appears on your deployed site.
 *
 *   npm run import:data
 *   npm run import:data -- --messages
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { connectDB } from "../lib/mongodb";
import { getMongoUri } from "../lib/env";
import { Profile } from "../models/Profile";
import { SiteSettings } from "../models/SiteSettings";
import { Project } from "../models/Project";
import { Skill } from "../models/Skill";
import { BlogPost } from "../models/BlogPost";
import { ContactMessage } from "../models/ContactMessage";

// Load .env.local first (Next.js convention), then .env.
dotenv.config({ path: ".env.local" });
dotenv.config();

const args = process.argv.slice(2);
const includeMessages = args.includes("--messages");
const fileArgIndex = args.indexOf("--file");
const filePath =
  fileArgIndex !== -1 && args[fileArgIndex + 1]
    ? path.resolve(args[fileArgIndex + 1])
    : path.join(process.cwd(), ".data", "demo-store.json");

function cleanDoc(value: Record<string, unknown>) {
  const copy = { ...value };
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

async function run() {
  if (!getMongoUri()) {
    console.error("MONGODB_URI is not set. Add it to .env.local first (MongoDB Atlas connection string).");
    process.exit(1);
  }
  if (!fs.existsSync(filePath)) {
    console.error(`No data file found at ${filePath}. Run the site locally first to create it.`);
    process.exit(1);
  }

  const store = JSON.parse(fs.readFileSync(filePath, "utf8"));
  await connectDB();

  let profileUpdated = 0;
  if (store.profile) {
    const existing = await Profile.findOne();
    if (existing) {
      Object.assign(existing, cleanDoc(store.profile));
      await existing.save();
    } else {
      await Profile.create(cleanDoc(store.profile));
    }
    profileUpdated = 1;
  }

  let settingsUpdated = 0;
  if (store.settings) {
    const existing = await SiteSettings.findOne();
    if (existing) {
      Object.assign(existing, cleanDoc(store.settings));
      await existing.save();
    } else {
      await SiteSettings.create(cleanDoc(store.settings));
    }
    settingsUpdated = 1;
  }

  let projects = 0;
  for (const item of store.projects || []) {
    if (!item?.slug) continue;
    await Project.updateOne({ slug: item.slug }, { $set: cleanDoc(item) }, { upsert: true });
    projects++;
  }

  let skills = 0;
  for (const item of store.skills || []) {
    if (!item?.name) continue;
    await Skill.updateOne({ name: item.name }, { $set: cleanDoc(item) }, { upsert: true });
    skills++;
  }

  let posts = 0;
  for (const item of store.posts || []) {
    if (!item?.slug) continue;
    await BlogPost.updateOne({ slug: item.slug }, { $set: cleanDoc(item) }, { upsert: true });
    posts++;
  }

  let messages = 0;
  if (includeMessages) {
    for (const item of store.messages || []) {
      const exists = await ContactMessage.findOne({ email: item.email, message: item.message });
      if (exists) continue;
      await ContactMessage.create({
        ...cleanDoc(item),
        ...(item.createdAt ? { createdAt: new Date(item.createdAt) } : {}),
      });
      messages++;
    }
  }

  console.log("\nImport complete:");
  console.log(`  profile:  ${profileUpdated}`);
  console.log(`  settings: ${settingsUpdated}`);
  console.log(`  projects: ${projects}`);
  console.log(`  skills:   ${skills}`);
  console.log(`  posts:    ${posts}`);
  console.log(`  messages: ${messages}${includeMessages ? "" : " (use --messages to include them)"}`);
  console.log("\nOpen /api/health on your deployment to confirm database.connected = true.\n");
  process.exit(0);
}

run().catch((e) => {
  console.error("\nImport failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
