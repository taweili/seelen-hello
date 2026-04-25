#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Build script for Seelen UI widgets.
 * Bundles JS with esbuild (via npx), copies other assets from src/ to dist/.
 *
 * Usage:
 *   deno task build       # Build all widgets
 *   deno task dev         # Watch mode (rebuild on changes)
 */

import { copy, ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

const SRC_DIR = "src";
const DIST_DIR = "dist";

// File extensions to copy from src/ to dist/ (non-JS assets)
const ASSET_EXTENSIONS = [
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".scss",
  ".sass",
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

  // Copy all non-JS assets from src/ to dist/
  let copyCount = 0;
  for await (const entry of Deno.readDir(SRC_DIR)) {
    if (!entry.isFile) continue;

    const ext = entry.name.split(".").pop() || "";
    const fullExt = `.${ext}`;
    const isYaml = entry.name.endsWith(".yml") || entry.name.endsWith(".yaml");

    if (isYaml || ASSET_EXTENSIONS.includes(fullExt)) {
      const srcFile = join(SRC_DIR, entry.name);
      const destFile = join(DIST_DIR, entry.name);
      await copy(srcFile, destFile, { overwrite: true });
      copyCount++;
    }
  }

  // Bundle JS with esbuild (resolves @seelen-ui/lib imports)
  const cmd = [
    "npx",
    "esbuild",
    join(SRC_DIR, "index.js"),
    "--bundle",
    `--outfile=${join(DIST_DIR, "index.js")}`,
    "--target=chrome100",
    "--format=iife",
  ];

  const proc = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "inherit",
    stderr: "inherit",
  });

  const { success } = await proc.output();
  if (!success) {
    console.error("  ✗ esbuild failed");
    Deno.exit(1);
  }

  console.log(`  ✓ built ${copyCount} asset(s) + bundled JS → ${DIST_DIR}/`);
}

// Run
if (import.meta.main) {
  await buildAll();
}
