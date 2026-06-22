/* ============================================================
   Derby & Nottingham Roofing — static site generator
   Generates all pages from shared chrome + per-page content.
   Run:  node build.js
   ============================================================ */
const fs = require("fs");

/* ---------- site config ---------- */
const SITE = {
  name: "Derby & Nottingham Roofing",
  // Live URL (custom domain on GitHub Pages).
  url: "https://derbyandnottinghamroofing.co.uk",
  phone: "07838 250910",
  phoneIntl: "447838250910",
  hours: "Mon–Sat, 7am–6pm",
  area: "Derby & Nottingham",
  years: 23,
  founded: "2003",
  liability: "£5 million",
  guarantee: "25-year",
  team: 15,
};
const TEL = "tel:+" + SITE.phoneIntl;

/* ---------- services ---------- */
const SERVICES = [
  { slug: "new-roofs", short: "New Roofs", nav: "New Roofs & Re-Roofing", img: "g1.jpg",
    icon: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/><path d="M10 19v-5h4v5"/>',
    blurb: "Full roof replacements and new builds using quality tiles and felt, built to last for decades." },
  { slug: "roof-repairs", short: "Roof Repairs", nav: "Roof Repairs", img: "g3.jpg",
    icon: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z"/>',
    blurb: "Slipped tiles, leaks, storm damage and ridge work — fast, tidy repairs that stop the problem." },
  { slug: "flat-roofing", short: "Flat Roofing", nav: "Flat Roofing", img: "flat-roof.jpg",
    icon: '<path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/><path d="M3 7v10"/><path d="M21 7v10"/>',
    blurb: "Long-life EPDM rubber and GRP fibreglass flat roofs for extensions, garages and dormers." },
  { slug: "chimney-repairs", short: "Chimneys", nav: "Chimney & Repointing", img: "g2.jpg",
    icon: '<path d="M4 20V9l8-5 8 5v11"/><path d="M15 20v-6h3v6"/><path d="M15 4v3"/>',
    blurb: "Chimney repairs, rebuilds, flashing and lead work to keep water where it belongs." },
  { slug: "guttering", short: "Guttering", nav: "Guttering, Fascias & Soffits", img: "g5.jpg",
    icon: '<path d="M3 8h18l-2 5H5z"/><path d="M5 13v5"/><path d="M19 13v5"/><path d="M9 18h6"/>',
    blurb: "New and replacement uPVC guttering, fascias and soffits — clean lines and proper drainage." },
  { slug: "roof-surveys", short: "Roof Surveys", nav: "Free Roof Surveys", img: "work-3.jpg",
    icon: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3"/><path d="M9 11h6"/><path d="M9 15h4"/>',
    blurb: "An honest inspection and a clear written quote — no pressure, no obligation, no surprises." },
];
const svcBySlug = Object.fromEntries(SERVICES.map(s => [s.slug, s]));

/* ---------- towns ---------- */
const TOWNS = [
  { slug: "roofers-derby", town: "Derby", county: "Derbyshire", group: "Derby & Nottingham" },
  { slug: "roofers-nottingham", town: "Nottingham", county: "Nottinghamshire", group: "Derby & Nottingham" },
  { slug: "roofers-long-eaton", town: "Long Eaton", county: "Derbyshire", group: "Derby & Nottingham" },
  { slug: "roofers-loughborough", town: "Loughborough", county: "Leicestershire", group: "Leicestershire" },
  { slug: "roofers-shepshed", town: "Shepshed", county: "Leicestershire", group: "Leicestershire" },
  { slug: "roofers-coalville", town: "Coalville", county: "Leicestershire", group: "Leicestershire" },
  { slug: "roofers-ashby", town: "Ashby-de-la-Zouch", county: "Leicestershire", group: "Leicestershire" },
  { slug: "roofers-lichfield", town: "Lichfield", county: "Staffordshire", group: "Staffordshire" },
  { slug: "roofers-tamworth", town: "Tamworth", county: "Staffordshire", group: "Staffordshire" },
];

