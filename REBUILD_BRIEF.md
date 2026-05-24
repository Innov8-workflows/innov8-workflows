# Innov8 Workflows — Home Page Rebuild Brief

**For: fresh Claude Code session tasked with rebuilding `index.html` around the new conversion structure below.**

---

## 1. The Business

| | |
|---|---|
| **Name** | Innov8 Workflows |
| **Domain** | https://innov8workflows.co.uk |
| **Owner / founder** | Jamie Barlow (UK-based) |
| **What we sell** | Branded, conversion-focused websites for **local businesses & SMEs**. Optional bolt-ons: workflow automation, AI chatbot, AI voice call handler, custom CRM. |
| **Who we sell to** | Local UK trades (roofers, electricians, plumbers, builders, joiners, driveway/groundworks contractors) — owners who want more enquiries, better Google ranking, and less admin. Secondary: ambitious SMEs (consultancies, FinTech, etc.). |
| **Where prospects come from** | Cold outreach + word of mouth + the case-studies page. Each new site we launch becomes a testimonial. |
| **Primary contact channel** | **WhatsApp** to `+447718155997` (see §6). Also phone, also Jotform chatbot ("Logic"). |
| **What we DO NOT show on the public site** | **No pricing anywhere.** No £/$ figures. Pricing is discussed on the consultation call. Internal pricing image lives in `Innov8 Business Files/` for reference only. |

---

## 2. Positioning + Voice

- **Headline pitch:** "Websites that turn visitors into paying customers." (already in use on current hero)
- **Tone:** confident, plain-English, no jargon. Talk about *traffic, leads, conversions, bookings, Google ranking* — not "synergies" or "digital transformation".
- **The "why us":** Jamie has 10+ years in tech + a business degree. We give local businesses the same tools enterprises take for granted (CRM, AI, automation, SEO) without enterprise overhead.
- **Trust signals to lean on:**
  - No long-term contracts (cancel anytime)
  - Secure & reliable
  - UK-based support
  - Built to grow / scales as you grow
  - Real case studies of trades we've shipped for (see §7)

---

## 3. Brand System

### Colours
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0f0f0f` | Page background (dark) |
| `--surface` | `#161616` | Card / section background |
| `--surface2` | `#1e1e1e` | Nested card / hover state |
| `--border` | `#2a2a2a` | Subtle borders |
| `--accent` | `#ea580c` | **Primary orange** — buttons, links, badges, headlines highlight |
| `--accent2` | `#f97316` | Lighter orange — hover state |
| `--text` | `#f0f0f0` | Body text |
| `--muted` | `#666` | Captions, labels |
| `--muted2` | `#888` | Secondary text |
| `#25D366` | — | WhatsApp green (used on contact widgets + form button) |
| `--node-green` | `#22c55e` | Trust ticks, "live" pulse dots |

### Fonts (already loaded via Google Fonts)
- **Display:** `'Bricolage Grotesque'`, weights 300–800 — headlines, h1/h2/h3, badges
- **Mono:** `'DM Mono'`, weights 300–500 — section labels, meta/captions, badge pills

### Existing CSS conventions to keep
- `.reveal` + `.visible` for IntersectionObserver fade-up on scroll
- `.btn-primary` (orange pill) + `.btn-ghost` (outline)
- `.section-label` + `.section-title` + `.section-desc` for section headers
- `.hero-badge` for mono-caps pill badges with a pulsing dot
- Fluid type: `clamp(rem, vw, rem)` for hero h1 + section titles

---

## 4. Tech Stack + Deployment

| | |
|---|---|
| **Hosting** | GitHub Pages (org repo: `github.com/Innov8-workflows/innov8-workflows`, branch `main`) |
| **Custom domain** | `innov8workflows.co.uk` via `CNAME` file at repo root |
| **Build** | **None.** Vanilla HTML/CSS/JS, all inline. No npm, no React, no Next, no bundler. |
| **Local dev** | Just open the `.html` file in a browser or run `http.server`. |
| **Deploy** | `git add … && git commit && git push origin main` → auto-deploys in ~30s |
| **Browser support** | Modern evergreen (Chrome/Safari/Firefox/Edge). Mobile-first; iOS Safari is the most-used browser by prospects. |

---

## 5. Current File Layout

