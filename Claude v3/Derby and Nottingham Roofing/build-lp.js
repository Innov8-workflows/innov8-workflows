/* ============================================================
   Landing-page section builders. NO client strings live here —
   everything comes from SITE (build.js), lp.config.js and lp.data.js,
   so this file is copied verbatim to the next client.
   ============================================================ */
const B = require("./build.js");
const { SITE, esc, I, TEL, localBusinessLD } = B;

/* Star reused verbatim from generate.js so the LP rating matches the main site. */
const STAR = '<svg class="st" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>';

const WA = t => "https://wa.me/" + SITE.phoneIntl + "?text=" + encodeURIComponent(t);
const WA_HELLO = () => WA("Hi " + SITE.name + ", I would like a free roofing quote please.");

/* Sticky header: logo + call button ONLY. No nav, a landing page should have
   no way off it except converting. */
function lpHeader(C) {
  return `<header class="lp-head" id="top"><div class="lp-head-in">
  <img class="lp-logo" src="${C.base}assets/img/logo.png" alt="${esc(SITE.name)}" width="120" height="80">
  <a class="lp-call" href="${TEL}">${I.phone}<span><small>Call now</small><b>${SITE.phone}</b></span></a>
</div></header>`;
}

/* The quiz. Steps 1-2 come from the page data; steps 3-4 are identical on every
   page, so there is one lead schema and one validator. Steps 1-3 are tap-only —
   the keyboard never appears until step 4. */
function lpQuiz(lp, C) {
  const opt = (f, v) => `<button type="button" class="opt" data-field="${f}" data-val="${esc(v)}">${v}</button>`;
  const step = (n, ask, body) => `<div class="q-step${n === 1 ? " on" : ""}" data-step="${n}">
    <p class="q-ask">${ask}</p>${body}</div>`;
  var vid = lp.quizVideo ? `<div class="q-vid">
    <span class="q-vid-tag"><i></i>Real transformation</span>
    <video poster="${C.base}${lp.quizVideo.poster}" muted playsinline loop preload="none" data-src="${C.base}${lp.quizVideo.src}"></video>
  </div>` : "";
  return `<div class="quiz" id="quiz">
  ${vid}
  <div class="q-top">
    <span class="q-count">Step <b data-q-now>1</b> of 4</span>
    <button type="button" class="q-back" data-q-back hidden>&#8249; Back</button>
  </div>
  <div class="q-bar"><i data-q-fill></i></div>
  <div class="q-body">
  ${step(1, lp.q1.ask, `<div class="q-opts">${lp.q1.opts.map(o => opt(lp.q1.field, o)).join("")}</div>`)}
  ${step(2, lp.q2.ask, `<div class="q-opts">${lp.q2.opts.map(o => opt(lp.q2.field, o)).join("")}</div>`)}
  ${step(3, "Where&rsquo;s the property?", `<div class="q-opts">${C.areas.map(a => opt("area", a)).join("")}</div>`)}
  ${step(4, "Last step, how should we reach you?", `
    <div class="q-field"><label for="lpName">Your name</label>
      <input id="lpName" type="text" autocomplete="name" enterkeyhint="next" placeholder="First name is fine"></div>
    <div class="q-field"><label for="lpPhone">Phone number</label>
      <input id="lpPhone" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="done" placeholder="So we can call you back"></div>
    <p class="q-err" data-q-err hidden></p>
    <button type="button" class="q-go" id="lpGo">${lp.cta} ${I.arrow}</button>
    <p class="q-note">No spam, ever. Your details are only used to arrange your quote.</p>
    <p class="q-call">Prefer to talk? Call us on <a href="${TEL}">${SITE.phone}</a></p>`)}
  <div class="q-step q-done" data-step="done">
    <div class="q-tick">${I.check}</div>
    <p class="q-ask" data-q-head>Thanks. We&rsquo;ve got your details</p>
    <p class="q-done-sub" data-q-sub></p>
    <div class="q-done-btns">
      <a class="q-wa" data-q-wa data-noleadlog href="#" target="_blank" rel="noopener">${I.wa}Send it on WhatsApp too</a>
      <a class="q-tel" data-noleadlog href="${TEL}">${I.phone}Or call us now</a>
    </div>
  </div>
  </div>
</div>`;
}

function lpBadges(C) {
  return `<div class="lp-badges"><div class="lp-wrap">${C.badges.map(t => `<span>${I.check}${t}</span>`).join("")}</div></div>`;
}

