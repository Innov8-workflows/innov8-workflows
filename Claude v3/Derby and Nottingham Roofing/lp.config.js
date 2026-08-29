/* ============================================================
   Landing-page client config, Derby & Nottingham Roofing
   The ONLY per-client file besides lp.data.js. build-lp.js contains
   no client strings, so a new client is: copy build-lp/lp.css/lp.js,
   write these two files, drop media in, run generate.js.
   Core facts (name, phone, guarantee, years) come from SITE in build.js.
   ============================================================ */
module.exports = {
  base: "../../",
  // Meta dataset ("pixel") id. Public by design: it appears in the page
  // source of every site running one, so it is safe in the repo. The
  // Conversions API ACCESS TOKEN is not, and must never be put on a static site.
  metaPixelId: "942900628147069",                     // lp/<slug>/index.html -> repo root
  owner: { name: "Joe", role: "Owner" },
  rating: { score: "5.0", label: "Google rating" },
  // Shown under the quiz. Only claims we can evidence.
  badges: ["£5m Public Liability", "10-Year Guarantee", "40 Years' Experience", "Free Roof Surveys"],
  media: {
    heroVideo: "assets/orbital-03.mp4",
    heroPoster: "assets/img/hero-orbital-poster.jpg",
    team: "assets/img/team.jpg",
    // Optional. Sits bottom-right of the team photo, same as the main site's
    // .photo-inset. Omit both keys and the team photo renders on its own.
    teamInset: "assets/img/team-inset.jpg",
    teamInsetAlt: "A customer receiving her written workmanship guarantee",
    guarantee: "assets/img/guarantee.jpg",
    handshake: "assets/img/handshake.jpg",
    ctaPoster: "assets/img/hero-02-poster.jpg",
  },
  gallery: [
    ["crew-at-work.jpg", "Natural slate · our team on site"],
    ["work-hip.jpg", "Hipped roof · grey tiles &amp; new ridge"],
    ["work-drone.jpg", "Completed re-roof · new clay tiles"],
    ["g1.jpg", "Full re-roof · natural slate"],
    ["work-ridge.jpg", "Full re-roof · new tiles &amp; ridge system"],
    ["work-1.jpg", "New slate roof · eaves &amp; valley"],
  ],
  // Step 3 is a tap-list, not a typed postcode: steps 1-3 stay keyboard-free.
  areas: ["Derby", "Nottingham", "Long Eaton", "Loughborough",
          "Coalville / Ashby / Shepshed", "Lichfield / Tamworth", "Somewhere else nearby"],
  steps: [
    ["Free survey", "We come out, get on the roof and find what's actually wrong."],
    ["Written quote", "A clear fixed price in writing. No hidden extras, no hard sell."],
    ["Job done properly", "Tidy, on time, and backed by our written guarantee."],
  ],
};
