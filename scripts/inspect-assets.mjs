import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { resolveAssetSrc, ASSET_SRC_HINT } from "./asset-src.mjs";

const ROOT = resolveAssetSrc();
if (!existsSync(ROOT)) {
  console.error(`inspect-assets: no asset library at ${ROOT}\n${ASSET_SRC_HINT}`);
  process.exit(1);
}
const folders = readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();

for (const folder of folders) {
  console.log(`\n=== ${folder} ===`);
  const files = readdirSync(join(ROOT, folder)).filter(f => /\.(jpe?g|webp|avif|png)$/i.test(f)).sort();
  for (const f of files) {
    try {
      const meta = await sharp(join(ROOT, folder, f)).metadata();
      let exif = "";
      if (meta.exif) {
        const s = meta.exif.toString("latin1");
        const make = /Make\x00([^\x00]+)/.exec(s)?.[1];
        const model = /Model\x00([^\x00]+)/.exec(s)?.[1];
        const soft = /Software\x00([^\x00]+)/.exec(s)?.[1];
        const parts = [make && `make=${make.trim()}`, model && `model=${model.trim()}`, soft && `soft=${soft.trim()}`].filter(Boolean);
        if (parts.length) exif = ` EXIF{${parts.join(",")}}`;
      }
      console.log(`${String(meta.width).padStart(5)}x${String(meta.height).padStart(5)} ${meta.format.padEnd(4)} ${f}${exif}`);
    } catch (e) {
      console.log(`  ERROR ${f}: ${e.message}`);
    }
  }
}