function lpAreas(lp, C) {
  return `<section class="lp-sec lp-alt"><div class="lp-wrap">
  <div class="lp-head-c"><span class="lp-eyebrow">Where we work</span><h2>Covering ${SITE.area} and beyond</h2></div>
  <div class="lp-areas">${C.areas.filter(a => !/somewhere/i.test(a)).map(a => `<span>${I.pin || ""}${a}</span>`).join("")}</div>
  <p class="lp-areas-note">Not sure if we reach you? Ask anyway, we travel across the East Midlands.</p>
  <div class="lp-head-c" style="margin:26px 0 0"><a class="lp-btn" href="#quiz">${lp.cta} ${I.arrow}</a></div>
</div></section>`;
}

function lpHero(lp, C) {
  return `<section class="lp-hero">
  <video class="lp-hero-bg" poster="${C.base}${C.media.heroPoster}" muted playsinline loop preload="none" data-src="${C.base}${C.media.heroVideo}"></video>
  <div class="lp-hero-tint"></div>
  <div class="lp-hero-in">
    <div class="lp-hero-copy">
      <div class="lp-rating">${STAR.repeat(5)}<span><b>${C.rating.score}</b> ${C.rating.label}</span></div>
      <h1>${lp.h1}</h1>
      <p class="lp-sub">${lp.sub}</p>
      <p class="lp-pill">${I.check}${lp.pill}</p>
      <ul class="lp-ticks">${C.badges.map(b => `<li>${I.check}${b}</li>`).join("")}</ul>
    </div>
    <div class="lp-hero-quiz">${lpQuiz(lp, C)}</div>
  </div>
</section>`;
}

/* Transformation video, sits directly after the hero. Anyone who scrolls past
   the quiz is not ready to act; they are asking "can these people actually do
   this?". A transformation answers that with no reading required.
   Footage is portrait (720x960), so it is a card beside the copy, not full-bleed.
   Returns "" for a page with no genuine footage. */
function lpBeforeAfter(lp, C) {
  if (!lp.ba) return "";
  return `<section class="lp-sec"><div class="lp-wrap lp-2col">
  <div class="lp-ba">
    <span class="lp-ba-tag">${lp.ba.tag}</span>
    <video poster="${C.base}${lp.ba.poster}" muted playsinline loop preload="none" data-src="${C.base}${lp.ba.src}"></video>
  </div>
  <div>
    <span class="lp-eyebrow">Real job, real result</span>
    <h2>${lp.ba.h}</h2>
    <p>${lp.ba.p}</p>
    <a class="lp-btn" href="#quiz">${lp.cta} ${I.arrow}</a>
  </div>
</div></section>`;
}

function lpProof(lp, C) {
  return `<section class="lp-sec"><div class="lp-wrap lp-2col">
  <div>
    <span class="lp-eyebrow">No obligation, no pressure</span>
    <h2>${lp.proof.h}</h2>
    <p>${lp.proof.p}</p>
    <ol class="lp-steps">${C.steps.map(([h, p]) => `<li><b>${h}</b><span>${p}</span></li>`).join("")}</ol>
    <a class="lp-btn" href="#quiz">${lp.cta} ${I.arrow}</a>
  </div>
  <div class="lp-shot"><img src="${C.base}${C.media.guarantee}" alt="A customer being handed their written workmanship guarantee" loading="lazy"></div>
</div></section>`;
}

function lpTeam(lp, C) {
  return `<section class="lp-sec lp-alt"><div class="lp-wrap lp-2col">
  <div class="lp-shot"><img src="${C.base}${C.media.team}" alt="The ${esc(SITE.name)} team on site" loading="lazy"></div>
  <div>
    <span class="lp-eyebrow">Meet the team</span>
    <h2>${SITE.years} years on roofs across ${SITE.area}</h2>
    <p>${esc(SITE.name)} is a family-run team of ${SITE.team}. We have grown by word of mouth, one happy customer at a time, and you deal with the same faces from the first survey to the final clean-up.</p>
    <p>Fully insured with ${SITE.liability} public liability, and every job backed by our written ${SITE.guarantee} guarantee.</p>
    <a class="lp-btn" href="#quiz">${lp.cta} ${I.arrow}</a>
  </div>
</div></section>`;
}

function lpGallery(C) {
  return `<section class="lp-sec"><div class="lp-wrap">
  <div class="lp-head-c"><span class="lp-eyebrow">Our work</span><h2>Recent roofs</h2></div>
  <div class="lp-grid">${C.gallery.map(([img, cap]) =>
    `<figure><img src="${C.base}assets/img/${img}" alt="${cap.replace(/&amp;/g, "and").replace(/·/g, "-")}" loading="lazy"><figcaption>${cap}</figcaption></figure>`).join("")}</div>
</div></section>`;
}

function lpReviews() {
  return `<section class="lp-sec lp-alt"><div class="lp-wrap">
  <div class="lp-head-c"><span class="lp-eyebrow">Don&rsquo;t take our word for it</span><h2>What customers say</h2></div>
  <div class="lp-revs" id="lpRevs"></div>
</div></section>`;
}

