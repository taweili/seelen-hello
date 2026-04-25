#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Build script for Seelen UI widgets.
 * Copies widget source files from src/ to dist/, preserving directory structure.
 *
 * Usage:
 *   deno task build       # Build all widgets
 *   deno task dev         # Watch mode (rebuild on changes)
 */

import { copy, ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";
import { join, relative } from "https://deno.land/std@0.224.0/path/mod.ts";

const SRC_DIR = "src";
const DIST_DIR = "dist";

// Files to copy per widget (metadata.yml + source assets)
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

async function isWidgetDir(dirPath: string): Promise<boolean> {
  try {
    const entries = Deno.readDirSync(dirPath);
    for (const entry of entries) {
      if (entry.name === "metadata.yml" || entry.name === "metadata.yaml") {
        return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

async function findWidgets(srcDir: string): Promise<string[]> {
  const widgets: string[] = [];
  for await (const entry of Deno.readDir(srcDir)) {
    if (!entry.isDirectory) continue;
    const widgetPath = join(srcDir, entry.name);
    if (await isWidgetDir(widgetPath)) {
      widgets.push(widgetPath);
    }
  }
  return widgets;
}

async function buildWidget(widgetPath: string) {
  // Use basename to get the widget directory name regardless of OS path separator
  const widgetName = widgetPath.split(/[\\/]/).pop()!;
  const destDir = join(DIST_DIR, widgetName);

  await ensureDir(destDir);

  // Copy all relevant files
  for await (const entry of Deno.readDir(widgetPath)) {
    if (!entry.isFile) continue;

    const ext = entry.name.split(".").pop() || "";
    const fullExt = `.${ext}`;
    const isYaml = entry.name.endsWith(".yml") || entry.name.endsWith(".yaml");

    if (isYaml || WIDGET_EXTENSIONS.includes(fullExt)) {
      const srcFile = join(widgetPath, entry.name);
      const destFile = join(destDir, entry.name);
      await copy(srcFile, destFile, { overwrite: true });
    }
  }

  console.log(`  ✓ ${widgetName}`);
}

async function buildAll() {
  console.log("Building widgets...");

  const widgets = await findWidgets(SRC_DIR);

  if (widgets.length === 0) {
    console.log("No widgets found in src/");
    return;
  }

  await ensureDir(DIST_DIR);

  for (const widget of widgets) {
    await buildWidget(widget);
  }

  console.log(`Built ${widgets.length} widget(s) → ${DIST_DIR}/`);
}

// Run
if (import.meta.main) {
  await buildAll();
}
