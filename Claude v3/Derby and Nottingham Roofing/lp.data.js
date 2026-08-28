/* ============================================================
   One object per landing page. Pages 2-4 are DATA, not copies.
   layout: "search" = high-intent Google traffic, quiz in the hero.
           "meta"   = cold interruption traffic, persuade before asking.
   Steps 1-2 are page-specific: the ad group already established the
   service, so re-asking "what work do you need?" wastes the first tap.
   Steps 3-4 are shared, so there is one lead schema and one validator.
   ============================================================ */
module.exports = [
  {
    slug: "new-roof", layout: "search", adGroup: "New Roofs",
    service: "New roof / re-roof",
    title: "New Roofs & Re-Roofing in Derby & Nottingham | Free Quote",
    desc: "Free no-obligation quote for a new roof in Derby, Nottingham and the East Midlands. 40 years' experience, £5m insured, 10-year guarantee. Answer 4 quick questions.",
    h1: "Need a New Roof in <em>Derby or Nottingham?</em>",
    sub: "Answer four quick questions and we'll get you a free, no-obligation quote, usually the same day.",
    pill: "Free survey &amp; written quote, no obligation",
    cta: "Get my free quote",
    proof: { h: "A worn roof, stripped and rebuilt properly",
             p: "Taken right back to the rafters, new membrane and battens throughout, then re-covered and left watertight for decades." },
    // Real transformation footage. flat-roofing has none, so it omits the
    // section rather than showing a pitched roof on a flat-roof page.
    ba: { src: "assets/before-after.mp4", poster: "assets/img/ba1-before.jpg",
          tag: "Before &rarr; After", h: "Watch a tired roof become a new one",
          p: "Stripped back, new membrane and battens, then re-covered in natural slate with new guttering. This is the standard every re-roof gets." },
    q1: { field: "q1", label: "Job", ask: "What are you looking at?",
          opts: ["Full re-roof", "New roof on an extension or garage", "Roof's past it, need advice", "New build"] },
    q2: { field: "q2", label: "Property", ask: "What sort of property is it?",
          opts: ["Terraced", "Semi-detached", "Detached", "Bungalow", "Something else"] },
  },
  {
    slug: "roof-repairs", layout: "search", adGroup: "Roof Repairs",
    service: "Roof repair",
    title: "Roof Repairs in Derby & Nottingham | Fast, Free Quotes",
    desc: "Leaks, slipped tiles and storm damage fixed fast across Derby, Nottingham and the East Midlands. 40 years' experience, £5m insured. Free quote in four quick questions.",
    h1: "Roof Leaking in <em>Derby or Nottingham?</em>",
    sub: "Tell us what's happening in four quick taps and we'll get straight back to you, same day for emergencies.",
    pill: "Free inspection, no call-out charge",
    cta: "Get my free quote",
    proof: { h: "Found the leak two others missed",
             p: "A proper inspection, the actual cause fixed rather than patched, and the roof left watertight." },
    ba: { src: "assets/before-after-03.mp4", poster: "assets/img/ba3-before.jpg",
          tag: "Before &rarr; After", h: "See a leaking chimney put right",
          p: "Stack repointed, new lead flashing dressed in properly and the surrounding tiles reset. Fixed at the cause, not patched over." },
    q1: { field: "q1", label: "Problem", ask: "What's happening with the roof?",
          opts: ["Leak / water coming in", "Slipped or missing tiles", "Storm damage", "Ridge, flashing or chimney", "Not sure: needs a look"] },
    q2: { field: "q2", label: "Urgency", ask: "How soon do you need someone?",
          opts: ["It's an emergency: water coming in now", "This week", "Next couple of weeks", "Just getting prices"] },
  },
  {
    slug: "flat-roofing", layout: "search", adGroup: "Flat Roofing",
    service: "Flat roofing",
    title: "Flat Roofing in Derby & Nottingham | EPDM & GRP | Free Quote",
    desc: "EPDM rubber and GRP fibreglass flat roofs across Derby and Nottingham. Extensions, garages, dormers and porches. 10-year guarantee, £5m insured. Free quote.",
    h1: "Flat Roof Sorted in <em>Derby or Nottingham</em>",
    sub: "EPDM rubber and GRP fibreglass flat roofs built to last. Four quick questions for a free, no-obligation quote.",
    pill: "Free survey &amp; written quote, no obligation",
    cta: "Get my free quote",
    proof: { h: "Old felt off, rubber on, done in a day",
             p: "Stripped back to sound decking, new insulation where needed and a single-piece EPDM membrane with proper edge detailing." },
    q1: { field: "q1", label: "Roof", ask: "What's the flat roof on?",
          opts: ["Extension", "Garage", "Dormer", "Porch", "Whole roof / commercial"] },
    q2: { field: "q2", label: "Need", ask: "What do you need doing?",
          opts: ["Brand-new flat roof", "Replace an old felt roof", "Fix a leak", "Not sure, need advice"] },
  },
];
