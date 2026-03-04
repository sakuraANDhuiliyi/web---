import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");

const EXTRA_FILES = [
  // Player entry is globally mounted here
  "src/App.vue",
  // NetEase Cloud Music API wrappers
  "src/api/music.js",
  // Request wrapper used by api/music.js
  "src/config/request.js",
  // Vite proxy that maps /wapi and /music
  "vite.config.js",
];

const MUSIC_DIR = "src/components/Music";
const ALLOWED_EXT = new Set([".vue", ".js", ".scss", ".css", ".json", ".md"]);

async function walkFiles(dirAbs) {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(abs)));
    else if (entry.isFile()) files.push(abs);
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
    case ".md":
      return "markdown";
    default:
      return "text";
  }
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

async function readIfExists(rel) {
  const abs = path.resolve(projectRoot, rel);
  try {
    await fs.access(abs);
    return abs;
  } catch {
    return null;
  }
}

async function main() {
  const includedAbs = new Set();

  for (const rel of EXTRA_FILES) {
    const abs = await readIfExists(rel);
    if (abs) includedAbs.add(abs);
  }

  const musicAbs = path.resolve(projectRoot, MUSIC_DIR);
  try {
    const allMusic = await walkFiles(musicAbs);
    for (const abs of allMusic) {
      const ext = path.extname(abs).toLowerCase();
      if (ALLOWED_EXT.has(ext)) includedAbs.add(abs);
    }
  } catch {
    // ignore
  }

  // Also include the icons/font/image used by the player if present
  const optionalAssets = [
    "src/assets/img/Avatar.png",
    "src/assets/css/iconFont/iconfont.css",
  ];
  for (const rel of optionalAssets) {
    const abs = await readIfExists(rel);
    if (abs) includedAbs.add(abs);
  }

  const files = Array.from(includedAbs).sort((a, b) =>
    toPosix(path.relative(projectRoot, a)).localeCompare(toPosix(path.relative(projectRoot, b)))
  );

  const now = new Date();
  const header = [
    "# MUSIC_PLAYER_BUNDLE（播放器 + 网易云接口，单文件汇总）",
    "",
    `生成时间：${now.toISOString()}`,
    "",
    "包含内容：",
    "- 播放器 UI/逻辑：src/components/Music/**",
    "- 网易云接口封装：src/api/music.js（通过 /wapi 代理）",
    "- 请求封装：src/config/request.js",
    "- 代理配置：vite.config.js（/wapi -> VITE_PROXY_MUSIC_API 或 localhost:3000，/music -> music.163.com）",
    "- 全局挂载入口：src/App.vue",
    "",
    "备注：这是把相关源码按原路径打包到一个 Markdown，方便复制和迁移；迁移到别的项目时通常需要按路径拆回去，并补齐依赖（axios、vue、element-plus 等）。",
    "",
  ].join("\n");

  let out = header;

  for (const abs of files) {
    const rel = toPosix(path.relative(projectRoot, abs));
    let content;
    try {
      // For binary assets like png, skip embedding to keep file manageable
      const ext = path.extname(abs).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".woff", ".woff2", ".ttf"].includes(ext)) {
        out += `\n\n---\n\n## ${rel}\n\n（二进制资源：未内嵌到 bundle；迁移时请按原路径拷贝该文件）\n`;
        continue;
      }
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

  const outPath = path.resolve(projectRoot, "MUSIC_PLAYER_BUNDLE.md");
  await fs.writeFile(outPath, out, "utf8");
  console.log(`OK: wrote ${toPosix(path.relative(projectRoot, outPath))}`);
  console.log(`Files: ${files.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
