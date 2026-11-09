(function () {
  'use strict';

  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  var CRM = document.documentElement.getAttribute('data-crm') || '';
  var form = document.getElementById('applyForm');
  var err = document.getElementById('applyErr');
  var done = document.getElementById('applyDone');
  if (!form) return;

  function val(name) { return String(form.elements[name].value || '').trim(); }
  function asUrl(v) { return v && !/^https?:\/\//i.test(v) ? 'https://' + v.replace(/^\/+/, '') : v; }
  function looksLikeUrl(v) { return /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(asUrl(v)); }

  var checks = {
    name: function (v) { return v.length >= 2; },
    town: function (v) { return v.length >= 2; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
    phone: function (v) { return v.replace(/\D/g, '').length >= 10; },
    cv: looksLikeUrl,
    site: looksLikeUrl,
    part: function (v) { return v.length >= 5; },
    video: looksLikeUrl,
    notice: function (v) { return !!v; },
    rtw: function (v) { return !!v; }
  };

  function fail(msg) { err.textContent = msg; err.hidden = false; }

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('bad');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var firstBad = null;
    Object.keys(checks).forEach(function (k) {
      var ok = checks[k](val(k));
      var f = form.elements[k].closest('.field');
      f.classList.toggle('bad', !ok);
      if (!ok && !firstBad) firstBad = form.elements[k];
    });
    if (firstBad) {
      fail('Please fill in the boxes marked in red.');
      firstBad.focus();
      return;
    }

    var name = val('name');
    var parts = name.split(/\s+/);
    var lines = [
      'Job application: Digital Operations Manager',
      'Name: ' + name,
      'Based in: ' + val('town'),
      'Email: ' + val('email'),
      'Mobile: ' + val('phone'),
      'Right to work in the UK: ' + val('rtw'),
      'Notice period: ' + val('notice'),
      'CV: ' + asUrl(val('cv')),
      'Best website: ' + asUrl(val('site')),
      'Their part in it: ' + val('part'),
      'Video: ' + asUrl(val('video'))
    ];
    if (val('more')) lines.push('Anything else: ' + val('more'));

    var body = {
      form: 'Job application, Digital Operations Manager',
      page: location.href,
      referrer: document.referrer || '',
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
      email: val('email'),
      phone: val('phone'),
      company: 'Job application: ' + name,
      businessType: 'Job applicant',
      town: val('town'),
      message: lines.join('\n'),
      company_website: val('company_website')
    };

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;

    fetch(CRM, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok !== false, status: r.status }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status === 429 ? 'busy' : 'failed');
        form.hidden = true;
        done.hidden = false;
        done.focus();
        if (window.gtag) window.gtag('event', 'job_application', { role: 'Digital Operations Manager' });
      })
      .catch(function (e2) {
        btn.disabled = false;
        fail(e2 && e2.message === 'busy'
          ? 'Too many tries in a short time. Please wait a few minutes and send it again.'
          : 'Sorry, that didn\'t send. Please try again, or email your answers to jamie@innov8workflows.co.uk.');
      });
  });
})();
