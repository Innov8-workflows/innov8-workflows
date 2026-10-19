(function () {
  'use strict';
  var root = document.documentElement;
  var API = root.getAttribute('data-api') || '';
  var SITEKEY = root.getAttribute('data-turnstile') || '';
  var PRICE = Number(root.getAttribute('data-price')) || 85;
  var SETUP = Number(root.getAttribute('data-setup')) || 295;
  var GA = 'G-LFEDCY725K';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.i8LoadAnalytics = function () {
    if (window.__i8ga) return; window.__i8ga = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
  };
  function track(name, params) { try { window.gtag('event', name, params || {}); } catch (e) {} }

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function icon(name, cls) {
    var NS = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'ic' + (cls ? ' ' + cls : '')); s.setAttribute('aria-hidden', 'true');
    var u = document.createElementNS(NS, 'use'); u.setAttribute('href', '#i-' + name); s.appendChild(u);
    return s;
  }
  function money(n) { return '£' + Math.round(n).toLocaleString('en-GB'); }
  function show(node, on) { node.hidden = !on; }

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var tsToken = '', tsWidget = null;
  if (SITEKEY) {
    window.i8TurnstileReady = function () {
      var box = $('turnstile'); box.hidden = false;
      tsWidget = window.turnstile.render(box, { sitekey: SITEKEY, theme: 'dark', callback: function (t) { tsToken = t; }, 'expired-callback': function () { tsToken = ''; } });
    };
    var ts = document.createElement('script');
    ts.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=i8TurnstileReady';
    ts.async = true; ts.defer = true;
    document.head.appendChild(ts);
  }
  function resetTurnstile() { tsToken = ''; if (tsWidget != null && window.turnstile) try { window.turnstile.reset(tsWidget); } catch (e) {} }

  function post(path, body, ms) {
    var ctl = 'AbortController' in window ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, ms || 60000) : null;
    return fetch(API + path, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { j.__status = r.status; return j; }); })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  var form = $('checkForm'), input = $('url'), btn = $('checkBtn'), errEl = $('checkErr');
  var hero = $('top'), loading = $('loading'), result = $('result');
  var current = null, stepTimer = null;

  function err(node, msg) { node.textContent = msg; show(node, !!msg); }

  function startSteps() {
    var items = $('loadSteps').children, i = 0;
    Array.prototype.forEach.call(items, function (li) { li.classList.remove('on'); });
    items[0].classList.add('on');
    stepTimer = setInterval(function () { i++; if (i < items.length) items[i].classList.add('on'); else clearInterval(stepTimer); }, 3200);
  }
  function stopSteps() { clearInterval(stepTimer); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = input.value.trim();
    if (!url || url.indexOf('.') < 0) { err(errEl, 'Please type your website address, for example yourbusiness.co.uk.'); input.focus(); return; }
    if (SITEKEY && !tsToken) { err(errEl, 'Please tick the "I am human" box first.'); return; }
    err(errEl, '');
    btn.disabled = true;
    show(result, false); show(loading, true); startSteps();
    loading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('check_run');
    post('/check', { url: url, turnstileToken: tsToken }, 60000).then(function (j) {
      stopSteps(); show(loading, false); btn.disabled = false; resetTurnstile();
      if (!j.ok) { err(errEl, j.error || 'Something went wrong. Please try again.'); hero.scrollIntoView({ behavior: 'smooth' }); return; }
      current = j;
      renderScore(j);
    }).catch(function () {
      stopSteps(); show(loading, false); btn.disabled = false; resetTurnstile();
      err(errEl, 'That took too long. Please try again in a minute.');
      hero.scrollIntoView({ behavior: 'smooth' });
    });
  });

  function headFor(score) {
    if (score >= 8) return 'Your website is in good shape';
    if (score >= 5) return 'Your website is missing a few things';
    return 'Your website is losing you work';
  }

  function setDial(score) {
    var dial = $('dial'), num = $('scoreNum');
    dial.classList.remove('mid', 'good');
    if (score >= 7) dial.classList.add('good'); else if (score >= 4.5) dial.classList.add('mid');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { dial.style.setProperty('--p', score * 10); num.textContent = String(score); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3), v = score * e;
      dial.style.setProperty('--p', (v * 10).toFixed(1));
      num.textContent = k < 1 ? v.toFixed(1).replace(/\.0$/, '') : String(score);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function checkItem(r, withFix) {
    var li = el('li', r.status);
    li.appendChild(icon(r.status === 'pass' ? 'ok' : r.status === 'part' ? 'half' : 'no', 'st'));
    var box = el('div');
    box.appendChild(el('b', null, r.label));
    box.appendChild(el('p', null, r.text || r.bad || ''));
    if (withFix && r.fix) { var f = el('span', 'fix'); f.appendChild(icon('arrow')); f.appendChild(document.createTextNode(r.fix)); box.appendChild(f); }
    li.appendChild(box);
    return li;
  }

  function renderScore(j) {
    show(result, true); show($('full'), false); show($('gate'), true);
    $('band').textContent = j.band;
    $('scoreHead').textContent = headFor(j.score);
    $('siteName').textContent = j.url;
    setDial(j.score);

    var list = $('topList'); list.textContent = '';
    if (!j.top.length) {
      $('topHead').textContent = 'No big problems found';
      list.appendChild(checkItem({ status: 'pass', label: 'Nice work', text: 'Your homepage passed every check we ran.' }));
    } else {
      $('topHead').textContent = j.problems === 1 ? 'We found 1 problem' : 'We found ' + j.problems + ' problems';
      j.top.forEach(function (r) { list.appendChild(checkItem(r, false)); });
    }
    var hiddenN = Math.max(0, j.problems - j.top.length);
    $('gateHead').textContent = hiddenN ? 'See the other ' + hiddenN + ' problem' + (hiddenN > 1 ? 's' : '') + ' and how to fix them' : 'See how to fix ' + (j.top.length ? 'them' : 'the rest') + ', and your full report';
    err($('unlockErr'), '');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var F = { firstName: $('fName'), phone: $('fPhone'), business: $('fBiz'), jobValue: $('fJob') };
  function mark(bad) {
    Object.keys(F).forEach(function (k) { F[k].closest('.field').classList.toggle('bad', bad.indexOf(k) >= 0); });
  }
  function localBad() {
    var bad = [];
    if (F.firstName.value.trim().length < 2) bad.push('firstName');
    if (F.phone.value.replace(/\D/g, '').length < 10) bad.push('phone');
    if (F.business.value.trim().length < 2) bad.push('business');
    var jv = Number(F.jobValue.value.replace(/[^\d.]/g, ''));
    if (!(jv >= 50 && jv <= 500000)) bad.push('jobValue');
    return bad;
  }
  F.jobValue.addEventListener('input', function () {
    var d = F.jobValue.value.replace(/[^\d]/g, '').slice(0, 6);
    F.jobValue.value = d ? Number(d).toLocaleString('en-GB') : '';
  });
  var tried = false;
  Object.keys(F).forEach(function (k) { F[k].addEventListener('input', function () { if (tried) mark(localBad()); }); });

  var unlockForm = $('unlockForm'), unlockBtn = $('unlockBtn'), unlockErr = $('unlockErr');
  unlockForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!current) return;
    tried = true;
    var bad = localBad(); mark(bad);
    if (bad.length) {
      err(unlockErr, bad.indexOf('jobValue') >= 0 && bad.length === 1 ? 'Please put your average job value in pounds, for example 2500.' : 'Please fill in the boxes in red.');
      F[bad[0]].focus(); return;
    }
    err(unlockErr, '');
    unlockBtn.disabled = true;
    post('/unlock', {
      id: current.id,
      firstName: F.firstName.value.trim(),
      phone: F.phone.value.trim(),
      business: F.business.value.trim(),
      jobValue: F.jobValue.value.replace(/[^\d]/g, ''),
      company_website: $('fWeb').value,
      page: location.href.split('#')[0],
      referrer: document.referrer || ''
    }, 30000).then(function (j) {
      unlockBtn.disabled = false;
      if (!j.ok) {
        if (j.fields) mark(j.fields);
        err(unlockErr, j.error || 'Something went wrong. Please try again.');
        return;
      }
      track('generate_lead', { method: 'website_checker', value: j.jobValue, currency: 'GBP' });
      renderFull(j);
    }).catch(function () {
      unlockBtn.disabled = false;
      err(unlockErr, 'That did not go through. Please try again.');
    });
  });

  var ORDER = { fail: 0, part: 1, pass: 2 };
  var jobValue = 0;
  function renderFull(j) {
    show($('gate'), false);
    var list = $('fullList'); list.textContent = '';
    j.results.slice().sort(function (a, b) { return ORDER[a.status] - ORDER[b.status]; }).forEach(function (r) { list.appendChild(checkItem(r, true)); });
    jobValue = j.jobValue;
    var s = $('jobs'); s.value = String(j.defaultExtra || 2);
    calc();
    show($('full'), true);
    $('full').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function calc() {
    var n = Number($('jobs').value) || 1;
    $('jobsOut').textContent = String(n);
    $('perMonth').textContent = money(n * jobValue);
    $('perYear').textContent = money(n * jobValue * 12);
    var firstYear = PRICE * 12 + SETUP;
    var need = Math.ceil(firstYear / jobValue);
    $('payback').textContent = need <= 1
      ? 'Just one extra job pays for your whole first year with Innov8 (' + money(firstYear) + ').'
      : 'Your whole first year with Innov8 costs ' + money(firstYear) + '. Just ' + need + ' extra jobs in the year covers it.';
    $('calcFine').textContent = 'Based on your average job of ' + money(jobValue) + ' and ' + n + ' extra job' + (n > 1 ? 's' : '') + ' a month. A guide, not a promise. Innov8 Essentials is ' + money(PRICE) + ' a month plus ' + money(SETUP) + ' setup.';
  }
  $('jobs').addEventListener('input', calc);

  $('again').addEventListener('click', function () {
    show(result, false); current = null; input.value = ''; err(errEl, '');
    hero.scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { input.focus(); }, 400);
  });
  $('demoBtn').addEventListener('click', function () { track('check_demo_click'); });
})();