```
K:/AI/innov8 Workflows/
├── index.html              ← THE FILE TO REBUILD
├── about.html              ← Has founder portrait + bio (Jamie Barlow), shader hero
├── services.html           ← DNA video hero, 3 feature groups, trust strip
├── how-it-works.html       ← Phased process, video hero with cycling words
├── case-studies.html       ← Filterable case study cards (see §7)
├── consultancy.html        ← Anomalous-matter hero + WhatsApp-redirect form
├── review/
│   └── index.html          ← Standalone post-launch review-nudge page
├── CNAME                   ← innov8workflows.co.uk
├── cookie-consent.js       ← Cookie banner script (don't break it)
├── favicon.ico / .png / apple-touch-icon.png
├── hero-laptop.png         ← Cinematic laptop-on-desk mockup (current hero bg)
├── hero01.jpg              ← (small, unused right now)
├── hero02.png              ← Molecular/abstract bg — USER WANTS THIS ON FINAL CTA
├── hero03.png              ← Molecular network (currently on consultancy CTA)
├── hero04.png              ← Green molecular network (currently on About mission)
├── jamie-barlow.jpg        ← Founder portrait
├── dna-hero-video.mp4      ← DNA helix video (used on services hero)
├── case-jgs.png            ← JGS Construction laptop mockup
├── case-hrs.png            ← HRS Plumbing laptop mockup
├── case-marketbubbles.png  ← MarketBubbles laptop mockup
├── case-jgs.png, mitech_innov8.png, a2b_innov8.png,
│   williams-eletrical-innov8.png, innov8-workflows.github.io_k.smithurst-building_.png
└── Innov8 Business Files/  ← Internal — NOT served publicly
    └── Marketing/index.html ← Master copy of the /review/ landing page
```

---

## 6. Globally Shared Things (DO NOT REMOVE in the rebuild)

These already exist on **every page** including index.html — must remain working after the rebuild.

### 6a. Floating contact widgets (bottom-right corner, stacked above the chatbot)
```html
<style>
.floating-contact { position: fixed; right: 20px; z-index: 9999; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.3); transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; text-decoration: none; }
.floating-contact:hover { transform: scale(1.08); }
.floating-contact-wa { bottom: 280px; background: #25D366; box-shadow: 0 6px 20px rgba(37,211,102,0.4); }
.floating-contact-wa:hover { box-shadow: 0 8px 28px rgba(37,211,102,0.6); }
.floating-contact-call { bottom: 210px; background: var(--accent, #ea580c); box-shadow: 0 6px 20px rgba(234,88,12,0.4); }
.floating-contact-call:hover { box-shadow: 0 8px 28px rgba(234,88,12,0.6); }
.floating-contact svg { width: 28px; height: 28px; fill: #fff; }
@media (max-width: 600px) {
  .floating-contact-wa { bottom: 260px; }
  .floating-contact-call { bottom: 190px; }
}
</style>
<a href="https://wa.me/447718155997" target="_blank" rel="noopener" class="floating-contact floating-contact-wa" aria-label="WhatsApp Innov8 Workflows">
  <svg viewBox="0 0 24 24"><!-- WhatsApp logo path --></svg>
</a>
<a href="tel:+447718155997" class="floating-contact floating-contact-call" aria-label="Call Innov8 Workflows">
  <svg viewBox="0 0 24 24"><!-- phone icon path --></svg>
</a>
```

### 6b. Jotform "Logic" chatbot (sits below the widgets)
```html
<script src='https://cdn.jotfor.ms/agent/embedjs/019d21ae740c7db289b331944a1348e32b39/embed.js'></script>
```

### 6c. Cookie consent
```html
<script src="cookie-consent.js"></script>
```

### 6d. Mobile hamburger menu
Currently lives in every page's nav. Pattern:
- `.nav-hamburger` (☰ icon button, only visible below 768px)
- `.mobile-menu` fixed full-screen overlay, `.open` class toggles `display: flex`
- Tapping outside the menu closes it (onclick on the overlay itself)