/* unique local context per town (keeps location pages from being duplicate content) */
const TOWN_COPY = {
  "roofers-derby": { intro: "From the Victorian terraces of Normanton and Peartree to the 1930s semis of Littleover, Mickleover and Allestree, Derby's housing stock is as varied as it gets — and every roof type needs a slightly different approach. As local Derby roofers we work right across the city and its suburbs, on everything from a single slipped tile to a full re-roof.", nearby: ["Mickleover", "Allestree", "Spondon", "Borrowash"], landmarks: "across Derby, from the city centre and Normanton to Mickleover, Allestree, Chaddesden and Sinfin" },
  "roofers-nottingham": { intro: "Nottingham's rooftops range from the red-brick Victorian terraces of Forest Fields, Sneinton and Lenton to the bay-fronted semis of Wollaton and Mapperley. We're local Nottingham roofers covering the whole city, and we know how the city's older slate and clay-tiled roofs behave when the weather turns.", nearby: ["West Bridgford", "Beeston", "Arnold", "Carlton"], landmarks: "throughout Nottingham, including Wollaton, Mapperley, Sneinton, Bulwell and the city centre" },
  "roofers-long-eaton": { intro: "Sitting right on the Derby–Nottingham border, Long Eaton is packed with Victorian and Edwardian terraces from its lace-making days — many still on their original slate. We cover Long Eaton and the wider Erewash area constantly, so we're rarely more than a short drive away when a roof needs sorting.", nearby: ["Sandiacre", "Sawley", "Breaston", "Beeston"], landmarks: "across Long Eaton, Sawley, Sandiacre and Breaston" },
  "roofers-loughborough": { intro: "Loughborough is a busy Leicestershire market and university town with a real spread of property — Victorian terraces near the centre, large student lets, and inter-war and modern semis across Charnwood. We cover Loughborough and the surrounding villages for everything from a slipped tile to a full re-roof.", nearby: ["Shepshed", "Quorn", "Barrow upon Soar", "Mountsorrel"], landmarks: "across Loughborough, Quorn, Barrow upon Soar and Shepshed" },
  "roofers-shepshed": { intro: "Shepshed sits just west of Loughborough on the edge of the National Forest, with a mix of older brick cottages, post-war housing and newer estates. We're regularly in Shepshed handling repairs, re-roofs, flat roofing, chimneys and guttering.", nearby: ["Loughborough", "Hathern", "Belton", "Hoton"], landmarks: "across Shepshed, Hathern, Belton and the surrounding villages" },
  "roofers-coalville": { intro: "Coalville grew up around the Leicestershire coalfield, so it's packed with solid Victorian and Edwardian terraces alongside large modern estates. We cover Coalville and the surrounding National Forest towns for pitched and flat roofing, repairs and complete re-roofs.", nearby: ["Whitwick", "Ibstock", "Hugglescote", "Bardon"], landmarks: "throughout Coalville, Whitwick, Ibstock and Hugglescote" },
  "roofers-ashby": { intro: "Ashby-de-la-Zouch is a handsome Leicestershire market town with period properties, a conservation core and plenty of newer development around the edges. We work right across Ashby and the National Forest villages, matching materials so repairs and re-roofs suit the property.", nearby: ["Measham", "Moira", "Coalville", "Smisby"], landmarks: "across Ashby-de-la-Zouch, Measham, Moira and Smisby" },
  "roofers-lichfield": { intro: "Lichfield is a historic Staffordshire cathedral city, with everything from Georgian and Victorian properties in the centre to large modern estates on the outskirts. We cover Lichfield and the surrounding villages for all roofing work, taking a careful approach on older and conservation-area homes.", nearby: ["Burntwood", "Whittington", "Shenstone", "Fradley"], landmarks: "across Lichfield, Burntwood, Whittington and Shenstone" },
  "roofers-tamworth": { intro: "Tamworth is a busy Staffordshire town with its castle at the heart and a broad spread of post-war and modern housing across its estates. We cover Tamworth and the surrounding area for repairs, re-roofs, flat roofing, chimneys and guttering.", nearby: ["Polesworth", "Fazeley", "Kingsbury", "Wilnecote"], landmarks: "throughout Tamworth, Fazeley, Polesworth and Wilnecote" },
};
const townBySlug = Object.fromEntries(TOWNS.map(t => [t.slug, t]));

