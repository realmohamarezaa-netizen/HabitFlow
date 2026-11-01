#!/usr/bin/env python3
"""HabitFlow launcher icons — modern redesign.

Design language:
  * diagonal deep-teal -> emerald gradient canvas
  * glassy top-left sheen + soft central glow (depth)
  * white progress ring with a 300° sweep (habit tracking motif)
  * bold rounded check mark with a soft drop shadow
  * adaptive (full-bleed foreground) + legacy rounded-square + round variants
"""
import math
import os
from PIL import Image, ImageDraw, ImageFilter

RES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "res")
PREVIEW = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview.png")

GRAD_TOP = (11, 59, 66)     # deep teal   #0B3B42
GRAD_BOT = (46, 177, 131)   # emerald     #2EB183
WHITE = (255, 255, 255, 255)
SS = 4                      # supersampling factor

DENSITIES = {
    "mdpi": 1,
    "hdpi": 1.5,
    "xhdpi": 2,
    "xxhdpi": 3,
    "xxxhdpi": 4,
}

# motif radius as a fraction of the canvas:
#  legacy canvas shows ~100% of the square -> larger motif,
#  adaptive foreground is a full-bleed 108dp grid -> motif must sit
#  inside the 66/108 safe zone (r <= 0.30 of the canvas).
R_LEGACY = 0.335
R_ADAPTIVE = 0.290


# ---------------------------------------------------------------- gradient
def gradient(size):
    """smooth diagonal gradient top-left -> bottom-right (built small, upscaled)"""
    small = 48
    img = Image.new("RGB", (small, small))
    px = img.load()
    denom = 2 * small - 2
    for y in range(small):
        for x in range(small):
            t = (x + y) / denom
            px[x, y] = tuple(int(GRAD_TOP[i] + (GRAD_BOT[i] - GRAD_TOP[i]) * t) for i in range(3))
    return img.resize((size, size), Image.BILINEAR)


# ---------------------------------------------------------------- lighting
def add_sheen(img, S):
    """soft glassy highlight in the top-left corner"""
    sheen = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(sheen)
    d.ellipse([-0.50 * S, -0.60 * S, 0.46 * S, 0.36 * S], fill=(255, 255, 255, 30))
    sheen = sheen.filter(ImageFilter.GaussianBlur(0.11 * S))
    img.alpha_composite(sheen)


def add_glow(img, cx, cy, r):
    """gentle radial glow behind the motif"""
    glow = Image.new("RGBA", (img.size[0], img.size[1]), (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 46))
    glow = glow.filter(ImageFilter.GaussianBlur(r * 0.55))
    img.alpha_composite(glow)


# ---------------------------------------------------------------- motif
def draw_motif(img, cx, cy, R):
    d = ImageDraw.Draw(img)

    # --- faint full track ring ---
    track_w = max(2, int(0.085 * R))
    d.ellipse([cx - R, cy - R, cx + R, cy + R],
              outline=(255, 255, 255, 62), width=track_w)

    # --- progress arc: 300° sweep starting at 12 o'clock, round caps ---
    arc_w = max(3, int(0.155 * R))
    start, sweep = -90, 300
    d.arc([cx - R, cy - R, cx + R, cy + R], start=start, end=start + sweep,
          fill=WHITE, width=arc_w)
    hr = arc_w / 2
    for ang in (start, start + sweep):
        a = math.radians(ang)
        ex, ey = cx + R * math.cos(a), cy + R * math.sin(a)
        d.ellipse([ex - hr, ey - hr, ex + hr, ey + hr], fill=WHITE)

    # --- bold check mark: soft shadow first, then solid white ---
    p1 = (cx - 0.46 * R, cy + 0.02 * R)
    p2 = (cx - 0.10 * R, cy + 0.38 * R)
    p3 = (cx + 0.48 * R, cy - 0.34 * R)
    w = max(3, int(0.26 * R))

    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ds = ImageDraw.Draw(shadow)
    sp = [(x, y + 0.12 * R) for x, y in (p1, p2, p3)]
    ds.line(sp, fill=(0, 0, 0, 105), width=w, joint="curve")
    for p in sp:
        ds.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=(0, 0, 0, 105))
    shadow = shadow.filter(ImageFilter.GaussianBlur(0.07 * R))
    img.alpha_composite(shadow)

    d.line([p1, p2, p3], fill=WHITE, width=w, joint="curve")
    for p in (p1, p3):
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=WHITE)


# ---------------------------------------------------------------- renders
def paint(S, motif_r_frac):
    """full-bleed gradient artwork with motif, at supersampled size S"""
    img = gradient(S).convert("RGBA")
    add_sheen(img, S)
    cx = cy = S // 2
    add_glow(img, cx, cy, 0.52 * S)
    draw_motif(img, cx, cy, int(motif_r_frac * S))
    return img


def mask(img, shape):
    """shape: 'square' (rounded) | 'round' (circle) — applied at SS resolution"""
    S = img.size[0]
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)
    if shape == "round":
        d.ellipse([0, 0, S - 1, S - 1], fill=255)
    else:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(0.225 * S), fill=255)
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    out.paste(img, (0, 0), m)
    return out


def render_legacy(size):
    """legacy launcher icon: rounded square, large motif"""
    S = size * SS
    return mask(paint(S, R_LEGACY), "square").resize((size, size), Image.LANCZOS)


def render_round(size):
    """round launcher icon: circular mask, large motif"""
    S = size * SS
    return mask(paint(S, R_LEGACY), "round").resize((size, size), Image.LANCZOS)


def render_foreground(size):
    """adaptive icon foreground: full-bleed artwork, motif in safe zone"""
    S = size * SS
    return paint(S, R_ADAPTIVE).resize((size, size), Image.LANCZOS)


def write(path, img):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "PNG")
    print("wrote", path)


def main():
    for name, mult in DENSITIES.items():
        folder = os.path.join(RES, "mipmap-" + name)
        base = int(48 * mult)
        write(os.path.join(folder, "ic_launcher.png"), render_legacy(base))
        write(os.path.join(folder, "ic_launcher_round.png"), render_round(base))
        write(os.path.join(folder, "ic_launcher_foreground.png"), render_foreground(int(108 * mult)))
    # large preview for quick inspection (not packaged)
    write(PREVIEW, render_legacy(256))
    print("icons done")


if __name__ == "__main__":
    main()