### 6e. Nav (standard across all pages — keep identical on rebuilt home)
```html
<nav>
  <a href="index.html" class="nav-logo">
    <div class="logo-box">i8</div>
    Innov8 Workflows
  </a>
  <ul class="nav-links">
    <li><a href="about.html">About</a></li>
    <li><a href="services.html">Services</a></li>
    <li><a href="how-it-works.html">How It Works</a></li>
    <li><a href="case-studies.html">Case Studies</a></li>
    <li><a href="consultancy.html">Consultancy</a></li>
    <li><a href="consultancy.html#contact" class="nav-cta">Get Started</a></li>
  </ul>
  <button class="nav-hamburger" onclick="document.getElementById('mobileMenu').classList.toggle('open')" aria-label="Menu">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
  </button>
</nav>
```

### 6f. Contact details (use everywhere consistently)
- Phone (tel link): `tel:+447718155997`
- Phone (display): `+44 7718 155997`
- WhatsApp deep link: `https://wa.me/447718155997` (optionally with `?text=...` pre-filled body)
- Email: not currently surfaced — WhatsApp + phone preferred

---

## 7. Case Studies (source of truth for "before & after" + testimonials)

Currently live on `case-studies.html` and worth referencing for proof/social-proof copy on the home page:

| # | Client | Trade | Status | URL | Headline result |
|---|---|---|---|---|---|
| 1 | A2B Roofing & Scaffolding | Roofing | Live | a2broofingandscaffolding.co.uk | 72 Facebook reviews, 15+ years, fully insured |
| 2 | JGS Construction Services | Driveways / construction | Live | jgslimited.co.uk | **Local SEO ranking: 6th → 2nd on Google** |
| 3 | Williams Electrical | Electrical | Live | williams-electric.co.uk | 5.0★ Google · 32 reviews · 500+ jobs |
| 4 | K. Smithurst Building Contractors | Building | Launching soon | — | 30+ years experience, project-managed end-to-end |
| 5 | HRS Plumbing & Heating | Plumbing | Launching soon | — | Gas Safe registered, 10+ years, 500+ jobs |
| 6 | Mitech Joinery | Joinery / bespoke gates | Launching soon | — | 34 years craftsmanship, Derby + nationwide |
| 7 | MarketBubbles | SaaS / FinTech (NOT a local biz — hide from default views) | Live | market-bubbles.com | First-of-kind multi-asset visualisation platform |

**Real Facebook recommendation already on the site (from A2B Roofing):**
> "Jamie was really helpful and Efficient helping build by website and getting me into google, Stress free which is really help for new and smaller businesses. Would definitely recommend to other businesses/people even if they are look for advice at starting up"
> — *A2B roofing and scaffolding · 10 May at 20:20 (Facebook recommendation)*

This is the **only real customer quote we currently have** — lean on it for the Reviews slider and ask Jamie for more as they come in.

---

## 8. Current → Proposed Home Page Structure

### Current sections in `index.html` (top to bottom)
1. Nav
2. Hero (laptop mockup background, headline "Websites that turn visitors into paying customers.", 2 CTA buttons, workflow-preview node diagram)
3. Services (3 feature groups: Website Foundation / Growth & Automation / AI Add-Ons + trust strip)
4. How It Works (phased steps, lifted from how-it-works.html-style format)
5. Results (metric cards: speed, leads, etc.)
6. Consultancy band (intro + CTA)
7. Final CTA contact band
8. Footer

### Proposed new structure (Jamie's request, conversion-optimised)
```
1. NAVBAR                ← keep current (§6e)
2. HERO SECTION          ← REBUILD with rotating slider functionality
3. TRUST SIGNALS         ← new section just under the hero
4. SERVICES              ← simplified, conversion-led version of current Services
5. BEFORE & AFTER        ← new — needs gallery + comparison slider
6. WHY CHOOSE US         ← new (replaces current "Results" block)
7. REVIEWS SLIDER        ← new — autoroll carousel
8. CONTACT FORM          ← WhatsApp-redirect form (clone the consultancy.html one)
9. FINAL CTA             ← hero02.png as background, NO colour overlay
10. FOOTER               ← keep current
```

### Detailed spec for each new/changed section

