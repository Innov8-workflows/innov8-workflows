/* Derby & Nottingham Roofing — shared site script */
(function () {
  "use strict";
  var PHONE_INTL = "447944635771";
  var WA_BASE = "https://wa.me/" + PHONE_INTL + "?text=";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- GA4 event helper ---------- */
  function track(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
  }
  function locOf(el) {
    if (!el || !el.closest) return "page";
    if (el.closest("#drawer")) return "mobile_menu";
    if (el.closest("#nav") || el.closest("header.nav")) return "nav";
    if (el.closest(".hero")) return "hero";
    if (el.closest("form")) return "contact_form";
    if (el.closest("footer")) return "footer";
    return "page";
  }

  /* ---------- navbar scroll ---------- */
  var nav = $("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- mobile drawer ---------- */
  var drawer = $("drawer"), burger = $("burger"), closeDrawer = $("closeDrawer");
  if (drawer && burger) {
    burger.onclick = function () { drawer.classList.add("open"); document.body.style.overflow = "hidden"; };
    var shut = function () { drawer.classList.remove("open"); document.body.style.overflow = ""; };
    if (closeDrawer) closeDrawer.onclick = shut;
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", shut); });
  }

  /* ---------- current year ---------- */
  var yr = $("yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- autoplay videos (muted, on view) ---------- */
  function autoplay(v) {
    if (!v) return;
    v.muted = true;
    var tryPlay = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    v.addEventListener("loadeddata", tryPlay);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { if (e.isIntersecting) tryPlay(); else v.pause(); });
      }, { threshold: 0.25 });
      io.observe(v);
    } else { tryPlay(); }
  }
  document.querySelectorAll(".ba-video").forEach(autoplay);

  /* ---------- hero: sequential bg videos — 1st starts 1s in, crossfade as each clip ends, then loop ---------- */
  (function () {
    var hv = [].slice.call(document.querySelectorAll(".hero-video"));
    if (!hv.length) return;
    hv.forEach(function (v) { v.muted = true; v.loop = false; });
    var START = [3, 1, 0];   // orbital-03 begins 3s in, hero 1s in, orbital-02 from the start
    var FADE = 1.5;       // begin the crossfade this many seconds before a clip ends (matches CSS)
    var cur = -1, busy = false;
    function dramatize(v) {
      // first clip: open fast for drama, then ease back to normal speed
      var DUR = 2200, FROM = 5, TO = 1, t0 = null;
      v.playbackRate = FROM;
      function step(ts) {
        if (cur !== 0) { v.playbackRate = TO; return; }   // bail if we've moved on
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / DUR);
        var e = 1 - Math.pow(1 - k, 3);                    // ease-out
        v.playbackRate = FROM + (TO - FROM) * e;
        if (k < 1) requestAnimationFrame(step); else v.playbackRate = TO;
      }
      requestAnimationFrame(step);
    }
    function go(idx) {
      busy = false; cur = idx;
      var v = hv[idx];
      try { v.currentTime = START[idx] || 0; } catch (e) {}
      try { v.playbackRate = 1; } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      hv.forEach(function (x, k) { x.classList.toggle("active", k === idx); });
      if (idx === 0) dramatize(v);
    }
    hv.forEach(function (v, idx) {
      v.addEventListener("timeupdate", function () {
        if (idx !== cur || busy) return;
        var d = v.duration;
        if (d && isFinite(d) && v.currentTime >= d - FADE) { busy = true; go((idx + 1) % hv.length); }
      });
      v.addEventListener("ended", function () {
        if (idx === cur && !busy) { busy = true; go((idx + 1) % hv.length); }
      });
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) {
          if (cur < 0 || e.target !== hv[cur]) return;
          if (e.isIntersecting) { var p = hv[cur].play(); if (p && p.catch) p.catch(function () {}); }
          else hv[cur].pause();
        });
      }, { threshold: 0.1 });
      hv.forEach(function (v) { io.observe(v); });
    }
    function begin() { if (cur === -1) go(0); }
    if (hv[0].readyState >= 1) begin();
    else hv[0].addEventListener("loadedmetadata", begin, { once: true });
    // warm up the other hero clips in the background (after first paint) so crossfades stay smooth
    setTimeout(function () { hv.slice(1).forEach(function (v) { if (v.preload !== "auto") v.preload = "auto"; }); }, 2200);
  })();

  /* ---------- reviews data ---------- */
  var REVIEWS = [
    { name: "Sarah M.", area: "Derby", time: "2 weeks ago", text: "Brilliant from start to finish. Came out the same day for a quote, turned up when they said and left everything spotless. Roof looks fantastic — couldn't recommend them more." },
    { name: "James P.", area: "Nottingham", time: "1 month ago", text: "Had a leak that two other roofers couldn't sort. These guys found the problem straight away and fixed it properly. Fair price and a proper job. Top marks." },
    { name: "Linda H.", area: "Loughborough", time: "1 month ago", text: "Lovely, polite lads. Re-roofed our extension and you can tell they take pride in their work. Kept us updated the whole way through. Would 100% use again." },
    { name: "Mark T.", area: "Long Eaton", time: "2 months ago", text: "Replaced our guttering and fascias. Quick, tidy and a great finish. Honest quote with no surprises at the end. Really pleased with it." },
    { name: "Emma W.", area: "Coalville", time: "3 months ago", text: "Storm took some tiles off and they were out fast to make it safe, then back to do the full repair. Friendly, reliable and reasonably priced. Highly recommend." },
    { name: "David R.", area: "Ashby-de-la-Zouch", time: "3 months ago", text: "New flat roof on our garage in EPDM rubber. Spotless job, fair price and done in a day. You can tell they know what they're doing. Cheers lads." },
    { name: "Karen S.", area: "Lichfield", time: "4 months ago", text: "Chimney was leaking and the flashing had gone. Sorted it properly, repointed the stack and it's been bone dry since. Polite, punctual and tidy." },
    { name: "Paul G.", area: "Shepshed", time: "5 months ago", text: "Full re-roof on a 1930s semi. Scaffolding up when promised, great communication and a beautiful finish. Couldn't fault them. Highly recommended." }
  ];
  var GOOGLE_REVIEWS_URL = "https://g.page/r/CeIJ2bFhP2mrEBM";
  var G_LOGO = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>';
  var PIN_ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  function star() { return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6z"/></svg>'; }
  function revCard(r) {
    return '<div class="rev-top"><div class="rev-avatar">' + r.name[0] + '</div>' +
      '<div><div class="rev-name">' + r.name + '</div><div class="rev-meta">' + r.time + '</div></div>' +
      '<a class="rev-g" href="' + GOOGLE_REVIEWS_URL + '" target="_blank" rel="noopener" aria-label="See our Google reviews">' + G_LOGO + '</a></div>' +
      '<div class="rev-stars">' + star().repeat(5) + '</div>' +
      '<p class="rev-text">&ldquo;' + r.text + '&rdquo;</p>' +
      '<div class="rev-loc">' + PIN_ICO + r.area + '</div>';
  }

  /* ---------- reviews carousel (home + landing pages): 3-up desktop, 1-up mobile ---------- */
  var row = $("revRow"), dotsWrap = $("revDots");
  if (row && dotsWrap) {
    var subset = REVIEWS.slice(0, 6);
    subset.forEach(function (r) {
      var s = document.createElement("div"); s.className = "rev-slide";
      var c = document.createElement("div"); c.className = "rev-card"; c.innerHTML = revCard(r);
      s.appendChild(c); row.appendChild(s);
    });
    var mq = window.matchMedia("(min-width: 900px)");
    var i = 0, timer, dots = [];
    var pages = function () { return Math.ceil(subset.length / (mq.matches ? 3 : 1)); };
    var go = function (n) {
      var P = pages(); i = (n + P) % P;
      row.style.transform = "translateX(-" + (i * 100) + "%)";
      dots.forEach(function (d, k) { d.classList.toggle("on", k === i); });
      reset();
    };
    var reset = function () { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 5000); };
    var buildDots = function () {
      dotsWrap.innerHTML = ""; dots = [];
      for (var n = 0; n < pages(); n++) (function (n) {
        var b = document.createElement("button"); b.setAttribute("aria-label", "Reviews page " + (n + 1));
        b.onclick = function () { go(n); }; dotsWrap.appendChild(b); dots.push(b);
      })(n);
    };
    if ($("revPrev")) $("revPrev").onclick = function () { go(i - 1); };
    if ($("revNext")) $("revNext").onclick = function () { go(i + 1); };
    var sx = 0;
    row.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    row.addEventListener("touchend", function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); });
    var onMq = function () { buildDots(); go(0); };
    if (mq.addEventListener) mq.addEventListener("change", onMq); else if (mq.addListener) mq.addListener(onMq);
    buildDots(); go(0);
  }

  /* ---------- reviews static grid (reviews page) ---------- */
  var grid = $("revGrid");
  if (grid) {
    REVIEWS.forEach(function (r) {
      var c = document.createElement("div"); c.className = "rev-card"; c.innerHTML = revCard(r); grid.appendChild(c);
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var a = item.querySelector(".faq-a");
      var open = item.classList.toggle("open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
      q.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- contact form -> WhatsApp ---------- */
  function buildWa() {
    var v = function (id) { var el = $(id); return el ? (el.value || "").trim() : ""; };
    var name = v("fName"), phone = v("fPhone"), area = v("fArea"), service = v("fService"), msg = v("fMsg");
    var lines = ["Hi Derby & Nottingham Roofing, I found your website and I'd like a free quote.", ""];
    if (name) lines.push("Name: " + name);
    if (phone) lines.push("Phone: " + phone);
    if (area) lines.push("Location: " + area);
    if (service) lines.push("Service: " + service);
    if (msg) lines.push("Details: " + msg);
    lines.push("", "Source: website enquiry");
    return WA_BASE + encodeURIComponent(lines.join("\n"));
  }
  var sendWa = $("sendWa");
  if (sendWa) {
    sendWa.onclick = function () {
      var name = ($("fName") && $("fName").value.trim()) || "";
      var phone = ($("fPhone") && $("fPhone").value.trim()) || "";
      if (!name || !phone) { alert("Please add your name and phone number so we can get back to you."); return; }
      var url = buildWa();
      try { sessionStorage.setItem("dnrWaUrl", url); } catch (e) {}
      var svc = ($("fService") && $("fService").value) || "";
      var area = ($("fArea") && $("fArea").value.trim()) || "";
      // Ad-conversion signal fires HERE at the moment of submit (GTM custom-event
      // trigger "whatsapp_lead") - the beacon survives the redirect, and it also
      // catches mobile users whose browser jumps to the WhatsApp app before the
      // thank-you page finishes loading.
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "whatsapp_lead", service: svc, area: area });
      window.open(url, "_blank"); // open WhatsApp (new tab on desktop / app on mobile)
      // send this tab to the thank-you page - the GA4 generate_lead conversion fires there
      var dest = "thank-you.html?service=" + encodeURIComponent(svc) + "&area=" + encodeURIComponent(area);
      // 1.2s pause before the redirect: gives the GTM conversion tag + its debug
      // reporting time to complete before this page unloads (user is looking at
      // the WhatsApp tab by now, so the wait is invisible).
      setTimeout(function () { window.location.href = dest; }, 1200);
    };
  }
  var waFloat = $("waFloat");
  if (waFloat) {
    waFloat.onclick = function (e) {
      e.preventDefault();
      track("click_whatsapp", { link_location: "float" });
      window.open(WA_BASE + "Hi%20Derby%20%26%20Nottingham%20Roofing%2C%20I%20found%20your%20website%20and%20I%27d%20like%20a%20free%20roofing%20quote.%0A%0ASource%3A%20website%20enquiry", "_blank");
    };
  }

  /* ---------- conversion events: clicks to call + inline WhatsApp ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      track("click_to_call", { link_location: locOf(a) });
    } else if (href.indexOf("wa.me") !== -1 && a.id !== "waFloat") {
      track("click_whatsapp", { link_location: locOf(a) });
    }
  }, true);
})();
