/* ============================================================
   Derby & Nottingham Roofing — page generation
   Run:  node generate.js   (writes all .html + sitemap + robots)
   ============================================================ */
const fs = require("fs");
const B = require("./build.js");
const { SITE, SERVICES, TOWNS, TOWN_COPY, svcBySlug, townBySlug, I, esc, TEL,
  localBusinessLD, breadcrumbLD, faqLD, serviceLD,
  navbar, trustStrip, areasSection, finalCta, footer, head, pageHero, sidebar, faqSection, relatedServices } = B;

const OUT = {};
const HOME = { name: "Home", slug: "index.html" };
function crumbsFor(name) { return [HOME, { name, slug: "" }]; }
const ticks = arr => `<ul class="ticks">${arr.map(x => `<li>${x}</li>`).join("")}</ul>`;
const wrapHtml = (s) => s; // identity, readability

/* ============================================================
   SERVICE PAGE CONTENT (unique per service)
   ============================================================ */
const SVC = {
  "new-roofs": {
    eyebrow: "New roofs & re-roofing",
    h1: 'New Roofs & Re-Roofing in <span class="hl">Derby & Nottingham</span>',
    lead: "Complete re-roofs and new roofs built to last — quality tiles and slates, modern breathable membranes and a tidy, fully-insured finish across Derby, Nottingham and the East Midlands.",
    desc: "New roofs & re-roofing in Derby & Nottingham. Full roof replacements in concrete tile, clay or natural slate — breathable membrane, new flashings, scaffold and a workmanship guarantee. Free quotes.",
    intro: [
      "When repairs are no longer keeping the water out, a full re-roof is the job that finally puts it to bed. Most pitched roofs across Derby and Nottingham last somewhere between 40 and 70 years depending on the covering — so if yours is reaching that age, sagging between the rafters, shedding tiles or letting damp into the loft, it's usually more cost-effective to replace it than to keep patching.",
      "We strip the old covering right back, check and treat the timbers, and rebuild the roof properly from the membrane up. You get a clear written quote before we start, a fixed price with no surprises, and a roof that's good for decades."
    ],
    includesH: "What a re-roof with us includes",
    includes: [
      "Full strip and responsible disposal of the old covering",
      "New breathable felt membrane and treated, graded battens",
      "Your choice of concrete tile, clay tile or natural slate",
      "New ridge, hip and verge — dry-fix (mortar-free) ridge and verge available",
      "New lead flashings to chimneys, abutments and valleys",
      "New fascias, soffits and guttering if needed",
      "Full scaffold for a safe, tidy job",
      "Building-control sign-off arranged where required",
      "Site left clean — all waste taken away"
    ],
    sections: [
      { h: "Signs you might need a new roof", body:
        `<p>It's not always obvious from the ground. The clearest signs are persistent leaks that come back after repairs, several slipped or cracked tiles at once, a roofline that's started to dip or sag, daylight or damp visible in the loft, and crumbling mortar along the ridge. If you're seeing two or three of these, it's worth a free survey before the next big storm.</p>` },
      { h: "Tiles, slates & materials", body:
        `<p>We fit concrete interlocking tiles (the most cost-effective and very durable), traditional clay tiles for period and conservation-area properties, and natural or fibre-cement slate where a slate look is wanted. On older Derbyshire and Nottinghamshire homes we'll match the existing covering as closely as possible so the new roof looks right for the property.</p>
         <p>Every re-roof goes on over a modern breathable membrane, which lets the roof space ventilate and helps prevent condensation — a common cause of "leaks" that aren't actually coming through the tiles at all.</p>` },
      { h: "How long does a re-roof take?", body:
        `<p>A typical semi-detached or terraced house takes around 3–5 working days once the scaffold is up, weather permitting. Larger or more complex roofs take longer. We'll give you a realistic timescale with your quote and keep you updated as the job progresses.</p>` }
    ],
    faqs: [
      { q: "How much does a new roof cost in Derby or Nottingham?", a: "Every roof is different — size, pitch, access, the covering you choose and whether the timbers or guttering need work all affect the price. That's exactly why our surveys and quotes are free: we'll measure up, talk through the options and give you a clear written price with no obligation." },
      { q: "Do you offer a guarantee on a new roof?", a: "Yes — we back every re-roof with up to a 25-year guarantee, and the tiles, slates and membranes we fit carry their own manufacturer warranties on top. We'll confirm the details in writing with your quote." },
      { q: "Will I need to move out during the work?", a: "No. A re-roof is all external work, so you can stay in the property throughout. We protect the area around the house, keep things tidy and clear away all waste when we're finished." },
      { q: "Can you re-roof just one section or a single pitch?", a: "Yes — if only one slope or section has failed we can re-cover that part rather than the whole roof. We'll always recommend the most sensible option for your roof and budget rather than over-selling the job." }
    ]
  },
  "roof-repairs": {
    eyebrow: "Roof repairs",
    h1: 'Roof Repairs in <span class="hl">Derby & Nottingham</span>',
    lead: "Fast, tidy roof repairs across Derby and Nottingham — slipped tiles, leaks, storm damage, ridge and flashing work. We find the problem, fix it properly and stop it coming back.",
    desc: "Roof repairs in Derby & Nottingham. Slipped & broken tiles, leaks, storm damage, ridge re-bedding, lead flashing and emergency make-safe. Fast response, fair prices, free quotes.",
    intro: [
      "Most roofs don't fail all at once — it starts with a slipped tile, a bit of cracked mortar or a tired flashing, and the first you know about it is a damp patch on the ceiling. The sooner it's looked at, the smaller (and cheaper) the fix.",
      "We track leaks back to their real source rather than just patching where the water shows up, carry out the repair properly, and leave you with a roof that's watertight again. No call-out games, no scare tactics — just an honest fix at a fair price."
    ],
    includesH: "Roof repairs we carry out",
    includes: [
      "Slipped, cracked and missing tiles or slates replaced",
      "Leak detection and tracing",
      "Ridge and hip tiles re-bedded or dry-fixed",
      "Lead flashing repaired or renewed",
      "Valley repairs and re-lining",
      "Storm and wind-damage repairs",
      "Moss removal and roof cleaning",
      "Emergency make-safe and temporary covering"
    ],
    sections: [
      { h: "Common roofing problems we fix", body:
        `<p>The jobs we're called out for most are slipped tiles after high winds, leaks around chimneys and flashings, cracked or hollow-sounding ridge mortar, blocked or overflowing valleys, and damp coming in around rooflights and abutments. All of these are very fixable — and far cheaper to deal with early than to leave until the ceiling or timbers are affected.</p>` },
      { h: "Emergency & storm-damage repairs", body:
        `<p>When the weather strips tiles or lifts a section of flashing, water gets in fast. We can get out to make the roof safe — sheeting it over or carrying out a temporary repair — and then come back to put it right properly. If you've had storm damage across Derby or Nottingham, call us as early as you can so we can stop it getting worse.</p>` }
    ],
    faqs: [
      { q: "How quickly can you come out for a roof repair?", a: "For leaks and storm damage we prioritise getting out to you as soon as possible — often the same or next day to make the roof safe. Call us and we'll give you a realistic time based on where you are and how urgent it is." },
      { q: "Do you charge a call-out fee?", a: "No. We'll come and take a look, find the cause and give you a clear price before any work starts. Our quotes are free and there's no obligation." },
      { q: "My ceiling is leaking — what should I do first?", a: "If it's safe, put a bucket under the drip and move anything valuable out of the way. If water is near light fittings, switch that circuit off at the consumer unit. Then call us — the sooner we trace the leak, the less damage it does." },
      { q: "Is it worth repairing an old roof or should I replace it?", a: "If the covering is generally sound and only a few areas have failed, a repair is the sensible, cost-effective choice. If you're getting repeated leaks across the whole roof, we'll give you an honest view on whether a re-roof would actually save you money long-term." }
    ]
  },
  "flat-roofing": {
    eyebrow: "Flat roofing",
    h1: 'Flat Roofing in <span class="hl">Derby & Nottingham</span>',
    lead: "Long-life flat roofs across Derby and Nottingham — EPDM rubber and GRP fibreglass for extensions, garages, dormers and porches. Seamless, watertight finishes that don't blister or split.",
    desc: "Flat roofing in Derby & Nottingham. EPDM rubber and GRP fibreglass flat roofs for extensions, garages, dormers & porches — seamless, durable and watertight. Free quotes.",
    intro: [
      "The old days of bubbling, cracking felt flat roofs are well behind us. Modern EPDM rubber and GRP fibreglass systems are seamless, UV-stable and routinely last 25–30 years or more — so a flat roof no longer means a roof that's forever leaking.",
      "Whether it's a flat-roofed extension, a garage, a dormer or a porch, we'll strip the failed covering, check and re-deck if needed, and lay a new system that's genuinely watertight."
    ],
    includesH: "Our flat roofing work",
    includes: [
      "EPDM rubber flat roofs (single-piece, seamless)",
      "GRP fibreglass flat roofs (hard-wearing, fire-resistant)",
      "Extension, garage, dormer and porch roofs",
      "New OSB decking and firrings where needed",
      "New trims, drips and edge detailing",
      "Outlets, gutters and rainwater connections",
      "Warm-roof upgrades for habitable rooms below",
      "Old felt and asphalt stripped and disposed of"
    ],
    sections: [
      { h: "EPDM rubber vs GRP fibreglass", body:
        `<p><strong>EPDM rubber</strong> is laid as a single sheet with no seams or joints to fail, flexes with temperature changes and is ideal for garages, extensions and larger flat areas. <strong>GRP fibreglass</strong> is a glass-reinforced resin laid in layers and cured to a hard, seamless shell — excellent where the roof might take foot traffic or where a neat, painted finish is wanted. We'll recommend the right one for your roof and how it's used.</p>` },
      { h: "Why modern flat roofs last", body:
        `<p>Both systems are fully bonded and seamless, so there are no laps for water to creep under — the usual failure point on old felt roofs. Done properly, with the decking sound and the edges detailed correctly, a modern flat roof is a fit-and-forget job for decades.</p>` }
    ],
    faqs: [
      { q: "How long does an EPDM or fibreglass flat roof last?", a: "A correctly installed EPDM rubber or GRP fibreglass roof typically lasts 25–30 years or more, and both come with manufacturer guarantees. The key is sound decking and proper edge detailing — which is exactly what we focus on." },
      { q: "Can you replace an old felt flat roof?", a: "Yes — that's one of our most common flat-roofing jobs. We strip the old felt, check and replace any soft decking, then lay a new EPDM or fibreglass system that won't blister or split like felt does." },
      { q: "Can a flat roof be walked on?", a: "GRP fibreglass copes well with occasional foot traffic for maintenance, and we can specify a walk-on grade if you need access. For balconies or roof terraces, let us know at the survey and we'll design it accordingly." },
      { q: "Do you do flat roofs on garages and extensions?", a: "Absolutely — garages, single-storey extensions, dormers and porches are the bread and butter of flat roofing. We'll give you a free quote with the right system for the job." }
    ]
  },
  "chimney-repairs": {
    eyebrow: "Chimneys & repointing",
    h1: 'Chimney Repairs & Repointing in <span class="hl">Derby & Nottingham</span>',
    lead: "Chimney repairs, repointing, rebuilds, flashing and lead work across Derby and Nottingham. The chimney is one of the most common sources of leaks — we'll make yours watertight again.",
    desc: "Chimney repairs & repointing in Derby & Nottingham. Repointing, rebuilds, lead flashing, flaunching, cowls and removals — stop chimney leaks for good. Free quotes.",
    intro: [
      "The chimney takes more weather than any other part of the roof, so it's no surprise it's behind so many leaks. Failed flashing, eroded pointing, cracked flaunching at the top or a leaning stack all let water in — often showing up as damp in an upstairs room or a stain on the chimney breast.",
      "We deal with the lot: repointing, re-flashing in lead, re-bedding pots, rebuilds and full removals. If your chimney is letting water in, we'll find out exactly where and put it right."
    ],
    includesH: "Chimney work we carry out",
    includes: [
      "Repointing eroded or cracked mortar joints",
      "New lead flashing and soakers around the stack",
      "Re-bedding chimney pots and renewing flaunching",
      "Partial and full chimney rebuilds",
      "Chimney removal and roofing over",
      "Cowls and caps fitted to stop rain and birds",
      "Waterproofing and damp-proofing treatments",
      "Stack strapping and stabilising where needed"
    ],
    sections: [
      { h: "Why chimneys leak", body:
        `<p>The usual culprits are the lead flashing where the stack meets the roof (it lifts, splits or was never dressed in properly), the mortar pointing between the bricks (which erodes over decades of rain and frost), and the flaunching — the mortar bed the pots sit in — which cracks and lets water track straight down inside the stack. We check all three and fix whatever's failed.</p>` },
      { h: "Repointing & rebuilds", body:
        `<p>Where the pointing has gone but the stack is sound, repointing in a matching mortar restores it and keeps water out. Where brickwork has spalled or the stack is leaning, a partial or full rebuild is the proper fix. If a chimney is redundant, removing it and tiling over can be the most cost-effective option of all — we'll talk you through it.</p>` }
    ],
    faqs: [
      { q: "How do I know if my chimney needs repointing?", a: "Look for gaps or crumbling mortar between the bricks, sandy mortar dropping into the gutter, or damp appearing on the chimney breast inside. If you can see daylight through the joints or the pointing is visibly receded, it's time. A free survey will confirm it." },
      { q: "Can you remove a chimney we don't use?", a: "Yes. If a chimney is redundant we can take it down — either to roof level or fully — and tile over neatly so it blends with the rest of the roof. It removes a long-term maintenance liability and a common leak point." },
      { q: "Is the leak definitely the chimney?", a: "Not always — chimneys are a common source but so are valleys and flashings nearby. We trace the leak to its actual origin before quoting, so you're not paying to fix something that wasn't the problem." },
      { q: "Do you replace lead flashing around chimneys?", a: "Yes — proper code-rated lead, dressed and pointed in correctly, is the right material for chimney flashing and soakers. We renew failed flashing rather than relying on sealant bodges that don't last." }
    ]
  },
  "guttering": {
    eyebrow: "Guttering, fascias & soffits",
    h1: 'Guttering, Fascias & Soffits in <span class="hl">Derby & Nottingham</span>',
    lead: "New and replacement uPVC guttering, fascias and soffits across Derby and Nottingham. Proper drainage and clean, maintenance-free roofline trim that protects your home from damp.",
    desc: "Guttering, fascias & soffits in Derby & Nottingham. New & replacement uPVC gutters, fascias, soffits and downpipes — proper drainage that protects your walls. Free quotes.",
    intro: [
      "Guttering doesn't get much thought until it's overflowing down the wall — but failed gutters and rotten fascias are a leading cause of damp, stained brickwork and even roof-timber decay. Getting the roofline right protects everything below it.",
      "We replace tired timber and cast-iron systems with modern uPVC that won't rot, rust or need painting, set the falls correctly so water actually runs to the downpipe, and leave the front of your house looking sharp."
    ],
    includesH: "Roofline & guttering work",
    includes: [
      "New and replacement uPVC guttering",
      "Fascia boards renewed or capped over",
      "Soffits and ventilation strips",
      "Downpipes and rainwater outlets",
      "Bargeboards and roof-edge trim",
      "Gutter cleaning, re-aligning and unblocking",
      "Cast-iron and timber systems replaced",
      "Colour-matched to your home (black, white, brown, grey)"
    ],
    sections: [
      { h: "Why guttering matters", body:
        `<p>When water can't get away cleanly it runs down the wall instead — saturating the brickwork, finding its way into the cavity and showing up as internal damp. Overflowing gutters also rot fascias and soffits, which then let water and birds into the roof space. Sorting the roofline is one of the cheapest jobs that prevents some of the most expensive damage.</p>` },
      { h: "uPVC fascias & soffits", body:
        `<p>Modern uPVC roofline is the sensible replacement for old painted timber — it doesn't rot, never needs repainting and comes in a range of colours and woodgrain finishes. We can cap over sound timber or fully replace where the boards have gone, and add continuous soffit ventilation to keep the roof breathing.</p>` }
    ],
    faqs: [
      { q: "Can you just replace the guttering, or does it all have to be done?", a: "Either. If the fascias and soffits are sound we can simply renew the guttering. If the boards behind have rotted, it's worth doing them together while the access is there — we'll give you honest options at the survey." },
      { q: "What colours of guttering and fascia do you fit?", a: "uPVC comes in black, white, brown, anthracite grey and woodgrain finishes. We'll match it to your windows and the rest of the street so it looks right." },
      { q: "Do you clear blocked gutters?", a: "Yes — we clean, re-align and unblock gutters as well as replace them. If yours are overflowing, often a clean and a small adjustment to the falls is all that's needed." },
      { q: "My fascias are rotten and birds are getting in — can you help?", a: "Yes. Rotten fascias and gaps at the eaves are a classic way for birds and water to get into the roof. We renew the boards, close the gaps and fit ventilation so the roof stays dry and pest-free." }
    ]
  },
  "roof-surveys": {
    eyebrow: "Free roof surveys",
    h1: 'Free Roof Surveys in <span class="hl">Derby & Nottingham</span>',
    lead: "A free, honest roof inspection and a clear written quote across Derby and Nottingham. No pressure, no obligation, no scare tactics — just a straight answer about the state of your roof.",
    desc: "Free roof surveys in Derby & Nottingham. Honest roof inspections, written quotes and pre-purchase roof checks — no obligation, no pressure. Book your free survey today.",
    intro: [
      "Not sure whether your roof needs a repair, a section re-covered or a full replacement? A free survey takes the guesswork out of it. We'll inspect the roof, tell you honestly what we find, and put it in writing so you know exactly where you stand.",
      "We'd rather give you a straight answer than sell you a job you don't need — a lot of our work comes from being honest with people, and that starts at the survey."
    ],
    includesH: "What our free survey covers",
    includes: [
      "External inspection of the roof covering and ridges",
      "Check of flashings, valleys and the chimney",
      "Assessment of guttering, fascias and soffits",
      "Loft check for leaks, daylight and damp where accessible",
      "A clear explanation of what we find",
      "A written, itemised, no-obligation quote",
      "Honest advice on repair vs replacement",
      "Pre-purchase roof checks for buyers"
    ],
    sections: [
      { h: "Buying a house? Get the roof checked", body:
        `<p>A homebuyer's survey often flags the roof with a vague "further investigation recommended". We carry out pre-purchase roof inspections across Derby and Nottingham so you know what you're taking on — and what it's likely to cost — before you commit. It can be a useful card at the negotiating table too.</p>` },
      { h: "No pressure, ever", body:
        `<p>You won't get a hard sell from us. We'll show you what we've found, answer your questions and leave you with a written quote to think over. If it's a small repair, we'll tell you — and if the roof is fine, we'll tell you that too.</p>` }
    ],
    faqs: [
      { q: "Is the survey really free?", a: "Yes — completely free and with no obligation. We'll inspect the roof, explain what we find and give you a written quote. Whether you go ahead is entirely up to you." },
      { q: "What happens during a roof survey?", a: "We inspect the covering, ridges, flashings, valleys, chimney and guttering from the outside, and check the loft for signs of leaks or damp where we can access it. Then we talk you through what we've found and follow up with a written quote." },
      { q: "Do you do pre-purchase roof inspections?", a: "Yes. If you're buying a property and want to know the true condition of the roof before exchanging, we'll inspect it and give you a clear written report and likely costs for any work." },
      { q: "How soon can you survey my roof?", a: "Usually within a few days, and sooner if it's urgent. Give us a call or send the form and we'll arrange a time that suits you." }
    ]
  }
};