/* ---------- shared SVG icons ---------- */
const I = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="#fff" stroke-width="2"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495.001 12.05.001c3.18 0 6.167 1.24 8.413 3.488a11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jstr = o => JSON.stringify(o).replace(/</g, "\\u003c");

function ld(objs) {
  return '<script type="application/ld+json">' + jstr(objs.length === 1 ? objs[0] : objs) + "</scr" + "ipt>";
}
function localBusinessLD() {
  return {
    "@context": "https://schema.org", "@type": "RoofingContractor",
    name: SITE.name, url: SITE.url, telephone: "+" + SITE.phoneIntl,
    image: SITE.url + "/assets/img/logo.png",
    foundingDate: SITE.founded,
    numberOfEmployees: SITE.team,
    areaServed: TOWNS.map(t => ({ "@type": "City", name: t.town })),
    address: { "@type": "PostalAddress", addressLocality: "Derby", addressRegion: "Derbyshire", addressCountry: "GB" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "07:00", closes: "18:00" }],
    priceRange: "££",
  };
}
function breadcrumbLD(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE.url + "/" + it.slug })) };
}
function faqLD(faqs) {
  return { "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}
function serviceLD(name, desc) {
  return { "@context": "https://schema.org", "@type": "Service", serviceType: name, description: desc,
    provider: { "@type": "RoofingContractor", name: SITE.name, telephone: "+" + SITE.phoneIntl, url: SITE.url },
    areaServed: TOWNS.map(t => t.town) };
}

/* ---------- chrome ---------- */
function head(p) {
  const canon = SITE.url + "/" + (p.slug === "index.html" ? "" : p.slug);
  const ogImg = SITE.url + "/assets/img/" + (p.ogImg || "g1.jpg");
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${canon}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${ogImg}">
<meta name="theme-color" content="#0C0E13">
<link rel="icon" href="assets/img/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="assets/img/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/img/favicon-16x16.png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
${ld(p.schema)}
</head>
<body>`;
}

function navbar(active) {
  const svcDrop = SERVICES.map(s => `<a href="${s.slug}.html">${s.nav}</a>`).join("");
  const areaDrop = ["roofers-derby","roofers-nottingham","roofers-long-eaton","roofers-loughborough","roofers-coalville","roofers-ashby","roofers-lichfield","roofers-tamworth"]
    .map(sl => `<a href="${sl}.html">${townBySlug[sl].town}</a>`).join("") + `<a href="index.html#areas"><strong>All areas &rarr;</strong></a>`;
  const cls = a => active === a ? ' class="active"' : "";
  return `
<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a href="index.html" class="brand"><img src="assets/img/logo.png" alt="${esc(SITE.name)}" width="120" height="80"></a>
    <nav class="nav-links">
      <a href="index.html"${cls("home")}>Home</a>
      <div class="has-drop"><a href="${SERVICES[0].slug}.html"${cls("services")}>Services</a><div class="drop">${svcDrop}</div></div>
      <div class="has-drop"><a href="roofers-derby.html"${cls("areas")}>Areas</a><div class="drop">${areaDrop}</div></div>
      <a href="gallery.html"${cls("gallery")}>Gallery</a>
      <a href="reviews.html"${cls("reviews")}>Reviews</a>
      <a href="about.html"${cls("about")}>About</a>
      <a href="faqs.html"${cls("faqs")}>FAQs</a>
      <a href="contact.html"${cls("contact")}>Contact</a>
    </nav>
    <div class="nav-cta">
      <a class="call-pill" href="${TEL}">${I.phone}<span><small>Call now</small><span class="num">${SITE.phone}</span></span></a>
      <button class="hamburger" id="burger" aria-label="Open menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer">
  <div class="drawer-top">
    <img src="assets/img/logo.png" alt="${esc(SITE.name)}" width="110" height="73">
    <button class="hamburger" id="closeDrawer" aria-label="Close menu" style="display:flex"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  </div>
  <a class="link" href="index.html">Home</a>
  <a class="link" href="${SERVICES[0].slug}.html">Services</a>
  ${SERVICES.map(s => `<a class="sublink" href="${s.slug}.html">${s.nav}</a>`).join("\n  ")}
  <a class="link" href="roofers-derby.html">Areas</a>
  <a class="link" href="gallery.html">Gallery</a>
  <a class="link" href="reviews.html">Reviews</a>
  <a class="link" href="about.html">About</a>
  <a class="link" href="faqs.html">FAQs</a>
  <a class="link" href="contact.html">Contact</a>
  <div class="drawer-actions">
    <a class="btn btn-primary" href="${TEL}">${I.phone}Call ${SITE.phone}</a>
    <a class="btn btn-dark" href="contact.html" style="justify-content:center">Get a free quote</a>
  </div>
</div>`;
}

function trustStrip() {
  const items = [
    ['<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>', "&pound;5m Public Liability"],
    ['<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 22l5-3 5 3-1.21-8.11"/>', "25-Year Guarantee"],
    ['<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>', "23 Years’ Experience"],
    ['<path d="M3 9l9-6 9 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>', "Free Roof Surveys"],
    ['<path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/>', "5&#9733; Rated"],
  ];
  return `<section class="trust"><div class="wrap trust-row">${items.map(([p, t]) =>
    `<div class="trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>${t}</div>`).join("")}</div></section>`;
}

function areasSection(currentSlug) {
  const groups = ["Derby & Nottingham", "Leicestershire", "Staffordshire"];
  const labels = { "Derby & Nottingham": "Derby &amp; Nottingham", "Leicestershire": "Leicestershire", "Staffordshire": "Staffordshire" };
  let html = `<section class="section areas" id="areas"><div class="wrap"><div class="section-head center"><span class="eyebrow">Areas we cover</span><h2>Roofers across the East Midlands &amp; Staffordshire</h2><p>From Derby and Nottingham down through Leicestershire and into Staffordshire — find your area below.</p></div>`;
  groups.forEach(g => {
    const list = TOWNS.filter(t => t.group === g);
    html += `<div style="margin-bottom:22px"><div class="eyebrow" style="margin-bottom:12px">${labels[g]}</div><div class="area-grid">` +
      list.map(t => `<a class="area-link${t.slug === currentSlug ? " active" : ""}" href="${t.slug}.html">${I.pin}${t.town}</a>`).join("") +
      `</div></div>`;
  });
  html += `</div></section>`;
  return html;
}

function finalCta(text) {
  return `<section class="final"><div class="final-bg" style="background-image:url(assets/img/roof1.jpg)"></div><div class="final-overlay"></div><div class="final-content">
    <h2>Need a roofer you can rely on?</h2>
    <p>${text || "Get a free, no-obligation quote from your local Derby &amp; Nottingham roofing team today."}</p>
    <div class="final-btns">
      <a class="btn btn-dark" href="contact.html" style="background:#fff;color:var(--ink)">Get my free quote</a>
      <a class="btn btn-ghost" href="${TEL}">${I.phone}${SITE.phone}</a>
    </div></div></section>`;
}

function footer() {
  const svc = SERVICES.map(s => `<li><a href="${s.slug}.html">${s.nav}</a></li>`).join("");
  const area = TOWNS.slice(0, 8).map(t => `<li><a href="${t.slug}.html">Roofers in ${t.town}</a></li>`).join("");
  return `
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <img src="assets/img/logo.png" alt="${esc(SITE.name)}" width="150" height="100">
        <p>Trusted local roofing contractors covering Derby, Nottingham and the surrounding East Midlands. Pitched roofs, flat roofs, repairs, chimneys and guttering.</p>
        <p style="margin-top:14px"><a href="${TEL}" style="color:#fff;font-weight:700;font-size:1.15rem">${SITE.phone}</a><br><span style="font-size:.82rem">${SITE.hours}</span></p>
      </div>
      <div><h4>Services</h4><ul>${svc}</ul></div>
      <div><h4>Areas</h4><ul>${area}</ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="about.html">About us</a></li>
        <li><a href="gallery.html">Our work</a></li>
        <li><a href="reviews.html">Reviews</a></li>
        <li><a href="faqs.html">Roofing FAQs</a></li>
        <li><a href="contact.html">Contact &amp; free quote</a></li>
      </ul></div>
    </div>
    <div class="foot-bottom">
      <span>&copy; <span id="yr"></span> ${esc(SITE.name)}. All rights reserved.</span>
      <span>Website by Innov8 Workflows</span>
    </div>
  </div>
</footer>
<a class="wa-float" id="waFloat" href="https://wa.me/${SITE.phoneIntl}" target="_blank" rel="noopener" aria-label="Chat to us on WhatsApp"><span class="wa-txt">Chat with us</span><span class="wa-ico">${I.wa}</span></a>
<script src="assets/app.js"></script>
</body>
</html>`;
}

function pageHero(p) {
  const crumbs = (p.crumbs || []).map((c, i, a) =>
    i === a.length - 1 ? `<span style="color:#cfd6e0">${c.name}</span>` : `<a href="${c.slug}">${c.name}</a><span>/</span>`).join("");
  return `<section class="page-hero">
  <div class="page-hero-bg" style="background-image:url(assets/img/${p.heroImg || "hero-poster.jpg"})"></div>
  <div class="page-hero-overlay"></div>
  <div class="wrap">
    ${crumbs ? `<div class="crumbs">${crumbs}</div>` : ""}
    <span class="eyebrow">${p.eyebrow || ""}</span>
    <h1>${p.h1}</h1>
    ${p.lead ? `<p class="lead">${p.lead}</p>` : ""}
    <div class="hero-btns">
      <a class="btn btn-primary" href="contact.html">${I.quote}Get my free quote</a>
      <a class="btn btn-ghost" href="${TEL}">${I.phone}${SITE.phone}</a>
    </div>
  </div>
</section>`;
}

function sidebar(activeSlug) {
  const nav = SERVICES.map(s => `<a href="${s.slug}.html"${s.slug === activeSlug ? ' class="active"' : ""}>${s.nav}${s.slug === activeSlug ? "" : " " + I.arrow}</a>`).join("");
  return `<aside>
    <div class="side-card sticky">
      <h3>Free, no-obligation quote</h3>
      <p>Tell us about your roof and we'll get straight back to you — usually the same day.</p>
      <a class="btn btn-primary" href="contact.html">${I.quote}Request a quote</a>
      <a class="btn btn-ghost" href="${TEL}" style="border-color:rgba(255,255,255,.4)">${I.phone}${SITE.phone}</a>
      <span class="callnum" style="margin-top:6px">${SITE.hours}</span>
    </div>
    <div class="side-card light">
      <h3>Our services</h3>
      <ul class="side-nav">${nav}</ul>
    </div>
  </aside>`;
}

function faqSection(faqs) {
  if (!faqs || !faqs.length) return "";
  return `<section class="section faq"><div class="wrap">
    <div class="section-head center"><span class="eyebrow">FAQs</span><h2>Common questions</h2></div>
    <div class="faq-list">${faqs.map(f => `
      <div class="faq-item"><button class="faq-q" aria-expanded="false">${f.q}<span class="ic">${I.plus}</span></button><div class="faq-a"><p>${f.a}</p></div></div>`).join("")}
    </div></div></section>`;
}

function relatedServices(currentSlug) {
  const others = SERVICES.filter(s => s.slug !== currentSlug).slice(0, 3);
  return `<section class="section related"><div class="wrap">
    <div class="section-head center"><span class="eyebrow">More from us</span><h2>Other roofing services</h2></div>
    <div class="related-grid">${others.map(s => `
      <a class="rel-card" href="${s.slug}.html"><img src="assets/img/${s.img}" alt="${s.nav} in Derby &amp; Nottingham" loading="lazy"><div class="b"><h3>${s.nav}</h3><p>${s.blurb}</p></div></a>`).join("")}
    </div></div></section>`;
}

/* ============================================================
   PAGE BUILDERS
   ============================================================ */
const OUT = {};

/* ---- generic page assembler ---- */
function page(p, bodyHtml) {
  return head(p) + navbar(p.active) + bodyHtml + footer();
}

module.exports = { SITE, SERVICES, TOWNS, TOWN_COPY, svcBySlug, townBySlug, I, esc, ld,
  localBusinessLD, breadcrumbLD, faqLD, serviceLD, head, navbar, trustStrip, areasSection,
  finalCta, footer, pageHero, sidebar, faqSection, relatedServices, page, TEL };
