

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  var gaId = root.getAttribute('data-ga') || '';
  var pxId = root.getAttribute('data-pixel') || '';
  var KEY = 'innov8_cookie_consent';
  var started = false;
  var q = [];

  function readConsent() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY));
      if (!s) return null;
      if (Date.now() > s.expires) { localStorage.removeItem(KEY); return null; }
      return s.value;
    } catch (e) { return null; }
  }
  function writeConsent(v) {
    try { localStorage.setItem(KEY, JSON.stringify({ value: v, expires: Date.now() + 365 * 864e5 })); } catch (e) {}
  }

  function startTrackers() {
    if (started) return;
    started = true;
    if (gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      window.gtag('js', new Date());
      window.gtag('config', gaId);
      if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
        var g = document.createElement('script');
        g.async = true;
        g.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
        document.head.appendChild(g);
      }
    }
    if (pxId) {

      !function (f, b, e, v, n, t, s2) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s2 = b.getElementsByTagName(e)[0]; s2.parentNode.insertBefore(t, s2);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pxId);
      window.fbq('track', 'PageView');
    }
  }

  /* eventId: the same id the CRM sends to Meta's Conversions API for this lead,
     so Meta counts a visitor who accepted cookies once, not twice. */
  window.track = function (name, params, eventId) {
    if (!started) { q.push([name, params, eventId]); return; }
    if (window.gtag) window.gtag('event', name === 'Lead' ? 'generate_lead' : name === 'Schedule' ? 'book_demo_call' : name, params || {});
    if (window.fbq) {
      var STD = { Lead: 1, Contact: 1, PageView: 1, Schedule: 1 };
      if (eventId) window.fbq(STD[name] ? 'track' : 'trackCustom', name, params || {}, { eventID: eventId });
      else window.fbq(STD[name] ? 'track' : 'trackCustom', name, params || {});
    }
  };
  function flush() { var c = q.slice(); q.length = 0; c.forEach(function (e) { window.track(e[0], e[1], e[2]); }); }

  var gate = document.getElementById('cc');
  function sizeGate() { if (gate) root.style.setProperty('--cc-h', gate.offsetHeight + 'px'); }
  var choice = readConsent();
  if (choice === 'accepted') { startTrackers(); flush(); }
  else if (choice !== 'declined' && gate) {
    gate.hidden = false;
    document.body.classList.add('cc-open');
    sizeGate();
    window.addEventListener('resize', sizeGate);
  }
  if (gate) {
    gate.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-cc]') : null;
      if (!b) return;
      var yes = b.getAttribute('data-cc') === 'yes';
      writeConsent(yes ? 'accepted' : 'declined');
      gate.hidden = true;
      document.body.classList.remove('cc-open');
      if (yes) { startTrackers(); flush(); } else { q.length = 0; }
    });
  }

  var CRM = root.getAttribute('data-crm') || '';
  var TYPES = { 'Roofing': 'Roofer', 'Driveways': 'Driveway', 'Electrical': 'Electrician', 'Construction': 'Builder', 'Landscaping': 'Landscaper', 'Joinery': 'Joiner', 'Plumbing and heating': 'Plumbing', 'Another trade': 'Other' };
  /* Resolves to the CRM's signed reference for this prospect ('' if it never
     came back), which ties the booked call and the uploads to the same record. */
  window.sendCrm = function (d) {
    if (!CRM || !window.fetch) return Promise.resolve('');
    try {
      var body = {
        form: 'free demo quiz, innov8workflows.co.uk/lp',
        page: location.href,
        referrer: document.referrer || '',
        firstName: d.name,
        phone: d.phone,
        company: d.business,
        town: d.town,
        trade: d.trade,
        businessType: TYPES[d.trade] || d.trade,
        message: d.lines.join('\n'),
        company_website: d.hp || '',
        meta_event_id: d.eventId || '',
        fbc: d.fbc || '',
        fbp: d.fbp || '',
        meta_test: /(?:^|[?&])test=1(?:&|$)/.test(location.search)
      };
      if (d.noWebsite) body.website = '';
      return fetch(CRM, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) { return (j && j.ref) || ''; })
        .catch(function () { return ''; });
    } catch (e) { return Promise.resolve(''); }
  };

  var LEAD = root.getAttribute('data-lead') || '';
  window.sendLead = function (d) {
    if (!LEAD) return;
    try {
      d.page = location.pathname + location.search;
      d.referrer = document.referrer || '';
      d.site = location.hostname;
      var p = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'].forEach(function (k) { if (p.get(k)) d[k] = p.get(k); });
      fetch(LEAD, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(d) });
    } catch (e) {}
  };

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var ups = document.querySelectorAll('.up');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(ups, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(ups, function (el) { el.classList.add('in'); });
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.hasAttribute('data-quiz-send')) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('tel:') === 0) window.track('click_to_call', { link_url: h });
    else if (/^https:\/\/wa\.me\//.test(h) || a.hasAttribute('data-quiz-wa')) window.track('click_whatsapp', { link_url: 'wa.me' });
  }, true);

  var quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  var WA = root.getAttribute('data-wa') || '';
  var SMS = root.getAttribute('data-sms') || '';
  var steps = quiz.querySelectorAll('.qstep');
  var fill = quiz.querySelector('[data-quiz-fill]');
  var count = quiz.querySelector('[data-quiz-count]');
  var back = quiz.querySelector('[data-quiz-back]');
  var sumEl = quiz.querySelector('[data-quiz-summary]');
  var hp = quiz.querySelector('[data-hp]');
  var TOTAL = steps.length;
  var current = 1;
  var KEYS = [], LABELS = {};
  Array.prototype.forEach.call(steps, function (s) {
    var k = s.getAttribute('data-key');
    if (k) { KEYS.push(k); LABELS[k] = s.getAttribute('data-label') || k; }
  });
  var answers = {};
  KEYS.forEach(function (k) { answers[k] = ''; });

  var F = {};
  Array.prototype.forEach.call(quiz.querySelectorAll('[data-f]'), function (inp) { F[inp.getAttribute('data-f')] = inp; });
  function val(k) { return F[k] ? F[k].value.trim() : ''; }
  var REQUIRED = ['name', 'phone', 'business'];
  var tried = false;
  var logged = false;

  function show(n) {
    current = Math.min(Math.max(n, 1), TOTAL);
    Array.prototype.forEach.call(steps, function (s) {
      s.classList.toggle('on', Number(s.getAttribute('data-step')) === current);
    });
    if (fill) fill.style.width = (current / TOTAL * 100) + '%';
    if (count) count.textContent = 'Step ' + current + ' of ' + TOTAL;
    if (back) back.hidden = current === 1;
    if (current === TOTAL) render();
  }

  function message() {
    var lines = ['Hi Jamie, I have just seen your ad and I would like my free demo website.', ''];
    KEYS.forEach(function (k) { if (answers[k]) lines.push(LABELS[k] + ': ' + answers[k]); });
    if (val('name')) lines.push('Name: ' + val('name'));
    if (val('business')) lines.push('Business: ' + val('business') + (val('town') ? ', ' + val('town') : ''));
    else if (val('town')) lines.push('Area: ' + val('town'));
    if (val('phone')) lines.push('Mobile: ' + val('phone'));
    lines.push('', 'Sent from innov8workflows.co.uk/lp');
    return lines.join('\n');
  }

  function render() {
    if (sumEl) {
      var a = KEYS.map(function (k) { return answers[k]; }).filter(Boolean);
      sumEl.textContent = a.length ? 'Your answers: ' + a.join('  |  ') : '';
    }
    var wa = quiz.querySelector('[data-quiz-send="whatsapp"]');
    if (wa) wa.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(message());
    var sms = quiz.querySelector('[data-quiz-send="sms"]');
    if (sms) sms.href = 'sms:' + SMS + '?&body=' + encodeURIComponent(message());
  }

  function phoneOk(p) { return p.replace(/[^\d]/g, '').length >= 10; }
  function check() {
    var bad = [];
    REQUIRED.forEach(function (k) {
      var v = val(k);
      var ok = k === 'phone' ? phoneOk(v) : v.length > 1;
      var wrap = F[k] && F[k].closest('.field');
      if (wrap) wrap.classList.toggle('bad', !ok);
      if (!ok) bad.push(k);
    });
    return bad;
  }

  quiz.addEventListener('click', function (e) {
    var opt = e.target && e.target.closest ? e.target.closest('.opt') : null;
    if (!opt) return;
    var stepEl = opt.closest('.qstep');
    var step = Number(stepEl.getAttribute('data-step'));
    var k = stepEl.getAttribute('data-key');
    if (k) answers[k] = opt.getAttribute('data-val') || opt.textContent.trim();
    if (step === 1) window.track('funnel_start', { answer: answers[k] });
    window.track('funnel_step', { step: step, answer: answers[k] });
    show(step + 1);
  });

  if (back) back.addEventListener('click', function () { show(current - 1); });
  Object.keys(F).forEach(function (k) {
    F[k].addEventListener('input', function () { render(); if (tried) check(); });
  });

  Array.prototype.forEach.call(quiz.querySelectorAll('[data-quiz-send]'), function (btn) {
    btn.addEventListener('click', function (e) {
      tried = true;
      var bad = check();
      if (bad.length) {
        e.preventDefault();
        F[bad[0]].focus();
        return;
      }
      if (hp && hp.value) { e.preventDefault(); return; }
      render();
      if (logged) return;
      logged = true;
      var parts = KEYS.map(function (k2) { return answers[k2] ? LABELS[k2] + ': ' + answers[k2] : ''; }).filter(Boolean);
      var how = btn.getAttribute('data-quiz-send') === 'sms' ? 'text message' : 'WhatsApp';
      /* One id for the pixel Lead and the CRM's server Lead (Conversions API),
         plus Meta's own cookies if Accept was pressed. The fbclid rides in on the
         page address. */
      var eventId = 'lead.' + Date.now() + '.' + Math.random().toString(36).slice(2, 10);
      var ck = function (n) {
        var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)');
        return m ? decodeURIComponent(m[1]) : '';
      };
      var refP = window.sendCrm({
        eventId: eventId,
        fbc: ck('_fbc'),
        fbp: ck('_fbp'),
        name: val('name'),
        phone: val('phone'),
        business: val('business'),
        town: val('town'),
        trade: answers.trade || '',
        noWebsite: /^(No website yet|Only a Facebook page)$/.test(answers.website || ''),
        lines: parts.concat(['Chose to send by: ' + how])
      });
      window.sendLead({
        type: 'Quote funnel',
        name: val('name'),
        phone: val('phone'),
        business: val('business'),
        town: val('town'),
        service: answers[KEYS[0]] || '',
        details: parts.join(' | '),
        source: 'ad landing page'
      });
      window.track('Lead', { content_name: 'Free demo funnel', method: btn.getAttribute('data-quiz-send'), trade: answers[KEYS[0]] || '', timing: answers[KEYS[KEYS.length - 1]] || '' }, eventId);
      /* WhatsApp opens in a new tab or the app, so the booking calendar is
         waiting here when they come back. */
      startBooking(refP, ck);
    }, false);
  });

  /* ---- After the quiz: book the demo call, then send logo and photos ----
     The call is booked on Jay's Calendly, embedded here. When Calendly says it
     is booked, the CRM is told (it checks the booking with Calendly itself), and
     Meta gets a Schedule with the same event id as the CRM's server copy. */
  var CAL = root.getAttribute('data-cal') || '';
  var BOOK_API = CRM.replace(/site-enquiry$/, 'lp-booking');
  var FILES_API = CRM.replace(/site-enquiry$/, 'lp-files');
  var bookEl = quiz.querySelector('[data-book]');
  var filesEl = quiz.querySelector('[data-files]');
  var lpRef = '';
  var booked = false;

  function ukPhone(p) {
    var d = p.replace(/[^\d+]/g, '');
    if (/^07\d{9}$/.test(d)) return '+44' + d.slice(1);
    if (/^447\d{9}$/.test(d)) return '+' + d;
    return /^\+\d{10,15}$/.test(d) ? d : '';
  }

  function startBooking(refP, ck) {
    if (!CAL || !bookEl) return;
    quiz.classList.add('booking');
    Array.prototype.forEach.call(steps, function (s) { s.classList.remove('on'); });
    bookEl.hidden = false;
    var box = bookEl.querySelector('[data-cal]');
    var made = false;
    function embed(ref) {
      if (made) return;
      made = true;
      lpRef = ref || '';
      var page = new URLSearchParams(location.search);
      var p = new URLSearchParams();
      p.set('embed_domain', location.host);
      p.set('embed_type', 'Inline');
      p.set('hide_event_type_details', '1');
      p.set('hide_landing_page_details', '1');
      /* Calendly's own cookie banner sat over the calendar. The page's banner
         and privacy policy (section 10) cover Calendly. */
      p.set('hide_gdpr_banner', '1');
      p.set('background_color', '1c1c1c');
      p.set('text_color', 'f2f2f2');
      p.set('primary_color', 'ea580c');
      if (val('name')) p.set('name', val('name'));
      var ph = ukPhone(val('phone'));
      if (ph) p.set('location', ph);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (k) { if (page.get(k)) p.set(k, page.get(k).slice(0, 120)); });
      if (lpRef) p.set('utm_term', lpRef);
      var f = document.createElement('iframe');
      f.src = CAL + '?' + p.toString();
      f.title = 'Book your demo call with Jamie';
      f.setAttribute('loading', 'eager');
      box.innerHTML = '';
      box.appendChild(f);
    }
    /* Wait briefly for the CRM's reference so the booking is tied to this
       lead; without it Calendly's webhook still matches by phone or email. */
    var t = setTimeout(function () { embed(''); }, 4000);
    refP.then(function (r) { clearTimeout(t); embed(r); });

    window.addEventListener('message', function (e) {
      if (e.origin !== 'https://calendly.com' || !e.data || typeof e.data.event !== 'string') return;
      var frame = box.querySelector('iframe');
      if (e.data.event === 'calendly.page_height' && frame && e.data.payload) {
        var h = parseInt(e.data.payload.height, 10);
        if (h > 300 && h < 2000) frame.style.height = h + 'px';
      }
      if (e.data.event === 'calendly.event_scheduled' && !booked) {
        booked = true;
        var inv = (e.data.payload && e.data.payload.invitee && e.data.payload.invitee.uri) || '';
        var uuid = inv.split('/').pop();
        if (uuid) window.track('Schedule', { content_name: 'Demo call booked' }, 'schedule.' + uuid);
        showFiles();
        if (!inv || !window.fetch) return;
        fetch(BOOK_API, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({ ref: lpRef, invitee_uri: inv, page: location.href, fbc: ck('_fbc'), fbp: ck('_fbp'),
            meta_test: /(?:^|[?&])test=1(?:&|$)/.test(location.search) }) })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var b = filesEl && filesEl.querySelector('[data-booked]');
            if (b && j && j.when) b.textContent = 'You’re booked in for ' + j.when;
          })
          .catch(function () {});
      }
    });
  }

  function showFiles() {
    if (!filesEl) return;
    bookEl.hidden = true;
    filesEl.hidden = false;
    if (!lpRef) {
      /* No reference means the CRM never saw the quiz, so uploads can't be
         matched. WhatsApp still works for photos. */
      var form = filesEl.querySelector('[data-files-form]');
      if (form) form.hidden = true;
      setStatus('Send your logo and photos to Jamie on WhatsApp and they will go straight into your demo.', '');
    }
    var top = quiz.getBoundingClientRect().top + window.pageYOffset - 90;
    if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }

  function setStatus(msg, cls) {
    var s = filesEl.querySelector('[data-files-status]');
    if (!s) return;
    s.textContent = msg;
    s.className = 'qstatus' + (cls ? ' ' + cls : '');
  }

  /* Phones take 5 to 12 MB photos; the CRM takes up to 4 MB. Shrink to 2000px
     JPEG (logos stay PNG so a see-through background survives). A format the
     browser can't draw (HEIC on Android) goes as it is if it is small enough. */
  function shrink(file, isLogo) {
    return new Promise(function (resolve) {
      var keep = function () { resolve(file.size <= 4 * 1024 * 1024 ? file : null); };
      if (!/^image\//.test(file.type) || /gif/.test(file.type)) return keep();
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var max = isLogo ? 1600 : 2000;
        var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k);
        c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        var png = isLogo && /png|webp/.test(file.type);
        c.toBlob(function (b) {
          if (!b) return keep();
          var base = (file.name || (isLogo ? 'logo' : 'photo')).replace(/\.[^.]+$/, '');
          resolve(new File([b], base + (png ? '.png' : '.jpg'), { type: png ? 'image/png' : 'image/jpeg' }));
        }, png ? 'image/png' : 'image/jpeg', 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(url); keep(); };
      img.src = url;
    });
  }

  function post(body) {
    return fetch(FILES_API, { method: 'POST', mode: 'cors', body: body })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .catch(function () { return { ok: false, error: 'connection dropped' }; });
  }

  var sendBtn = filesEl && filesEl.querySelector('[data-files-send]');
  if (sendBtn) sendBtn.addEventListener('click', function () {
    if (!lpRef || sendBtn.disabled) return;
    var site = (document.getElementById('f-site') || {}).value || '';
    var logo = (document.getElementById('f-logo') || {}).files || [];
    var photos = Array.prototype.slice.call((document.getElementById('f-photos') || {}).files || [], 0, 12);
    var jobs = [];
    if (logo[0]) jobs.push({ file: logo[0], kind: 'logo' });
    photos.forEach(function (f) { jobs.push({ file: f, kind: 'photo' }); });
    if (!site.trim() && !jobs.length) { setStatus('Add a link, your logo or some photos first.', 'bad'); return; }
    sendBtn.disabled = true;
    var sent = 0, failed = 0;
    var chain = site.trim()
      ? post(JSON.stringify({ ref: lpRef, website: site.trim() }))
      : Promise.resolve({ ok: true });
    jobs.forEach(function (j, i) {
      chain = chain.then(function () {
        setStatus('Sending ' + (i + 1) + ' of ' + jobs.length + '...', '');
        return shrink(j.file, j.kind === 'logo').then(function (f) {
          if (!f) { failed++; return; }
          var fd = new FormData();
          fd.append('ref', lpRef);
          fd.append('kind', j.kind);
          fd.append('file', f, f.name);
          return post(fd).then(function (r) { if (r && r.ok) sent++; else failed++; });
        });
      });
    });
    chain.then(function () {
      sendBtn.disabled = false;
      if (failed && !sent && jobs.length) { setStatus('Those didn’t send. Please send them to Jamie on WhatsApp instead.', 'bad'); return; }
      var form = filesEl.querySelector('[data-files-form]');
      if (form) form.hidden = true;
      setStatus('Thanks, Jamie has them' + (failed ? ' (' + failed + ' didn’t send, WhatsApp them over if you like)' : '') + '. Speak soon.', 'ok');
      window.track('demo_files_sent', { files: sent });
    });
  });


  show(1);
})();