function lpCta(lp, C) {
  return `<section class="lp-cta" style="background-image:url(${C.base}${C.media.ctaPoster})"><div class="lp-cta-tint"></div>
  <div class="lp-cta-in">
    <div class="lp-rating lp-rating-c">${STAR.repeat(5)}</div>
    <h2>Ready for your free, no-obligation quote?</h2>
    <p>Four quick questions. Most people are done in under a minute.</p>
    <div class="lp-cta-btns"><a class="lp-btn lp-btn-lg" href="#quiz">${lp.cta} ${I.arrow}</a>
      <a class="lp-btn lp-btn-ghost" href="${TEL}">${I.phone}${SITE.phone}</a></div>
  </div></section>`;
}

function lpFooter(C) {
  return `<footer class="lp-foot"><div class="lp-wrap">
  <img src="${C.base}assets/img/logo.png" alt="${esc(SITE.name)}" width="110" height="73" loading="lazy">
  <p>${esc(SITE.name)}, roofing across ${SITE.area} and the East Midlands.<br>
     <a href="${TEL}">${SITE.phone}</a> &middot; <a href="tel:+${SITE.phoneDerbyIntl}">${SITE.phoneDerby}</a> &middot; <a href="tel:+${SITE.phoneNottsIntl}">${SITE.phoneNotts}</a></p>
  <p class="lp-foot-sm"><a class="lp-foot-link" href="${C.base}index.html">Visit our main website</a></p>
  <p class="lp-foot-sm">&copy; <span id="lpYr"></span> ${esc(SITE.name)}. ${SITE.liability} public liability &middot; ${SITE.guarantee} workmanship guarantee.</p>
</div>
<a class="lp-fab" data-noleadlog href="${WA_HELLO()}" target="_blank" rel="noopener" aria-label="WhatsApp us">${I.wa}</a>
<div class="lp-mobar">
  <a href="${TEL}">${I.phone}Call</a>
  <a class="w" data-noleadlog href="${WA_HELLO()}" target="_blank" rel="noopener">${I.wa}WhatsApp</a>
</div></footer>`;
}

/* One switch, two orderings. This is what stops pages 2/3/4 being copies.
   "search" traffic is already looking for a roofer, so the quiz IS the hero.
   "meta" traffic was not, so it has to be persuaded before being asked. */
/* Meta pixel base code. lp.js already fires fbq("track","Lead") on quiz
   completion, guarded by if (window.fbq), so Lead events start working the
   moment this is present and no page markup changes. */
function metaPixel(C) {
  if (!C.metaPixelId) return "";
  return `
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${C.metaPixelId}');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" alt=""
src="https://www.facebook.com/tr?id=${C.metaPixelId}&ev=PageView&noscript=1"></noscript>`;
}

function buildLandingPage(lp, C) {
  const p = {
    slug: "lp/" + lp.slug + "/index.html",
    url: "lp/" + lp.slug + "/",
    title: lp.title, desc: lp.desc, ogImg: "og-home.jpg",
    noindex: true, base: C.base, bodyClass: "lp",
    headExtra: metaPixel(C),
    css: ["assets/lp.css"],
    schema: [localBusinessLD()],
  };
  const body = lp.layout === "meta"
    ? [lpHeader(C), lpBadges(C), lpHero(lp, C), lpProof(lp, C), lpGallery(C), lpTeam(lp, C), lpReviews(), lpAreas(lp, C), lpCta(lp, C), lpFooter(C)]
    : [lpHeader(C), lpHero(lp, C), lpBeforeAfter(lp, C), lpProof(lp, C), lpTeam(lp, C), lpGallery(C), lpReviews(), lpCta(lp, C), lpFooter(C)];

  const cfg = JSON.stringify({
    lp: lp.slug, service: lp.service, wa: SITE.phoneIntl, biz: SITE.name,
    labels: { q1: lp.q1.label, q2: lp.q2.label },
  });
  const tail = `
<script>window.LP_CFG=${cfg};</script>
<script src="${C.base}assets/reviews.js"></script>
<script src="${C.base}assets/lp.js"></script>
<script defer src="https://crm.innov8workflows.co.uk/track.js" data-id="proj_645b482be6bf"></script>
</body>
</html>`;
  return { file: "lp/" + lp.slug + "/index.html", html: B.head(p) + body.join("\n") + tail };
}

module.exports = { buildLandingPage, lpHeader, lpHero, lpQuiz, lpBeforeAfter, lpBadges, lpAreas, lpProof, lpTeam, lpGallery, lpReviews, lpCta, lpFooter };