/* ---------- service page ---------- */
function buildService(s) {
  const c = SVC[s.slug];
  const p = {
    slug: s.slug + ".html", active: "services", title: `${s.nav} in Derby & Nottingham | ${SITE.name}`,
    desc: c.desc, ogImg: s.img,
    schema: [localBusinessLD(), serviceLD(s.nav, c.desc), faqLD(c.faqs),
      breadcrumbLD([{ name: "Home", slug: "" }, { name: s.short, slug: s.slug + ".html" }])]
  };
  const hero = pageHero({ heroImg: s.img, eyebrow: c.eyebrow, h1: c.h1, lead: c.lead,
    crumbs: [{ name: "Home", slug: "index.html" }, { name: s.short }] });
  const proseSections = c.sections.map(sec => `<h2>${sec.h}</h2>${sec.body}`).join("\n");
  const body = `
${hero}
${trustStrip()}
<section class="section content"><div class="wrap"><div class="content-layout">
  <div class="prose">
    ${c.intro.map(x => `<p>${x}</p>`).join("\n    ")}
    <img class="feature-img" src="assets/img/${s.img}" alt="${s.nav} by ${SITE.name} in Derby and Nottingham" loading="lazy">
    <h2>${c.includesH}</h2>
    ${ticks(c.includes)}
    ${proseSections}
    <div class="callout"><p>Covering <strong>Derby, Nottingham</strong> and the towns around them — from Long Eaton and Beeston to Belper, Ilkeston and West Bridgford. <a href="contact.html">Get your free quote</a> or call <a href="${TEL}">${SITE.phone}</a>.</p></div>
  </div>
  ${sidebar(s.slug)}
</div></div></section>
${faqSection(c.faqs)}
${relatedServices(s.slug)}
${areasSection()}
${finalCta(`Free quotes on all ${s.nav.toLowerCase()} across Derby, Nottingham and the East Midlands.`)}`;
  OUT[p.slug] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- location page ---------- */
function buildTown(t) {
  const c = TOWN_COPY[t.slug];
  const faqs = [
    { q: `Do you cover ${t.town}?`, a: `Yes — ${t.town} is right in our patch. We're local roofers covering ${t.town} and the surrounding ${t.county} area for repairs, re-roofs, flat roofing, chimneys and guttering.` },
    { q: `How quickly can you get to ${t.town}?`, a: `We're usually only a short drive from ${t.town}, so for leaks and storm damage we aim to get out fast — often the same or next day to make things safe. Call us and we'll give you a realistic time.` },
    { q: `Do you charge for a quote in ${t.town}?`, a: `No. Our roof surveys and quotes in ${t.town} are completely free and with no obligation. We'll take a look, explain what we find and put a clear price in writing.` }
  ];
  const p = {
    slug: t.slug + ".html", active: "areas", ogImg: "g1.jpg",
    title: `Roofers in ${t.town} | Roofing ${t.county} | ${SITE.name}`,
    desc: `Trusted roofers in ${t.town}, ${t.county}. New roofs, roof repairs, flat roofing, chimneys & guttering. Fully insured, free surveys and honest quotes. Call ${SITE.phone}.`,
    schema: [localBusinessLD(), serviceLD(`Roofing in ${t.town}`, `Roofing services in ${t.town}, ${t.county}`), faqLD(faqs),
      breadcrumbLD([{ name: "Home", slug: "" }, { name: `Roofers in ${t.town}`, slug: t.slug + ".html" }])]
  };
  const hero = pageHero({ heroImg: "g3.jpg", eyebrow: `Roofers in ${t.town}`, h1: `Roofers in <span class="hl">${t.town}</span>`,
    lead: `Your local, fully-insured roofing team for ${t.town} and the surrounding ${t.county} area. Repairs, re-roofs, flat roofing, chimneys and guttering — honest quotes and tidy work.`,
    crumbs: [{ name: "Home", slug: "index.html" }, { name: `Roofers in ${t.town}` }] });

  const svcMini = SERVICES.map(s => `<li><a href="${s.slug}.html">${s.nav}</a> — ${s.blurb}</li>`).join("\n      ");
  const nearby = (c.nearby || []).map(n => esc(n)).join(", ");
  const body = `
${hero}
${trustStrip()}
<section class="section content"><div class="wrap"><div class="content-layout">
  <div class="prose">
    <h2>Your local roofers in ${t.town}</h2>
    <p>${c.intro}</p>
    <p>From a single slipped tile to a full re-roof, we carry out the whole range of roofing work ${c.landmarks}. Every job comes with a free survey, a clear written quote and a workmanship guarantee — and we leave your property clean and tidy when we're done.</p>
    <img class="feature-img" src="assets/img/g5.jpg" alt="Roofing work by ${SITE.name} near ${t.town}, ${t.county}" loading="lazy">
    <h2>Roofing services in ${t.town}</h2>
    <ul class="ticks">
      ${svcMini}
    </ul>
    <h2>Why choose a local ${t.town} roofer?</h2>
    <p>Using a roofer who knows ${t.town} means we understand the local housing stock, we're close by if anything needs a second look, and we're staking our local reputation on every job. We're fully insured, we turn up when we say we will, and our prices are honest — the quote we give you is the price you pay.</p>
    <div class="callout"><p>Also covering nearby ${nearby}. <a href="contact.html">Get your free quote in ${t.town}</a> or call <a href="${TEL}">${SITE.phone}</a>.</p></div>
  </div>
  ${sidebar()}
</div></div></section>
<section class="section services"><div class="wrap">
  <div class="section-head center"><span class="eyebrow">What we do in ${t.town}</span><h2>Roofing services, done properly</h2></div>
  <div class="svc-grid">${SERVICES.map(s => `
    <a class="svc-card" href="${s.slug}.html"><div class="svc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg></div><h3>${s.nav}</h3><p>${s.blurb}</p><span class="more">Learn more ${I.arrow}</span></a>`).join("")}
  </div></div></section>
${faqSection(faqs)}
${areasSection(t.slug)}
${finalCta(`Looking for trusted roofers in ${t.town}? Get a free, no-obligation quote today.`)}`;
  OUT[p.slug] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- homepage ---------- */
function buildHome() {
  const p = {
    slug: "index.html", active: "home", ogImg: "g1.jpg",
    title: `${SITE.name} | Roofers in Derby & Nottingham | Free Quotes`,
    desc: "Trusted roofing contractors covering Derby & Nottingham. New roofs, roof repairs, flat roofing, chimneys, guttering & free roof surveys. Fully insured. Free, no-obligation quotes.",
    schema: [localBusinessLD(),
      { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url }]
  };
  const svcCards = SERVICES.map(s => `
        <a class="svc-card" href="${s.slug}.html">
          <div class="svc-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg></div>
          <h3>${s.nav}</h3><p>${s.blurb}</p><span class="more">Learn more ${I.arrow}</span>
        </a>`).join("");
  const gal = [
    ["roof1.jpg", "Full re-roof &middot; Concrete tile"],
    ["g5.jpg", "Clay tile roof &middot; New ridge &amp; hips"],
    ["g1.jpg", "Full re-roof &middot; Natural slate"],
    ["g2.jpg", "Chimney works &middot; New lead flashing"],
    ["g3.jpg", "Hip roof &middot; Ridge re-bed"],
    ["g4.jpg", "Slate roof &middot; Dormer detail"],
  ].map(([img, cap]) => `<div class="gal-item"><img src="assets/img/${img}" alt="${cap.replace(/&middot;/g, "-").replace(/&amp;/g, "&")} by ${SITE.name}" loading="lazy"><div class="cap">${cap}</div></div>`).join("");

  const body = `
<section class="hero" id="top">
  <div class="hero-slides">
    <video class="hero-video active" id="heroVideo3" muted playsinline preload="auto" poster="assets/img/hero-03-poster.jpg" disablepictureinpicture>
      <source src="assets/orbital-03.mp4" type="video/mp4">
    </video>
    <video class="hero-video" id="heroVideo" muted playsinline preload="auto" poster="assets/img/hero-poster.jpg" disablepictureinpicture>
      <source src="assets/hero.mp4" type="video/mp4">
    </video>
    <video class="hero-video" id="heroVideo2" muted playsinline preload="auto" poster="assets/img/hero-02-poster.jpg" disablepictureinpicture>
      <source src="assets/orbital-02.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <img class="hero-logo" src="assets/img/logo.png" alt="${esc(SITE.name)}" width="560" height="373">
    <h1>Roofing Specialists Across <span class="hl">Derby &amp; Nottingham</span></h1>
    <p class="sub">New roofs, repairs, flat roofing, chimneys &amp; guttering — carried out by a fully insured local team with over 23 years' experience. Free surveys, honest quotes, work that lasts.</p>
    <div class="hero-btns">
      <a class="btn btn-primary" href="contact.html">${I.quote}Get my free quote</a>
      <a class="btn btn-ghost" href="${TEL}">${I.phone}Call the team</a>
    </div>
  </div>
</section>
${trustStrip()}
<section class="section services" id="services"><div class="wrap">
  <div class="section-head center"><span class="eyebrow">What we do</span><h2>Roofing services, done properly</h2>
    <p>From a single slipped tile to a complete re-roof, we cover every job across Derby &amp; Nottingham — pitched and flat.</p></div>
  <div class="svc-grid">${svcCards}</div></div></section>
<section class="section ba" id="ba"><div class="wrap">
  <div class="section-head center"><span class="eyebrow">See the difference</span><h2>Before &amp; after</h2>
    <p>Watch recent jobs go from tired and worn to a fresh, watertight finish — real roofs, real results across Derby &amp; Nottingham.</p></div>
  <div class="cases">
    <article class="case">
      <div class="case-media"><div class="case-frame">
        <div class="ba-corner"><span class="dot"></span>Before &rarr; After</div>
        <video id="baVideo" class="ba-video" muted loop playsinline autoplay preload="auto" poster="assets/img/g1.jpg" disablepictureinpicture><source src="assets/before-after.mp4" type="video/mp4"></video>
      </div></div>
      <div class="case-body">
        <span class="eyebrow">Full Roof Strip &amp; Re-Slate</span>
        <h3>A worn slate roof made watertight again</h3>
        <p>An old, weathered slate roof stripped right back and re-covered with brand-new natural slate over a breathable membrane and fresh battens — finished with new guttering and a crisp, clean line across the eaves.</p>
        <span class="case-loc">${I.pin}Derby</span>
      </div>
    </article>
    <article class="case">
      <div class="case-media"><div class="case-frame">
        <div class="ba-corner"><span class="dot"></span>Before &rarr; After</div>
        <video id="baVideo2" class="ba-video" muted loop playsinline autoplay preload="auto" poster="assets/img/ba2-poster.jpg" disablepictureinpicture><source src="assets/before-after-02.mp4" type="video/mp4"></video>
      </div></div>
      <div class="case-body">
        <span class="eyebrow">Full Re-Roof</span>
        <h3>Stripped back and built to last</h3>
        <p>Taken right back and rebuilt properly — new timbers, breathable felt, treated battens and a fresh tile covering throughout, with new ridge and leadwork. A complete re-roof built to keep the home dry and solid for decades.</p>
        <span class="case-loc">${I.pin}Nottingham</span>
      </div>
    </article>
    <article class="case">
      <div class="case-media"><div class="case-frame">
        <div class="ba-corner"><span class="dot"></span>Before &rarr; After</div>
        <video id="baVideo3" class="ba-video" muted loop playsinline autoplay preload="auto" poster="assets/img/ba3-poster.jpg" disablepictureinpicture><source src="assets/before-after-03.mp4" type="video/mp4"></video>
      </div></div>
      <div class="case-body">
        <span class="eyebrow">Chimney Rebuild &amp; Repoint</span>
        <h3>A tired chimney made solid again</h3>
        <p>A weathered chimney stack rebuilt and repointed from the flashing up — fresh lead, a new cap and crisp mortar joints throughout, so the wet stays out and the stack stands straight for years to come.</p>
        <span class="case-loc">${I.pin}Loughborough</span>
      </div>
    </article>
  </div>
  <div class="center" style="margin-top:46px"><a class="btn btn-primary" href="contact.html">${I.quote}Get a quote like this</a></div>
</div></section>
<section class="section gallery" id="work"><div class="wrap">
  <div class="section-head center"><span class="eyebrow">Our work</span><h2>Recent projects</h2>
    <p>A look at some of the roofs we've completed for homeowners across the East Midlands.</p></div>
  <div class="gal-grid">${gal}</div>
  <div class="center" style="margin-top:30px"><a class="btn btn-dark" href="gallery.html">View the full gallery ${I.arrow}</a></div>
</div></section>
<section class="section why" id="why"><div class="wrap"><div class="why-grid">
  <div>
    <div class="section-head" style="margin-bottom:30px"><span class="eyebrow">Why choose us</span><h2>Local roofers you can actually trust</h2></div>
    <div class="why-list">
      <div class="why-item"><div class="why-num">1</div><div><h3>23 Years Established</h3><p>Over two decades roofing across Derby, Nottingham and the wider Midlands — we know the houses, the weather and the right way to do the job.</p></div></div>
      <div class="why-item"><div class="why-num">2</div><div><h3>Insured &amp; Guaranteed</h3><p>£5 million public liability cover and up to a 25-year guarantee on our work. Total peace of mind, every job.</p></div></div>
      <div class="why-item"><div class="why-num">3</div><div><h3>Honest, Upfront Quotes</h3><p>A clear written price before we start. No hidden extras, no pushy sales — just a fair job at a fair price.</p></div></div>
      <div class="why-item"><div class="why-num">4</div><div><h3>Tidy &amp; Reliable</h3><p>We turn up when we say we will, protect your property and leave the site clean when we're done.</p></div></div>
    </div>
  </div>
  <div>
    <div class="why-photo"><img src="assets/img/roof1.jpg" alt="Tiled roof completed by ${SITE.name}" loading="lazy"></div>
    <div class="why-stats">
      <div class="why-stat"><div class="n">23</div><div class="l">Years in business</div></div>
      <div class="why-stat"><div class="n">£5m</div><div class="l">Insured</div></div>
      <div class="why-stat"><div class="n">25yr</div><div class="l">Guarantee</div></div>
    </div>
  </div>
</div></div></section>
<section class="section reviews" id="reviews"><div class="wrap">
  <div class="section-head center"><span class="eyebrow">Reviews</span><h2>What our customers say</h2><p>Rated by homeowners across Derby &amp; Nottingham.</p></div>
  <div class="rev-stage"><div class="rev-track"><div class="rev-row" id="revRow"></div></div>
    <div class="rev-nav">
      <button class="rev-arrow" id="revPrev" aria-label="Previous review"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
      <div class="rev-dots" id="revDots"></div>
      <button class="rev-arrow" id="revNext" aria-label="Next review"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
    <div class="center" style="margin-top:24px"><a class="btn btn-dark" href="reviews.html">Read more reviews ${I.arrow}</a></div>
  </div></div></section>
<section class="section about" id="about"><div class="wrap about-grid">
  <div class="about-photo"><img src="assets/img/truck.jpg" alt="${esc(SITE.name)} van loaded with materials" loading="lazy"></div>
  <div class="about-body">
    <span class="eyebrow">Meet the team</span><h2>The roofers behind the work</h2>
    <p>${SITE.name} is a family-run roofing company with over 23 years' experience and a team of 15. We've grown by word of mouth — one happy customer at a time — and we treat every roof like it's our own.</p>
    <p>Whether it's a quick repair or a full re-roof, you'll deal with the same friendly team from the first survey to the final clean-up. No call centres, no middlemen, no nonsense.</p>
    <div class="center" style="text-align:left;margin-top:22px"><a class="btn btn-dark" href="about.html">More about us ${I.arrow}</a></div>
  </div>
</div></section>
${areasSection()}
${contactSection()}
${finalCta()}`;
  OUT["index.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- reusable contact section ---------- */
function contactSection() {
  return `<section class="section contact" id="contact"><div class="wrap contact-grid">
    <div class="contact-info">
      <div class="section-head" style="margin-bottom:0"><span class="eyebrow">Get in touch</span><h2>Free quote, no obligation</h2></div>
      <p>Tell us about your roof and we'll come back to you fast — usually the same day. Send the form and it'll open straight in WhatsApp, or call us now.</p>
      <div class="ci-item"><div class="ic">${I.phone}</div><div class="t"><small>Call or text</small><a href="${TEL}">${SITE.phone}</a></div></div>
      <div class="ci-item"><div class="ic">${I.pin}</div><div class="t"><small>Areas covered</small><span>Derby &amp; Nottingham</span></div></div>
      <div class="ci-item"><div class="ic">${I.clock}</div><div class="t"><small>Hours</small><span>${SITE.hours}</span></div></div>
    </div>
    <div class="form">
      <div class="fr two">
        <div><label for="fName">Name</label><input id="fName" type="text" placeholder="Your name"></div>
        <div><label for="fPhone">Phone</label><input id="fPhone" type="tel" placeholder="Your number"></div>
      </div>
      <div class="fr two">
        <div><label for="fArea">Location</label><select id="fArea"><option value="">Select…</option><option>Derby</option><option>Nottingham</option><option>Surrounding area</option></select></div>
        <div><label for="fService">Service</label><select id="fService"><option value="">Select…</option><option>New roof / re-roof</option><option>Roof repair</option><option>Flat roofing</option><option>Chimney / repointing</option><option>Guttering / fascias / soffits</option><option>Free survey</option><option>Something else</option></select></div>
      </div>
      <div class="fr"><label for="fMsg">Details of the job</label><textarea id="fMsg" placeholder="e.g. a few tiles have come loose after the storm…"></textarea></div>
      <button class="btn btn-primary" id="sendWa" type="button">${I.wa}Send via WhatsApp</button>
      <p class="note">${I.wa}Opens WhatsApp with your details ready to send</p>
    </div>
  </div></section>`;
}

/* ---------- about page ---------- */
function buildAbout() {
  const p = { slug: "about.html", active: "about", ogImg: "truck.jpg",
    title: `About Us | ${SITE.name} | Local Roofers Derby & Nottingham`,
    desc: `Meet ${SITE.name} — a local, family-run, fully-insured roofing team covering Derby, Nottingham and the East Midlands. Honest quotes, tidy work and a workmanship guarantee.`,
    schema: [localBusinessLD(), breadcrumbLD([{ name: "Home", slug: "" }, { name: "About", slug: "about.html" }])] };
  const body = `
${pageHero({ heroImg: "work-2.jpg", eyebrow: "About us", h1: 'The roofers behind <span class="hl">the work</span>',
    lead: "A local, family-run roofing company covering Derby, Nottingham and the surrounding East Midlands — built on honest advice and proper workmanship.",
    crumbs: [{ name: "Home", slug: "index.html" }, { name: "About" }] })}
${trustStrip()}
<section class="section about"><div class="wrap about-grid">
  <div class="about-photo"><img src="assets/img/truck.jpg" alt="${esc(SITE.name)} van and team" loading="lazy"></div>
  <div class="about-body">
    <span class="eyebrow">Who we are</span><h2>Local roofers doing things properly</h2>
    <p>${SITE.name} is a family-run roofing company with over 23 years' experience and a team of 15. We've built the business the slow, honest way — by word of mouth, one happy customer at a time — and that reputation is something we protect on every single job.</p>
    <p>From a single slipped tile to a complete re-roof, you'll deal with the same friendly team from the first survey through to the final clean-up. No call centres, no middlemen, no pushy sales — just roofers who know their trade and take pride in it.</p>
    <p>We cover Derby, Nottingham and the towns around them, we're fully insured, and we back our work with a workmanship guarantee.</p>
    <div class="owner-line"><div class="why-num" style="border-radius:50%">J</div><div><div class="sig">Joe</div><div class="role">Owner &amp; Lead Roofer</div></div></div>
  </div>
</div></section>
<section class="section feat-band feat"><div class="wrap">
  <div class="section-head center" style="margin-left:auto;margin-right:auto"><span class="eyebrow">What you can expect</span><h2 style="color:#fff">Every job, the same standard</h2></div>
  <div class="feat-grid">
    <div class="feat">${I.check}<div><h3>Honest advice</h3><p>We'll tell you what your roof actually needs — repair or replace — not what makes us the most money.</p></div></div>
    <div class="feat">${I.check}<div><h3>£5m insured</h3><p>£5 million public liability cover and proper safety practice on every job, large or small.</p></div></div>
    <div class="feat">${I.check}<div><h3>Clear written quotes</h3><p>A fixed, itemised price before we start. The quote is the price — no surprise extras.</p></div></div>
    <div class="feat">${I.check}<div><h3>Tidy &amp; reliable</h3><p>We turn up when we say, protect your property and leave the site spotless.</p></div></div>
    <div class="feat">${I.check}<div><h3>25-year guarantee</h3><p>We back our work with up to a 25-year guarantee, and the materials we fit carry their own manufacturer warranties.</p></div></div>
    <div class="feat">${I.check}<div><h3>Experienced local team</h3><p>A team of 15 with over 23 years behind us, based in the East Midlands — close by if you ever need us again.</p></div></div>
  </div>
</div></section>
${areasSection()}
${contactSection()}
${finalCta()}`;
  OUT["about.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- contact page ---------- */
function buildContact() {
  const p = { slug: "contact.html", active: "contact", ogImg: "g2.jpg",
    title: `Contact Us | Free Roofing Quote | ${SITE.name}`,
    desc: `Contact ${SITE.name} for a free, no-obligation roofing quote in Derby, Nottingham or the surrounding area. Call ${SITE.phone} or send the form — we'll get straight back to you.`,
    schema: [localBusinessLD(), breadcrumbLD([{ name: "Home", slug: "" }, { name: "Contact", slug: "contact.html" }])] };
  const body = `
${pageHero({ heroImg: "g2.jpg", eyebrow: "Get in touch", h1: 'Get your <span class="hl">free quote</span>',
    lead: "Tell us about your roof and we'll come back to you fast — usually the same day. Call, text or send the form below.",
    crumbs: [{ name: "Home", slug: "index.html" }, { name: "Contact" }] })}
${trustStrip()}
${contactSection()}
${areasSection()}
${finalCta()}`;
  OUT["contact.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- gallery page ---------- */
function buildGallery() {
  const p = { slug: "gallery.html", active: "gallery", ogImg: "g1.jpg",
    title: `Our Work | Roofing Gallery | ${SITE.name}`,
    desc: `Recent roofing projects by ${SITE.name} across Derby & Nottingham — re-roofs, slate and tile work, chimneys, flat roofs and guttering. See the quality for yourself.`,
    schema: [localBusinessLD(), breadcrumbLD([{ name: "Home", slug: "" }, { name: "Gallery", slug: "gallery.html" }])] };
  const shots = [
    ["roof1.jpg", "Full re-roof &middot; Concrete tile"],
    ["g1.jpg", "Full re-roof &middot; Natural slate"],
    ["g5.jpg", "Clay tile roof &middot; New ridge &amp; hips"],
    ["g2.jpg", "Chimney works &middot; New lead flashing"],
    ["g3.jpg", "Hip roof &middot; Ridge re-bed"],
    ["g4.jpg", "Slate roof &middot; Dormer detail"],
    ["work-1.jpg", "New slate roof &middot; Eaves &amp; valley"],
    ["work-2.jpg", "Roof strip &middot; Work in progress"],
    ["work-3.jpg", "Slate roof &middot; Chimney &amp; ridge"],
  ].map(([img, cap]) => `<div class="gal-item"><img src="assets/img/${img}" alt="${cap.replace(/&middot;/g, "-").replace(/&amp;/g, "&")} by ${SITE.name}" loading="lazy"><div class="cap">${cap}</div></div>`).join("");
  const body = `
${pageHero({ heroImg: "g1.jpg", eyebrow: "Our work", h1: 'Recent <span class="hl">roofing projects</span>',
    lead: "A look at some of the roofs we've completed for homeowners across Derby, Nottingham and the East Midlands.",
    crumbs: [{ name: "Home", slug: "index.html" }, { name: "Gallery" }] })}
${trustStrip()}
<section class="section gallery"><div class="wrap"><div class="gal-grid">${shots}</div></div></section>
${relatedServices()}
${finalCta("Like what you see? Get a free, no-obligation quote for your own roof today.")}`;
  OUT["gallery.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- reviews page ---------- */
function buildReviews() {
  const p = { slug: "reviews.html", active: "reviews", ogImg: "g3.jpg",
    title: `Reviews | What Our Customers Say | ${SITE.name}`,
    desc: `Read reviews for ${SITE.name} from homeowners across Derby, Nottingham and the East Midlands. Honest, tidy, reliable roofing — see what local customers say.`,
    schema: [localBusinessLD(), breadcrumbLD([{ name: "Home", slug: "" }, { name: "Reviews", slug: "reviews.html" }])] };
  const body = `
${pageHero({ heroImg: "g3.jpg", eyebrow: "Reviews", h1: 'What our <span class="hl">customers say</span>',
    lead: "We've built our name on word of mouth across Derby and Nottingham. Here's what local homeowners have to say about our work.",
    crumbs: [{ name: "Home", slug: "index.html" }, { name: "Reviews" }] })}
${trustStrip()}
<section class="section reviews"><div class="wrap">
  <div class="rev-grid" id="revGrid"></div>
  <div class="center" style="margin-top:40px"><a class="btn btn-primary" href="contact.html">${I.quote}Get your free quote</a></div>
</div></section>
${areasSection()}
${finalCta()}`;
  OUT["reviews.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- FAQs page ---------- */
function buildFaqs() {
  const faqs = [
    { q: "What areas do you cover?", a: "We cover Derby, Nottingham and Long Eaton, then south across Leicestershire — Loughborough, Shepshed, Coalville and Ashby-de-la-Zouch — and into Staffordshire at Lichfield and Tamworth." },
    { q: "How long have you been roofing?", a: "Over 23 years. We're an established, family-run team of 15, and a lot of our work comes from repeat customers and recommendations across the East Midlands." },
    { q: "Are you insured?", a: "Yes — we carry £5 million public liability insurance and work to proper safety standards on every job, large or small." },
    { q: "Do you charge for quotes or surveys?", a: "No. All our roof surveys and quotes are completely free and with no obligation. We'll inspect the roof, explain what we find and give you a clear written price." },
    { q: "How quickly can you come out?", a: "For leaks and storm damage we prioritise getting out fast — often the same or next day to make the roof safe. For planned work we'll arrange a survey within a few days." },
    { q: "Do you offer a guarantee?", a: "Yes — we back our work with up to a 25-year guarantee, and the tiles, slates, membranes and flat-roof systems we fit carry their own manufacturer warranties." },
    { q: "Do you do emergency roof repairs?", a: "Yes — we carry out emergency make-safe and temporary covering for leaks and storm damage, then return to complete a permanent repair." },
    { q: "What types of roof do you work on?", a: "Both pitched and flat. That includes concrete, clay and natural slate pitched roofs, and EPDM rubber and GRP fibreglass flat roofs on extensions, garages and dormers." },
    { q: "How do I get a quote?", a: "Call or text us on " + SITE.phone + ", or send the contact form and it'll open in WhatsApp with your details ready to go. We'll arrange a free survey and get a written quote to you quickly." }
  ];
  const p = { slug: "faqs.html", active: "faqs", ogImg: "g1.jpg",
    title: `Roofing FAQs | ${SITE.name} | Derby & Nottingham`,
    desc: `Answers to common roofing questions — areas covered, insurance, quotes, guarantees, emergency repairs and more — from ${SITE.name}, your local Derby & Nottingham roofers.`,
    schema: [localBusinessLD(), faqLD(faqs), breadcrumbLD([{ name: "Home", slug: "" }, { name: "FAQs", slug: "faqs.html" }])] };
  const body = `
${pageHero({ heroImg: "g5.jpg", eyebrow: "FAQs", h1: 'Roofing <span class="hl">questions answered</span>',
    lead: "Everything you might want to know before getting in touch. Can't see your question? Just give us a call.",
    crumbs: [{ name: "Home", slug: "index.html" }, { name: "FAQs" }] })}
${trustStrip()}
${faqSection(faqs)}
${areasSection()}
${contactSection()}
${finalCta()}`;
  OUT["faqs.html"] = head(p) + navbar(p.active) + body + footer();
}

/* ---------- review-request card (private link for happy customers; noindex) ---------- */
function buildReview() {
  const G_SVG = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>';
  const F_SVG = '<svg viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<title>Leave a Review · ${esc(SITE.name)}</title>
<meta name="description" content="Thank you for choosing ${esc(SITE.name)}. Leave us a quick Google or Facebook review — it only takes 30 seconds.">
<meta name="theme-color" content="#0C0E13">
<link rel="icon" href="assets/img/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--ink:#0C0E13;--ink-2:#14171F;--orange:#F4731B;--orange-bright:#FF8A2B;--orange-deep:#E25E08;--blue:#2E7CC2;--cream:#F3F6FA;--paper:#fff;--text:#1B2330;--muted:#5C6675;--line:#E9EEF4;--gold:#FBBC04;--facebook:#1877f2}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--text);line-height:1.6;background:linear-gradient(rgba(12,14,19,.85),rgba(12,14,19,.92)),url('assets/img/hero-poster.jpg') center/cover fixed no-repeat;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:32px 16px}
.card{width:100%;max-width:560px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px -20px rgba(12,14,19,.5),0 4px 12px rgba(12,14,19,.08)}
.card-head{position:relative;padding:60px 28px 30px;text-align:center;color:#fff;overflow:hidden;background:var(--ink)}
.head-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.head-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(12,14,19,.34) 0%,rgba(12,14,19,.55) 50%,rgba(12,14,19,.82) 80%,rgba(12,14,19,.96) 100%)}
.logo-badge{position:relative;z-index:2;display:inline-flex;margin:0 auto 18px}
.logo-badge img{height:clamp(104px,26vw,140px);width:auto;object-fit:contain;display:block;filter:drop-shadow(0 12px 28px rgba(0,0,0,.6))}
.biz-tag{position:relative;z-index:2;font-family:'Barlow',sans-serif;font-size:.74rem;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:#fff;text-shadow:0 1px 10px rgba(0,0,0,.5)}
.card-body{padding:34px 30px 30px;text-align:center}
.stars{font-size:1.6rem;letter-spacing:6px;color:var(--gold);line-height:1;margin-bottom:18px}
.eyebrow{display:inline-block;font-family:'Barlow',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--orange-deep);margin-bottom:12px}
h1{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:2.4rem;line-height:1.05;text-transform:uppercase;color:var(--ink);margin-bottom:14px}
.lead{font-size:1.02rem;color:var(--text);max-width:42ch;margin:0 auto}
.favour{margin:28px 0 8px;padding:22px 22px 24px;background:var(--cream);border:1px solid var(--line);border-radius:16px}
.favour h2{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:1.5rem;text-transform:uppercase;color:var(--ink);margin-bottom:8px}
.favour p{font-size:.96rem;color:var(--muted)}
.btn{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;padding:17px 22px;margin-top:18px;font-family:'Barlow',sans-serif;font-weight:700;font-size:1.04rem;border-radius:12px;border:2px solid transparent;cursor:pointer;text-decoration:none;transition:transform .15s,box-shadow .2s,background .2s}
.btn:active{transform:translateY(1px)}
.btn-icon{width:26px;height:26px;flex-shrink:0;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center}
.btn-icon svg{width:18px;height:18px;display:block}
.btn-google{background:linear-gradient(135deg,var(--orange-bright),var(--orange-deep));color:#fff;box-shadow:0 12px 26px -10px rgba(226,94,8,.7)}
.btn-google:hover{transform:translateY(-2px)}
.btn-sub{font-size:.82rem;color:var(--muted);margin-top:11px}
.btn-facebook{background:#fff;color:var(--facebook);border-color:#dfe3ea}
.btn-facebook:hover{border-color:var(--facebook);background:#f7f9ff}
.btn-facebook .btn-icon{background:transparent}
.btn-facebook .btn-icon svg{width:26px;height:26px}
.steps{list-style:none;text-align:left;max-width:380px;margin:22px auto 4px}
.steps li{display:flex;align-items:flex-start;gap:14px;padding:11px 0;font-size:.95rem;color:var(--text);border-bottom:1px solid var(--line)}
.steps li:last-child{border-bottom:none}
.steps .num{flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.86rem;font-family:'Barlow Condensed',sans-serif}
.divider{display:flex;align-items:center;gap:14px;margin:30px 0 6px;color:var(--muted);font-size:.78rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-family:'Barlow',sans-serif}
.divider::before,.divider::after{content:"";flex:1;height:1px;background:var(--line)}
.alt-note{font-size:.92rem;color:var(--muted);margin-bottom:2px}
.reassure{margin-top:26px;padding-top:22px;border-top:1px solid var(--line);font-size:.9rem;color:var(--muted)}
.reassure a{color:var(--orange-deep);font-weight:700;text-decoration:none;white-space:nowrap}
.reassure a:hover{text-decoration:underline}
.card-foot{padding:18px 24px;text-align:center;background:var(--ink);color:#aeb6c2;font-size:.78rem}
.card-foot .credit{display:block;margin-top:6px;color:rgba(174,182,194,.6);font-size:.72rem}
.card-foot .credit a{color:#aeb6c2;text-decoration:none}
@media (max-width:480px){body{padding:0}.card{border-radius:0;min-height:100vh;max-width:none;box-shadow:none}h1{font-size:2.1rem}.card-body{padding:30px 22px 26px}}
</style>
</head>
<body>
  <main class="card">
    <header class="card-head">
      <video class="head-bg" autoplay muted loop playsinline preload="auto" poster="assets/img/hero-poster.jpg" aria-hidden="true">
        <source src="assets/before-after.mp4" type="video/mp4">
      </video>
      <div class="head-overlay" aria-hidden="true"></div>
      <div class="logo-badge"><img src="assets/img/logo.png" alt="${esc(SITE.name)} logo"></div>
      <p class="biz-tag">Roofing Specialists &middot; Derby &amp; Nottingham</p>
    </header>
    <div class="card-body">
      <div class="stars" aria-label="Five stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
      <p class="eyebrow">Job Complete</p>
      <h1>Thank you</h1>
      <p class="lead">We really appreciate you choosing ${esc(SITE.name)}. We hope you're delighted with your roof.</p>
      <div class="favour">
        <h2>A quick favour?</h2>
        <p>We're a local, family-run team, and honest reviews are the number-one way new homeowners decide to trust us. If you've got 30 seconds, a Google review would mean the world.</p>
        <a id="googleBtn" class="btn btn-google" href="#" target="_blank" rel="noopener"><span class="btn-icon">${G_SVG}</span>Leave a Google Review</a>
        <p class="btn-sub">Opens Google — takes about 30 seconds</p>
      </div>
      <ol class="steps">
        <li><span class="num">1</span><span>Tap the button above — it opens our Google page.</span></li>
        <li><span class="num">2</span><span>Sign in with your Google account if it asks.</span></li>
        <li><span class="num">3</span><span>Pick 5 stars, add a few words, and hit post. Done!</span></li>
      </ol>
      <div class="divider">No Google account?</div>
      <p class="alt-note">No problem — you can leave us a review on Facebook instead. It helps just as much.</p>
      <a id="fbBtn" class="btn btn-facebook" href="#" target="_blank" rel="noopener"><span class="btn-icon">${F_SVG}</span>Review us on Facebook</a>
      <p class="reassure">Not quite 100% happy? Please give us the chance to put it right first — call <a href="tel:+${SITE.phoneIntl}">07838&nbsp;250910</a> or <a href="https://wa.me/${SITE.phoneIntl}" target="_blank" rel="noopener">WhatsApp us</a>.</p>
    </div>
    <footer class="card-foot">
      &copy; <span id="year"></span> ${esc(SITE.name)} &middot; Derby &amp; Nottingham, UK
      <span class="credit">Website by <a href="https://innov8workflows.co.uk" target="_blank" rel="noopener">Innov8 Workflows</a></span>
    </footer>
  </main>
<script>
  /* Paste the business's real review links below. Until set, each button falls back to a search so it never breaks.
     GOOGLE: Google Business Profile -> "Ask for reviews" -> copy link (https://g.page/r/XXXX/review)
     FACEBOOK: the Page's reviews tab URL (https://www.facebook.com/YourPage/reviews) */
  var GOOGLE_REVIEW_URL   = "PASTE_GOOGLE_REVIEW_LINK_HERE";
  var FACEBOOK_REVIEW_URL = "PASTE_FACEBOOK_REVIEWS_LINK_HERE";
  function set(id, url, fallback){ var a = document.getElementById(id); a.href = (url && url.indexOf('PASTE_') !== 0) ? url : fallback; }
  set('googleBtn', GOOGLE_REVIEW_URL, "https://www.google.com/search?q=" + encodeURIComponent("${esc(SITE.name)} reviews"));
  set('fbBtn', FACEBOOK_REVIEW_URL, "https://www.facebook.com/search/top?q=" + encodeURIComponent("${esc(SITE.name)}"));
  document.getElementById('year').textContent = new Date().getFullYear();
</script>
</body>
</html>`;
}

/* ============================================================
   RUN
   ============================================================ */
buildHome();
buildAbout();
buildContact();
buildGallery();
buildReviews();
buildFaqs();
SERVICES.forEach(buildService);
TOWNS.forEach(buildTown);

let count = 0;
for (const [file, html] of Object.entries(OUT)) {
  fs.writeFileSync(file, html);
  count++;
}

/* sitemap.xml */
const today = process.env.BUILD_DATE || "2026-06-21";
const urls = Object.keys(OUT).map(f => {
  const loc = SITE.url + "/" + (f === "index.html" ? "" : f);
  const pr = f === "index.html" ? "1.0" : (f.startsWith("roofers-") ? "0.7" : "0.8");
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`;
}).join("\n");
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);

/* robots.txt */
fs.writeFileSync("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);

/* CNAME — custom domain for GitHub Pages (keeps the domain on every deploy) */
fs.writeFileSync("CNAME", new URL(SITE.url).host + "\n");

/* review.html — private review-request card (noindex; deliberately NOT in OUT/sitemap) */
fs.writeFileSync("review.html", buildReview());

console.log("Generated " + count + " HTML pages + review.html + sitemap.xml + robots.txt + CNAME");
console.log(Object.keys(OUT).join("  "));
