# Shubhly image prompts

Generate each image with Gemini image generation (or Imagen), save it with the exact file name below into `public/img/`, and redeploy. The current files are drawn in the same style by `tools/make-art.cjs`, so they already match.

Style for every image: a flat printed puja-poster illustration. Solid colour fills, thick indigo outlines, no gradients, no glow, no photo realism, no 3D shading. Subtle dot-grid texture.

Palette: haldi yellow #F6B81C, deep indigo #1B1B3A, kumkum red #D8321A, cream #FFF4DC, marigold orange #F28C0F, soft pink #F4A9A0, leaf green #17803F.

Add to the end of every prompt: "No text, no letters, no watermark, no logo."

## All file names (save into public/img/)

| File | Size | Where it shows |
|---|---|---|
| hero-bg.jpg | 1920x1080 | Home page hero background |
| aaj-banner.jpg | 1600x500 | Aaj ka panchang heading |
| rashifal-banner.jpg | 1600x500 | Aaj ka rashifal heading |
| kundli-banner.jpg | 1600x500 | Kundli heading |
| premium-banner.jpg | 1600x500 | Premium heading |
| store-banner.jpg | 1600x600 | Puja store teaser |
| cta-banner.jpg | 1600x600 | Closing call to action |
| og-image.jpg | 1200x630 | Link preview when shared |
| step-1.png, step-2.png, step-3.png | 640x640 | How it works |
| faq-art.png | 700x700 | Next to the FAQ |
| product-ganesha.jpg, product-lakshmi.jpg, product-puja-kit.jpg, product-rudraksha.jpg, product-shankh.jpg, product-incense.jpg, product-diya.jpg, product-yantra.jpg | 800x800 | Store products |
| rashi-01.png to rashi-12.png | 256x256, transparent | Rashi buttons |

## Banners

### hero-bg.jpg (1920x1080, 16:9)
Full background of the home page hero. White background. Text sits on the left and the live Moon card on the right, so keep the middle-left calm and mostly white.
Prompt: A flat poster scene on a white background with a faint dot texture: a big pale yellow sun disc with a thin yellow line mandala behind it on the upper right, a soft pale pink circle low on the left, triangle bunting in red and white across the top edge, and a skyline of three Indian temple silhouettes in deep indigo along the bottom with a row of small red diyas with orange flames in front.

### aaj-banner.jpg (1600x500, 16:5)
Behind the "Aaj ka panchang" heading. Text on the left, so keep the left 50% plain indigo.
Prompt: Solid indigo background. On the right a big yellow sun with red triangle rays, a small half-red half-cream moon beside it, a red wavy hill along the bottom with a yellow outline.

### premium-banner.jpg (1600x500, 16:5)
Behind the Premium heading. Text on the left.
Prompt: Solid kumkum red background with a yellow line mandala on the right, a yellow crown with three red jewels in the centre of it, four-point stars in yellow and cream around it, thick indigo outlines.

### rashifal-banner.jpg (1600x500, 16:5)
Behind the "Aaj ka rashifal" heading. Text sits on the left, so keep the left 50% plain indigo.
Prompt: On the right, a large mandala of thin yellow line petals, a ring of the twelve zodiac glyphs in cream, a red ring, and a half-red half-cream moon in the centre. Solid indigo background.

### kundli-banner.jpg (1600x500, 16:5)
Behind the "Apni kundli banao" heading. Text on the left.
Prompt: On the right, a cream North Indian kundli diamond chart with a thick yellow border and indigo lines, five round planets in red, yellow, orange and cream with indigo outlines, a yellow line mandala behind. Solid indigo background.

### store-banner.jpg (1600x600, 8:3)
Behind the puja store teaser. Text on the left.
Prompt: Solid kumkum red background. On the right, a pink lotus with cream petals on a yellow plate, four brass diyas with orange flames, a yellow line mandala behind, thick indigo outlines.

### cta-banner.jpg (1600x600, 8:3)
Behind the closing call to action. Text on the left.
Prompt: Solid kumkum red background. A big yellow sun with red rays on the right, an indigo temple silhouette, triangle bunting along the top, a row of diyas and a lotus at the bottom.

### og-image.jpg (1200x630, 1.91:1)
Link preview image when the site is shared.
Prompt: Solid haldi yellow background with an indigo border, a half-red half-cream moon with a mandala on the right, large empty area on the left for the Shubhly name.

## How it works illustrations (square, 640x640)

### step-1.png
Prompt: A cream calendar with a red header and a clock beside it, on a haldi yellow background with dot texture.

### step-2.png
Prompt: A yellow kundli diamond chart with seven coloured planet dots and a small moon, on a cream background.

### step-3.png
Prompt: A phone showing a moon and text lines with a small yellow lotus, on a soft pink background.

## Product images (square, 800x800)

### product-ganesha.jpg
Prompt: Haldi yellow background, a big red circle with an indigo outline and a yellow Om symbol in the middle.

### product-lakshmi.jpg
Prompt: Soft pink background, a yellow sun disc, a red and cream lotus, two small diyas.

### product-puja-kit.jpg
Prompt: Cream background, a big yellow thali with eight small diyas around a pink lotus.

### product-rudraksha.jpg
Prompt: Kumkum red background, a ring of brown rudraksha beads with indigo outlines and a yellow cap bead at the bottom.

## More product images (square, 800x800)

### product-shankh.jpg
Prompt: Haldi yellow background, a cream conch shell with thick indigo outline and spiral lines, a small red bead and a pink lotus below it.

### product-incense.jpg
Prompt: Cream background, five incense sticks fanned out of a red holder, orange glowing tips, yellow smoke swirls rising.

### product-diya.jpg
Prompt: Kumkum red background, a big yellow circle, one large red brass diya with an orange and yellow flame in the middle.

### product-yantra.jpg
Prompt: Soft pink background, a cream square frame, a yellow circle inside it with two interlocking triangles (one red, one indigo) and a red dot in the centre.

## FAQ illustration

### faq-art.png (700x700)
Prompt: Soft pink background with a dot texture, a big yellow circle holding a red question mark, a cream lotus below it and a small red diya on each side.

## Rashi icons (12 files, 256x256, transparent background)

Save as `rashi-01.png` to `rashi-12.png`, in this order: 01 Mesh (Aries), 02 Vrishabh (Taurus), 03 Mithun (Gemini), 04 Kark (Cancer), 05 Singh (Leo), 06 Kanya (Virgo), 07 Tula (Libra), 08 Vrishchik (Scorpio), 09 Dhanu (Sagittarius), 10 Makar (Capricorn), 11 Kumbh (Aquarius), 12 Meen (Pisces).

Prompt for each: A round flat badge, thick indigo outline, solid colour fill, with a simple bold illustration of the animal or symbol of the sign in the centre (ram, bull, twins, crab, lion, maiden with wheat, scales, scorpion, archer with bow, sea-goat, water pitcher, two fish). Colours from the palette only, one colour per badge. Transparent background around the circle. Must stay readable at 46 pixels wide, so keep shapes big and simple.
