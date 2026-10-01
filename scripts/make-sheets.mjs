import { readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = "/home/user/drive-assets";
const OUT = "/tmp/sheets";
mkdirSync(OUT, { recursive: true });

const folders = readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory());

for (const folder of folders) {
  const files = readdirSync(join(ROOT, folder.name)).filter(f => /\.(jpe?g|webp|avif|png)$/i.test(f)).sort();
  if (!files.length) continue;
  const thumbW = 320, thumbH = 240, labelH = 34, cols = Math.min(4, files.length);
  const rows = Math.ceil(files.length / cols);
  const W = cols * thumbW, H = rows * (thumbH + labelH);
  const composites = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const x = (i % cols) * thumbW, y = Math.floor(i / cols) * (thumbH + labelH);
    const buf = await sharp(join(ROOT, folder.name, f))
      .rotate()
      .resize(thumbW, thumbH, { fit: "cover" })
      .jpeg({ quality: 72 })
      .toBuffer()
      .catch(() => null);
    if (buf) composites.push({ input: buf, left: x, top: y + labelH });
    const label = Buffer.from(`<svg width="${thumbW}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="6" y="22" font-size="13" font-family="sans-serif" fill="#fff">${f.replace(/&/g, "&amp;").slice(0, 42)}</text></svg>`);
    composites.push({ input: label, left: x, top: y });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: { r: 40, g: 40, b: 40 } } })
    .composite(composites)
    .jpeg({ quality: 78 })
    .toFile(join(OUT, `${folder.name}.jpg`));
  console.log(folder.name, files.length);
}
