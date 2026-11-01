#!/usr/bin/env python3
"""Makes light copies of the site's photos: an AVIF copy next to every JPG, and a 640 wide
copy of the big ones. The originals stay as they are. Run after adding or changing pictures:
    python3 scripts/optimize-images.py
"""
import glob, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "img")
SKIP = {"og-image.jpg"}  # shared on WhatsApp and Facebook, which need a plain JPG
Q_AVIF = 58
files = [f for f in glob.glob(ROOT + "/**/*.jpg", recursive=True) if os.path.basename(f) not in SKIP and not f.endswith("-640.jpg")]
saved = before = 0
for f in sorted(files):
    base = f[:-4]
    im = Image.open(f).convert("RGB")
    if im.width > 1280:
        im = im.resize((1280, round(im.height * 1280 / im.width)), Image.LANCZOS)
    for dst, img in ((base + ".avif", im),) + (((base + "-640.avif", im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS)),) if im.width >= 1000 else ()):
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(f):
            img.save(dst, "AVIF", quality=Q_AVIF, speed=4)
    if im.width >= 1000:
        small = base + "-640.jpg"
        if not os.path.exists(small) or os.path.getmtime(small) < os.path.getmtime(f):
            im.resize((640, round(im.height * 640 / im.width)), Image.LANCZOS).save(small, "JPEG", quality=76, optimize=True, progressive=True)
    before += os.path.getsize(f); saved += os.path.getsize(base + ".avif")
print(f"{len(files)} pictures: JPG {before//1024} KB -> AVIF {saved//1024} KB")
