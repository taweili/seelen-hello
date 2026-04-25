#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Build script for Seelen UI widgets.
 * Copies widget source files from src/ to dist/.
 *
 * Usage:
 *   deno task build       # Build all widgets
 *   deno task dev         # Watch mode (rebuild on changes)
 */

import { copy, ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

const SRC_DIR = "src";
const DIST_DIR = "dist";

// File extensions to copy from src/ to dist/
const WIDGET_EXTENSIONS = [
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".js",
  ".ts",
  ".mjs",
];

async function buildAll() {
  console.log("Building widgets...");

  // Check if src/ contains a metadata.yml (flat widget structure)
  let hasMetadata = false;
  for await (const entry of Deno.readDir(SRC_DIR)) {
    if (entry.name === "metadata.yml" || entry.name === "metadata.yaml") {
      hasMetadata = true;
      break;
    }
  }

  if (!hasMetadata) {
    console.log("No widget found — src/ must contain metadata.yml");
    return;
  }

  await ensureDir(DIST_DIR);

  // Copy all relevant files from src/ to dist/
  let count = 0;
  for await (const entry of Deno.readDir(SRC_DIR)) {
    if (!entry.isFile) continue;

    const ext = entry.name.split(".").pop() || "";
    const fullExt = `.${ext}`;
    const isYaml = entry.name.endsWith(".yml") || entry.name.endsWith(".yaml");

    if (isYaml || WIDGET_EXTENSIONS.includes(fullExt)) {
      const srcFile = join(SRC_DIR, entry.name);
      const destFile = join(DIST_DIR, entry.name);
      await copy(srcFile, destFile, { overwrite: true });
      count++;
    }
  }

  console.log(`  ✓ built ${count} file(s) → ${DIST_DIR}/`);
}

// Run
if (import.meta.main) {
  await buildAll();
}
