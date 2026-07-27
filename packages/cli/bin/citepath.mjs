#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const cfgDir = join(homedir(), ".citepath");
const cfgPath = join(cfgDir, "config.json");
const base = process.env.CITEPATH_API_URL ?? "http://localhost:3000";

function loadConfig() {
  if (!existsSync(cfgPath)) return {};
  return JSON.parse(readFileSync(cfgPath, "utf8"));
}

function saveConfig(cfg) {
  mkdirSync(cfgDir, { recursive: true });
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
}

async function api(path, key) {
  const res = await fetch(`${base}${path}`, {
    headers: { "x-api-key": key },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) {
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify(json, null, 2));
}

const [,, cmd, ...args] = process.argv;
const cfg = loadConfig();
const key = process.env.CITEPATH_API_KEY ?? cfg.apiKey;

if (cmd === "auth" && args[0] === "login") {
  const k = args[1];
  if (!k?.startsWith("cp_")) {
    console.error("Usage: citepath auth login cp_...");
    process.exit(1);
  }
  saveConfig({ ...cfg, apiKey: k });
  console.log("Saved API key to ~/.citepath/config.json");
  process.exit(0);
}

if (cmd === "auth" && args[0] === "whoami") {
  if (!key) {
    console.error("Not logged in");
    process.exit(1);
  }
  await api("/agent/me", key);
  process.exit(0);
}

if (cmd === "auth" && args[0] === "logout") {
  saveConfig({});
  console.log("Logged out");
  process.exit(0);
}

if (cmd === "subreddits" || cmd === "r") {
  const sub = args[0];
  const action = args[1] ?? "about";
  if (!key) {
    console.error("Run: citepath auth login cp_...");
    process.exit(1);
  }
  if (action === "search") await api(`/agent/subreddits/search?q=${encodeURIComponent(args[2] ?? sub)}`, key);
  else if (action === "posts") await api(`/agent/subreddits/${sub}/posts`, key);
  else if (action === "rules") await api(`/agent/subreddits/${sub}/rules`, key);
  else await api(`/agent/subreddits/${sub}/about`, key);
  process.exit(0);
}

if (cmd === "prompts" && args[0] === "import") {
  console.log("Use the web AI Visibility → Prompts UI or POST /api/v1/visibility for bulk import with a session.");
  process.exit(0);
}

console.log(`CitePath CLI

Usage:
  citepath auth login <cp_key>
  citepath auth whoami
  citepath auth logout
  citepath r <subreddit> [about|posts|rules]
  citepath r search <query>

API: ${base}
`);
