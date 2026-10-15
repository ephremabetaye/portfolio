import fs from "node:fs";
import path from "node:path";
import { demoMessages, demoPosts, demoProfile, demoProjects, demoSettings, demoSkills } from "./demo-data";

type DemoStore = {
  profile: any;
  settings: any;
  projects: any[];
  skills: any[];
  posts: any[];
  messages: any[];
  seq: number;
};

const globalAny = globalThis as unknown as { __demoStore?: DemoStore };

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "demo-store.json");

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function freshStore(): DemoStore {
  return {
    profile: clone(demoProfile),
    settings: clone(demoSettings),
    projects: clone(demoProjects),
    skills: clone(demoSkills),
    posts: clone(demoPosts),
    messages: clone(demoMessages),
    seq: 1000,
  };
}

function loadFromDisk(): DemoStore | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const base = freshStore();
    return {
      profile: parsed.profile ?? base.profile,
      settings: parsed.settings ?? base.settings,
      projects: Array.isArray(parsed.projects) ? parsed.projects : base.projects,
      skills: Array.isArray(parsed.skills) ? parsed.skills : base.skills,
      posts: Array.isArray(parsed.posts) ? parsed.posts : base.posts,
      messages: Array.isArray(parsed.messages) ? parsed.messages : base.messages,
      seq: typeof parsed.seq === "number" ? parsed.seq : base.seq,
    };
  } catch {
    return null;
  }
}

export function getDemoStore(): DemoStore {
  if (!globalAny.__demoStore) {
    globalAny.__demoStore = loadFromDisk() ?? freshStore();
  }
  return globalAny.__demoStore!;
}

export function persistDemoStore() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(getDemoStore(), null, 2), "utf8");
  } catch {
    // Non-fatal: edits stay in memory for this server session.
  }
}

export function nextDemoId(prefix: string) {
  const store = getDemoStore();
  store.seq += 1;
  return `${prefix}${store.seq}`;
}

export function isDemoMode() {
  return !process.env.MONGODB_URI && process.env.NODE_ENV !== "production";
}
