#!/usr/bin/env bash
#
# tools/brand.sh — rebuild every logo derivative from the client's artwork.
#
#   ./tools/brand.sh                          # uses resources/brand/bro-sharm-logo.jpg
#   ./tools/brand.sh path/to/new-artwork.png  # and writes the same set again
#
# The source on Drive is a JPEG (file id in config/site.php → site.brand.source),
# which cannot carry transparency, so the artwork arrives on a near-white plate.
# This script knocks that plate out, crops the scene used as the header mark,
# recolours the navy lettering to white for the dark surfaces, and writes the
# favicons — WebP where the browser takes it, PNG as the fallback.
#
# Needs ImageMagick 6 or 7 (identify + convert). Nothing else. Re-run it after
# editing the source rather than hand-editing the outputs: the PNGs are
# quantised and the sizes are what the templates read with getimagesize().
#
set -euo pipefail

SRC="${1:-resources/brand/bro-sharm-logo.jpg}"
OUT="public/img/brand"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The brand navy, sampled from the artwork. Anything within this range becomes
# white in the on-dark version; adjust here if the artwork is ever redrawn.
NAVY='srgb(0,36,70)'

# The header mark is the scene above the lettering: this fraction of the height,
# measured on the current artwork (the wordmark starts just under half-way).
MARK_FRACTION="${MARK_FRACTION:-0.46}"

# How far the background knockout reaches, in fuzz terms. Keep it modest: too
# high and the sun's pale core starts dissolving from the inside.
FUZZ="${FUZZ:-6%}"

[ -f "$SRC" ] || { echo "no source artwork at $SRC" >&2; exit 1; }
mkdir -p "$OUT"

W=$(identify -format '%w' "$SRC")
H=$(identify -format '%h' "$SRC")

# 1 · knock out the connected near-white plate, then eat 1px of edge so the
#     JPEG ringing does not leave a pale halo when it sits on a dark header.
convert "$SRC" -fuzz "$FUZZ" \
  -fill none -draw "matte 0,0 floodfill" \
             -draw "matte $((W-1)),0 floodfill" \
             -draw "matte 0,$((H-1)) floodfill" \
             -draw "matte $((W-1)),$((H-1)) floodfill" \
  -channel A -morphology Erode Diamond:1 +channel \
  -trim +repage -bordercolor none -border 16 \
  "$TMP/art.png"

AW=$(identify -format '%w' "$TMP/art.png")
AH=$(identify -format '%h' "$TMP/art.png")

# 2 · the two full lockups: as drawn, and with the navy pushed to white.
convert "$TMP/art.png" "$TMP/full.png"
convert "$TMP/art.png" -fuzz 20% -fill white -opaque "$NAVY" "$TMP/white.png"

# 3 · the header mark: the scene only, cropped to a fraction of the height and
#     trimmed again so it is tight on three sides. (awk, because bash arithmetic
#     has no decimals.)
MH=$(awk -v h="$AH" -v f="$MARK_FRACTION" 'BEGIN { printf "%d", h * f }')
convert "$TMP/art.png" -crop "${AW}x${MH}+0+0" +repage -trim +repage \
  -bordercolor none -border 14 "$TMP/mark.png"

emit() { # stem  file  width
  convert "$2" -resize "$3x$3" -strip -define webp:method=6 -quality 82 "$OUT/$1.webp"
  convert "$2" -resize "$3x$3" -colors 255 -dither FloydSteinberg -depth 8 -strip \
          -define png:compression-level=9 "$OUT/$1.png"
}

emit mark       "$TMP/mark.png"  560
emit logo       "$TMP/full.png"  760
emit logo-white "$TMP/white.png" 760

# 4 · the icons: the mark, centred on the brand navy.
# The parentheses matter: without them the canvas takes the size of the overlay
# and every icon comes out 380px instead of 512.
convert -size 512x512 "xc:$NAVY" \( "$TMP/mark.png" -resize 380x380 \) -gravity center \
  -composite -strip "$TMP/tile.png"

convert "$TMP/tile.png" -colors 96 -depth 8 -strip -define png:compression-level=9 "$OUT/favicon-512.png"
convert "$TMP/tile.png" -resize 192x192 -colors 96 -strip "$OUT/favicon-192.png"
convert "$TMP/tile.png" -resize 180x180 -colors 96 -strip "$OUT/apple-touch-icon.png"
convert "$TMP/tile.png" -resize 32x32  -colors 64 -dither None -strip "$OUT/favicon-32.png"

# 5 · favicon.svg — a 64px raster inside an SVG wrapper, so browsers that ask
#     for a vector still get one that scales without a font or a delegate.
convert "$TMP/tile.png" -resize 64x64 -colors 48 -dither None -strip "$TMP/f64.png"
B64=$(base64 -w0 "$TMP/f64.png")
printf '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,%s"/></svg>\n' \
  "$B64" > public/img/favicon.svg

echo "built from $SRC ($(identify -format '%wx%h' "$SRC")):"
ls -l "$OUT" | awk 'NR>1 {printf "  %-22s %6.1f KB\n", $9, $5/1024}'
echo "  $(ls -l public/img/favicon.svg | awk '{printf "favicon.svg            %6.1f KB", $5/1024}')"
