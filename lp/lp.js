

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

  window.track = function (name, params) {
    if (!started) { q.push([name, params]); return; }
    if (window.gtag) window.gtag('event', name === 'Lead' ? 'generate_lead' : name, params || {});
    if (window.fbq) {
      var STD = { Lead: 1, Contact: 1, PageView: 1 };
      window.fbq(STD[name] ? 'track' : 'trackCustom', name, params || {});
    }
  };
  function flush() { var c = q.slice(); q.length = 0; c.forEach(function (e) { window.track(e[0], e[1]); }); }

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
  window.sendCrm = function (d) {
    if (!CRM) return;
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
        company_website: d.hp || ''
      };
      if (d.noWebsite) body.website = '';
      fetch(CRM, { method: 'POST', mode: 'cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body) }).catch(function () {});
    } catch (e) {}
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
      window.sendCrm({
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
      window.track('Lead', { content_name: 'Free demo funnel', method: btn.getAttribute('data-quiz-send'), trade: answers[KEYS[0]] || '', timing: answers[KEYS[KEYS.length - 1]] || '' });
    }, false);
  });


  show(1);
})();
