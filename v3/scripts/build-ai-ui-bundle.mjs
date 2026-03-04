import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

const EXTRA_FILES = [
  "src/App.vue",
  "src/components/WelcomeComps/waves.vue",
  "src/components/PageHeader/home-header.vue",
  "src/components/PageHeader/index.vue",
  "src/styles/variable.scss",
  "src/styles/base.scss",
];

const MUSIC_DIR = "src/components/Music";
const ALLOWED_EXT = new Set([".vue", ".js", ".scss", ".css", ".json"]);

async function walkFiles(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(abs)));
    } else if (entry.isFile()) {
      files.push(abs);
    }
  }
  return files;
}

function languageFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".vue":
      return "vue";
    case ".js":
    case ".mjs":
      return "javascript";
    case ".ts":
      return "typescript";
    case ".scss":
      return "scss";
    case ".css":
      return "css";
    case ".json":
      return "json";
    default:
      return "text";
  }
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

async function main() {
  const includedAbs = new Set();

  // Explicit files
  for (const rel of EXTRA_FILES) {
    includedAbs.add(path.resolve(projectRoot, rel));
  }

  // Music directory (all relevant files)
  const musicAbs = path.resolve(projectRoot, MUSIC_DIR);
  try {
    const allMusic = await walkFiles(musicAbs);
    for (const abs of allMusic) {
      const ext = path.extname(abs).toLowerCase();
      if (ALLOWED_EXT.has(ext)) includedAbs.add(abs);
    }
  } catch (e) {
    // ignore if missing
  }

  const files = Array.from(includedAbs)
    .sort((a, b) => toPosix(path.relative(projectRoot, a)).localeCompare(toPosix(path.relative(projectRoot, b))));

  const now = new Date();
  const header = [
    "# UI_BUNDLE（组件迁移汇总）",
    "",
    `生成时间：${now.toISOString()}`,
    "",
    "包含内容：",
    "- 音乐播放器（src/components/Music/**）",
    "- 首页波浪组件（src/components/WelcomeComps/waves.vue）",
    "- 首页头图/遮罩/字体样式（src/components/PageHeader/home-header.vue）",
    "- 通用页面头图组件（src/components/PageHeader/index.vue）",
    "- 相关全局样式变量（src/styles/variable.scss、src/styles/base.scss）",
    "",
    "说明：这是把多个文件按原路径打包到一个 Markdown，便于复制和迁移；迁移时仍建议按文件拆回去。",
    "",
  ].join("\n");

  let out = header;

  for (const abs of files) {
    const rel = toPosix(path.relative(projectRoot, abs));
    let content;
    try {
      content = await fs.readFile(abs, "utf8");
    } catch {
      continue;
    }

    const lang = languageFromExt(abs);
    out += `\n\n---\n\n## ${rel}\n\n\`\`\`${lang}\n`;
    out += content.replace(/\r\n/g, "\n");
    if (!out.endsWith("\n")) out += "\n";
    out += "\`\`\`\n";
  }

  const outPath = path.resolve(projectRoot, "UI_BUNDLE.md");
  await fs.writeFile(outPath, out, "utf8");
  console.log(`OK: wrote ${toPosix(path.relative(projectRoot, outPath))}`);
  console.log(`Files: ${files.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