#### 2. HERO SECTION (rotating slider)
- **Behaviour:** crossfade rotating slider, 5–6 sec per slide, pause on hover, accessible (respects `prefers-reduced-motion`)
- **Suggested slides** (~3–5):
  1. Current hero (laptop mockup `hero-laptop.png`) — "Websites that turn visitors into paying customers."
  2. Trade-focused (use a case study image like `case-jgs.png`) — "From 6th to 2nd on Google for JGS Construction — and that's just the start."
  3. AI/automation (use `hero04.png` or `hero03.png`) — "AI chatbots, automated bookings, missed-call text-back — the modern customer toolkit."
  4. (Optional) Mobile-first — "85% of your customers are on a phone. Build for them."
- Each slide: headline + subtitle + 2 CTA buttons (Primary: "Book Free Consultation" → `consultancy.html#contact` · Ghost: "View Case Studies" → `case-studies.html`)
- Keep the slide dots + progress bar UI conventions already in CSS (existing `.hero-dots`, `.hero-progress`, `.hero-slide` classes — reusable)
- Hero must stay left-aligned on desktop (≥769px), centred on mobile (matches current site)

#### 3. TRUST SIGNALS
- A horizontal strip right under the hero — 4 icon + label pairs:
  - 🛡️ **No Long-Term Contracts** — Cancel anytime
  - 🔒 **Secure & Reliable** — Your data is safe with us
  - 🇬🇧 **UK-Based Support** — Real people, real support
  - 🚀 **Built to Grow** — Scales as your business grows
- Reuse the `.trust-strip` styling already in `index.html` (currently inside the services section — can be lifted out)
- Bonus: a small "As featured in / Works with" mini-logo row underneath, e.g. Google, WhatsApp, Stripe, Jotform, n8n logos — pull from `https://html.tailus.io/blocks/customers/...svg` (already used on services.html)

#### 4. SERVICES
- Keep the current 3-group structure (Website Foundation / Growth & Automation / AI Add-Ons) but tighten the copy
- **No prices.** Lead with outcomes, not features
  - Website Foundation → "Look professional from day one. Convert visitors into enquiries."
  - Growth & Automation → "Capture every lead, follow up automatically, never miss a booking."
  - AI Add-Ons → "Let AI handle enquiries while you're on the tools."
- Each card: orange icon, h3, 1-sentence outcome, then bullet list of features (✓ check marks)
- CTA at the bottom of the section: "See all services →" linking to `services.html`

#### 5. BEFORE & AFTER (and gallery)
- This is **new content** — Jamie needs to provide before/after image pairs from the case studies (e.g. their old vs new website screenshots). **Ask Jamie for these.**
- Implementation options:
  - **Drag-slider comparison** (image with a draggable divider revealing before vs after) — most engaging, use a vanilla JS `<input type="range">` controlling `clip-path`
  - **Side-by-side gallery** — simpler fallback if no draggable comparison
- Below the slider: a 4–6 card gallery of client laptop mockups (reuse existing `case-jgs.png`, `case-hrs.png`, `a2b_innov8.png`, `williams-eletrical-innov8.png`, `mitech_innov8.png`, `innov8-workflows.github.io_k.smithurst-building_.png`)
- CTA: "See all case studies →" → `case-studies.html`

#### 6. WHY CHOOSE US
- 4–6 reasons, 2-column grid on desktop, stack on mobile:
  - **Built for local businesses** — We've shipped websites for plumbers, electricians, roofers, builders, joiners. We know what wins in local search.
  - **No template builders** — Every site is custom-coded for speed, SEO, and conversion. No Wix, no Squarespace bloat.
  - **One-tap contact** — Every site ships with WhatsApp + click-to-call widgets baked in. We use the same widgets on our own site.
  - **Founder-led** — You work with Jamie directly. No account managers, no offshored tickets.
  - **Same-day reply on WhatsApp** — Send us a message, get an answer.
  - **Built to grow** — Add automation, AI, CRM whenever you're ready. The foundation is set up for it from day one.

