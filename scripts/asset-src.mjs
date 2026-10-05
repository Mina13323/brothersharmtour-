/**
 * Resolves the location of the raw operator asset library (the Google Drive
 * export holding original photography and `videos/*.mp4` files).
 *
 * That library is intentionally NOT committed to the repo — it is staged by
 * whoever runs the media pipeline — so its path must never be hard-coded to a
 * single developer's machine. Shared by every script that reads originals.
 *
 * Resolution order (first match wins):
 *   1. CLI argument   `--assets=/path/to/drive-assets` (or `--asset-src=`)
 *   2. Environment    `MEDIA_ASSET_SRC` (or legacy `BRO_ASSET_SRC`)
 *   3. Project-local  `<repo>/media-src/originals/` (default, git-ignored)
 */
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Project-relative default, so a clean checkout works with no configuration. */
export const DEFAULT_ASSET_SRC = fileURLToPath(
  new URL("../media-src/originals/", import.meta.url),
);

export function resolveAssetSrc(argv = process.argv.slice(2), env = process.env) {
  const flag = argv.find(
    (a) => a.startsWith("--assets=") || a.startsWith("--asset-src="),
  );
  if (flag) return resolve(flag.slice(flag.indexOf("=") + 1));

  const fromEnv = env.MEDIA_ASSET_SRC || env.BRO_ASSET_SRC;
  if (fromEnv) return resolve(fromEnv);

  return DEFAULT_ASSET_SRC;
}

/** Human-readable hint printed when the library is missing. */
export const ASSET_SRC_HINT =
  "Set MEDIA_ASSET_SRC=/path/to/drive-assets, pass --assets=/path/to/drive-assets, " +
  "or stage the originals in media-src/originals/.";
