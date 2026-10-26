# Shubhly

Your kundli, your puja, your vibe.

Shubhly turns birth details into a kundli chart and an AI-written report in Hindi or English.

**How it works**

1. The chart is calculated with the Swiss Ephemeris (sidereal, Lahiri ayanamsa, whole-sign houses, nakshatra, Vimshottari dasha). The AI never calculates positions.
2. The chart data goes to Gemini with strict guardrails (`src/prompt.js`): no fear, no predictions of death or illness, no guarantees, no paid remedies.
3. The page shows a North Indian style chart, a planet table and the report.

## Run locally

Needs Node 22 or newer.

```bash
npm install
cp .env.example .env      # then paste your Gemini API key into .env
npm run dev
```

Open http://localhost:8080. Without a key the chart works and the report button shows a friendly "not switched on yet" message.

```bash
npm test                  # chart accuracy and input checks
```

## Deploy

### Option A: Cloud Run from this GitHub repo (recommended)

1. In the Google Cloud console open **Cloud Run** and click **Connect repository**.
2. Choose **Cloud Build**, pick this GitHub repo and the `main` branch.
3. Set **Build type** to **Dockerfile** and the source location to `/Dockerfile`.
4. Under **Variables & Secrets** add `GEMINI_API_KEY` (create a key in Google AI Studio). Keep it as a secret, never in the code.
5. Allow unauthenticated invocations so the public can open the site, then click **Create**.

Every push to `main` then redeploys automatically.

### Option B: Google AI Studio

In AI Studio **Build** mode, use the **+** menu to import this GitHub repository, then deploy to Cloud Run from there. AI Studio keeps `GEMINI_API_KEY` on the server side. If the import does not run the Express server correctly, use Option A.

## Settings

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Key for the AI report (required for reports) |
| `GEMINI_MODEL` | Optional model name, default `gemini-2.5-flash` |
| `FREE_CHATS` | Optional, caps free AI astrologer messages per device; unset means unlimited |
| `GUIDES_ALWAYS_ON` | Optional, set to `1` while testing so no guide is resting |
| `PORT` | Set automatically on Cloud Run |

## Project layout

```
server.js        API and static hosting
src/kundli.js    chart engine
src/prompt.js    AI astrologer instructions and guardrails
src/report.js    Gemini call
src/geocode.js   place search (Open-Meteo, no key needed)
public/          the website
test/            tests
```

## Coming next

Payments (UPI and Razorpay), marriage matching, the WhatsApp flow, and the puja and murti store.


## Website and daily features

- Pages, each with its own address: `/` (home), `/kundli`, `/rashifal` and `/rashifal/<sign>` for all 12 signs, `/panchang`, `/guides`, `/premium`, `/store`. They share one HTML shell (`public/index.html`); `src/pages.js` sets each page's title, description, canonical link, visible sections and heading. `/sitemap.xml` and `/robots.txt` are generated. Set `PUBLIC_URL` (for example `https://shubhly.in`) so links in the sitemap use your real domain.
- Installable app (PWA): `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`, icons in `public/icons/`. Chrome on Android shows an install button; on iPhone it shows the Share steps. To package it for the Play Store later, use PWABuilder with your live domain.
- Features: today's panchang and choghadiya, daily rashifal, vrat calendar, kundli with a free life reading, share card, saved profiles, streak, AI astrologers, puja store teaser.
- Daily content is computed in code (no AI): `src/panchang.js`, `src/horoscope.js`, `src/transits.js`, with text tables in `src/content.js`.
- Endpoints: `GET /api/config`, `GET /api/today?date&lat&lon&tz&moon`, `GET /api/horoscope?date&lat&lon&tz`, plus the existing `/api/places`, `/api/kundli`, `/api/report`.
- Optional env var `WHATSAPP_URL` (an https wa.me / chat.whatsapp.com link) shows a WhatsApp button.
- Fonts (Yatra One, Hind) are bundled in `public/fonts`. Banner and product images are in `public/img`; replace them using `docs/IMAGE-PROMPTS.md`.
- Tests: `npm test`.

Languages: the page and the daily content switch between English, Hindi and Hinglish (picker in the top bar, remembered on the device). Page words live in `public/i18n.js`; daily content in `src/content.js`, `src/content-en.js`, `src/content-hi.js`. The APIs take `lang=en|hi|hn`.