#### 7. REVIEWS SLIDER (autoroll)
- Horizontal carousel of testimonials, autoroll every ~6 sec, pause on hover
- Each card: ★★★★★ row, quote, customer name + business + a small avatar/logo if available
- **Currently we have ONE real review** (A2B Roofing, see §7 above). For now:
  - Use the A2B quote first
  - Add 2–3 placeholder cards labelled "Coming soon" or pull mini-quotes from the case study descriptions on `case-studies.html` (e.g. JGS's "6th → 2nd Google ranking" can be framed as a result quote)
  - Leave the slider gracefully handle a single-card state until more reviews come in
- Implementation: CSS keyframe `translateX` loop (simpler) OR vanilla JS slider with prev/next dots

#### 8. CONTACT FORM
- Clone the WhatsApp-redirect form from `consultancy.html` (look for `#innov8-enquiry-form` in that file)
- **Don't POST anywhere** — form submission opens WhatsApp with the answers pre-filled
- Pre-filled WhatsApp message format (from existing consultancy.html JS):
  ```
  Hi Jamie — new enquiry via innov8workflows.co.uk

  From: {firstName} {lastName}
  Company: {company}
  Email: {email}
  Phone: {phone}   (if provided)

  Service: {service}

  Project details:
  {message}
  ```
- Required fields: First name, Last name, Email, Company, Service, Message. Phone optional.
- Submit button: WhatsApp-green pill, "Send via WhatsApp" + WhatsApp icon
- Caption under button: "Opens WhatsApp with your details pre-filled · One tap to send · Same-day reply"

#### 9. FINAL CTA
- Section background: `hero02.png` (full-bleed, centred, cover) — **NO dark colour overlay** per Jamie's spec
- The image is bright/colourful (purple/blue molecular icons), so the text needs strong contrast — use a soft text-shadow OR a subtle dark gradient ONLY at the very top + bottom of the section (not a full overlay)
- Content: short punchy headline + 2 CTAs ("Book Free Consultation" + "Message on WhatsApp")
- Suggested headline: "Ready to win locally?" or "Stop losing leads to a worse website."

#### 10. FOOTER
- Keep current footer structure. Logo + tagline on the left, link columns (Pages / Legal / Contact) on the right. Bottom row: © 2026 Innov8 Workflows · Built to automate. · Privacy Policy

---

## 9. What to ask Jamie before/during the rebuild

1. **Hero slider slides** — does he want us to write the copy, or will he supply 3–5 headline+subtitle pairs? (If we're writing them, use the suggestions in §8 #2.)
2. **Before/after image pairs** — does he have screenshots of the OLD sites (the ones he replaced) for any of his clients? Without these, the section becomes a "gallery" only (no slider).
3. **Reviews** — does he have any beyond the A2B Facebook one? Even short text quotes from clients (via WhatsApp, email) we can attribute. If not, lean on the A2B quote + result-based "quotes" pulled from case studies.
4. **hero02.png** — confirm he's happy for it to be the Final CTA background uncolour-overlaid. If readability suffers, we may need a very light text shadow or strategic positioning.

---

## 10. Hard constraints (don't break these)

- ❌ **No pricing anywhere.** No "from £…", no budget tiers, no monthly fees.
- ❌ Don't break the floating widgets (§6a), chatbot (§6b), or cookie banner (§6c).
- ❌ Don't replace the nav (§6e). Stays consistent across all pages.
- ❌ Don't reintroduce a real form-submit endpoint. WhatsApp redirect only.
- ❌ Don't add npm/React/Next/build steps. Pure HTML/CSS/JS, inline, single file.
- ✅ Keep all current animated heroes on the OTHER pages intact (services DNA video, about shader nebula, case-studies depth parallax, consultancy wireframe, how-it-works video). This brief is ONLY about `index.html`.
- ✅ Mobile-first. Test on a 390×844 viewport (iPhone). Hamburger menu must work.
- ✅ Lighthouse-friendly. Don't bloat the file beyond ~1MB. Compress images if needed (already mostly done — most are ~1.5–2MB PNGs, fine).

---

## 11. Suggested starting prompt for the new session

> Read `REBUILD_BRIEF.md` at the root of `K:/AI/innov8 Workflows/`. That's the full context.
> Then rebuild `index.html` around the new 10-section structure in §8 of that brief.
> Keep the floating widgets, chatbot, nav, mobile menu, and cookie banner intact.
> Local dev: just edit + open the file. Deploy: `git add index.html && git commit && git push origin main`.
> The repo is `Innov8-workflows/innov8-workflows` on `main`. Live site is `innov8workflows.co.uk`.
> Before you start writing code, surface any open questions from §9 of the brief and I'll answer them in one go.

---

*Brief drafted 2026-05-21. Update §7 (case studies) and §3 (brand tokens) if either drifts.*
