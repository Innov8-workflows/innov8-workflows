/* Derby & Nottingham Roofing, landing-page quiz + lead beacon.
   Generic: every client value comes from window.LP_CFG, emitted by build-lp.js.
   app.js is deliberately NOT loaded on these pages, its nav/drawer/hero
   selectors don't exist here and its click logger would double-log. */
(function () {
  "use strict";
  var CFG = window.LP_CFG || {};
  var LEAD_URL = "https://script.google.com/macros/s/AKfycbxUP8I0sZZfsyqTeqfyueO0arjcqR0Ge4-ZTfekfSgBz-vu1h99hf-sut5KQxzTLd0B/exec";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ---------- attribution ----------
     Click ids and utm tags exist only on the URL of the click that arrives from
     the ad, so stash them for the session. The Apps Script routes the lead to a
     Google Ads / Meta / Organic tab from these, so losing them loses the channel. */
  var ATTR = ["gclid", "fbclid", "utm_source", "utm_medium", "utm_campaign"];
  try {
    var qs = new URLSearchParams(location.search);
    ATTR.forEach(function (k) { var v = qs.get(k); if (v) sessionStorage.setItem("dnr_" + k, v); });
  } catch (e) {}
  function attr(k) { try { return sessionStorage.getItem("dnr_" + k) || ""; } catch (e) { return ""; } }
  var TEST = /[?&]leadtest=1(&|$)/.test(location.search);

  /* NEVER navigator.sendBeacon: it silently drops the Apps Script /exec
     cross-origin 302 while returning true, so the lead vanishes with no error.
     fetch + no-cors + keepalive survives the redirect and the page unload;
     text/plain avoids a preflight Apps Script cannot answer. */
  function logLead(d) {
    d.page = location.pathname;
    ATTR.forEach(function (k) { d[k] = attr(k); });
    if (TEST) d.test = 1;
    try {
      fetch(LEAD_URL, { method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(d) });
    } catch (e) {}
  }
  function ga(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
  }

  /* ---------- quiz ---------- */
  var quiz = $("#quiz");
  if (quiz) (function () {
    var lead = {}, idx = 1, started = false, sent = false;
    var steps = $$(".q-step", quiz), fill = $("[data-q-fill]", quiz),
        now = $("[data-q-now]", quiz), back = $("[data-q-back]", quiz);

    function show(n) {
      idx = n;
      steps.forEach(function (s) { s.classList.toggle("on", s.getAttribute("data-step") === String(n)); });
      var done = n === "done";
      fill.style.width = (done ? 100 : (n / 4) * 100) + "%";
      if (now) now.textContent = done ? 4 : n;
      if (back) back.hidden = done || n === 1;
      $$(".q-count", quiz).forEach(function (e) { e.hidden = done; });
      // Keep the card in view as it changes height, but never on first paint.
      if (started) { var t = quiz.getBoundingClientRect(); if (t.top < 0) quiz.scrollIntoView({ behavior: "smooth", block: "start" }); }
    }

    // Steps 1-3: one tap advances. No keyboard until step 4.
    quiz.addEventListener("click", function (e) {
      var b = e.target.closest("[data-field][data-val]");
      if (!b || !quiz.contains(b)) return;
      if (!started) { started = true; ga("quiz_start", { lp: CFG.lp }); }
      lead[b.getAttribute("data-field")] = b.getAttribute("data-val");
      $$('[data-field="' + b.getAttribute("data-field") + '"]', quiz).forEach(function (x) { x.classList.remove("sel"); });
      b.classList.add("sel");
      ga("quiz_step", { lp: CFG.lp, step: idx });
      setTimeout(function () { show(Math.min(idx + 1, 4)); }, 160);   // brief beat so the choice is visible
    });
    if (back) back.addEventListener("click", function () { show(Math.max(1, idx - 1)); });

    function summary() {
      var bits = [];
      if (CFG.service) bits.push("Job: " + CFG.service);
      if (lead.q1) bits.push((CFG.labels && CFG.labels.q1 ? CFG.labels.q1 : "Detail") + ": " + lead.q1);
      if (lead.q2) bits.push((CFG.labels && CFG.labels.q2 ? CFG.labels.q2 : "Detail") + ": " + lead.q2);
      if (lead.area) bits.push("Area: " + lead.area);
      return bits;
    }

    $("#lpGo").addEventListener("click", function () {
      var nameEl = $("#lpName"), phoneEl = $("#lpPhone"), err = $("[data-q-err]", quiz);
      var name = (nameEl.value || "").trim(), phone = (phoneEl.value || "").trim();
      var digits = phone.replace(/[^\d]/g, "");
      // Permissive on purpose: rejecting one real number costs more than accepting one junk row.
      var bad = !name || name.length < 2 ? nameEl : (digits.length < 10 || digits.length > 13) ? phoneEl : null;
      [nameEl, phoneEl].forEach(function (f) { f.classList.remove("err"); });
      if (bad) {
        bad.classList.add("err"); bad.focus();
        err.textContent = bad === nameEl ? "Please add your name." : "Please check your phone number.";
        err.hidden = false;
        return;
      }
      err.hidden = true;
      if (sent) return; sent = true;                       // double-tap guard
      lead.name = name; lead.phone = phone;

      /* Order matters. The lead is banked BEFORE any handoff, so every completed
         quiz is a chaseable phone number even if WhatsApp is never opened. */
      logLead({ name: name, phone: phone, area: lead.area || "", service: CFG.service || "",
                msg: summary().join(" | "), type: "form", source: "lp_" + (CFG.lp || "") });

      /* GTM-MN5RZ2R4 fires the Google Ads conversion off this exact custom event
         name. Any other name and Ads records nothing. */
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "whatsapp_lead", service: CFG.service || "", area: lead.area || "", lp: CFG.lp || "" });
      ga("generate_lead", { lp: CFG.lp, service: CFG.service, area: lead.area || "" });
      try { if (window.fbq) window.fbq("track", "Lead"); } catch (e) {}

      // Inline success panel, NOT a redirect, a redirect throws away the dwell
      // time and the remarketing/pixel view we just paid for.
      var first = name.split(" ")[0];
      var head = $("[data-q-head]", quiz), sub = $("[data-q-sub]", quiz), wa = $("[data-q-wa]", quiz);
      if (head) head.textContent = "Thanks " + first + ". We've got your details";
      if (sub) sub.textContent = "We'll call you on " + phone + " shortly to arrange your free survey.";
      if (wa) {
        var lines = ["Hi " + (CFG.biz || "") + ", I've just filled in your form for a free quote.", "",
                     "Name: " + name, "Phone: " + phone].concat(summary(), ["", "Source: " + location.pathname]);
        wa.href = "https://wa.me/" + CFG.wa + "?text=" + encodeURIComponent(lines.join("\n"));
      }
      show("done");
    });

    show(1);
  })();

  /* ---------- call / WhatsApp intent (excluding the done-panel buttons) ----------
     Capture phase so the row dispatches before a tel:/wa.me navigation tears the
     page down; keepalive is what lets it survive. */
  var seen = {};
  function once(k, ms) { var t = Date.now(); if (seen[k] && t - seen[k] < ms) return false; seen[k] = t; return true; }
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.hasAttribute("data-noleadlog")) return;   // done-panel buttons are already logged
    var h = a.getAttribute("href") || "", type = "";
    if (h.indexOf("tel:") === 0) type = "call_click";
    else if (h.indexOf("wa.me") > -1) type = "whatsapp_click";
    else return;
    var where = a.closest(".lp-mobar") ? "mobile bar" : a.closest(".lp-head") ? "header"
              : a.closest(".lp-fab") ? "whatsapp widget" : a.closest(".lp-cta") ? "bottom CTA" : "page";
    if (!once(type + "|" + where, 30000)) return;
    logLead({ type: type, msg: "location: " + where, service: CFG.service || "" });
    ga(type === "call_click" ? "click_to_call" : "click_whatsapp", { lead_source: where, lp: CFG.lp });

    /* Meta's standard event for "customer started contacting the business".
       Deliberately NOT "Lead": the campaign optimises on Lead, and a tap is not
       a lead, it is an intent. Firing Lead here would teach the algorithm that
       a button press is the goal and quietly wreck the optimisation. Contact
       gives Meta the signal without touching what it bids on. */
    try {
      if (window.fbq) window.fbq("track", "Contact",
        { method: type === "call_click" ? "phone" : "whatsapp", lp: CFG.lp || "" });
    } catch (e) {}
  }, true);

  /* ---------- videos ----------
     Autoplay, muted, looping, paused off-screen. Deliberately does NOT check
     prefers-reduced-motion: these clips are the proof the page is built on and
     Jay wants them running for everyone. No play button by request - if a
     browser refuses the autoplay outright we retry silently on the visitor's
     first interaction rather than showing a control. */
  function lazyVideo(v) {
    var load = function () { if (!v.src && v.getAttribute("data-src")) v.src = v.getAttribute("data-src"); };
    var kick = function () {
      load(); v.muted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () { retry = true; });
    };
    var retry = false;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (x) { x.isIntersecting ? kick() : v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    } else { kick(); }
    // Invisible safety net: some browsers only release autoplay after a gesture.
    ["touchstart", "click", "scroll"].forEach(function (ev) {
      document.addEventListener(ev, function () { if (retry && v.paused) kick(); }, { once: true, passive: true });
    });
  }
  $$(".lp-hero-bg, .lp-ba video, .q-vid video").forEach(lazyVideo);

  /* ---------- reviews ---------- */
  var rw = $("#lpRevs"), R = window.DNR_REVIEWS || [];
  if (rw && R.length) {
    rw.innerHTML = R.slice(0, 3).map(function (r) {
      return '<figure class="lp-rev"><div class="lp-rev-st">' +
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>'.repeat(5) +
        '</div><blockquote>' + r.text + '</blockquote><figcaption>' + r.name + ' &middot; ' + r.area + '</figcaption></figure>';
    }).join("");
  }

  var yr = document.getElementById("lpYr"); if (yr) yr.textContent = new Date().getFullYear();
})();
