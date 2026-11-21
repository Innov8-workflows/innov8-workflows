(function () {
  'use strict';
  var HEROES = {
    driveways: { src: 'img/hero-yorkshire.webp', alt: 'The Yorkshire Resin Driveways website on a laptop', name: 'Yorkshire Resin Driveways', place: 'Yorkshire' },
    electrical: { src: 'img/hero-sparham.webp', alt: 'The S. Sparham Electrical website on a laptop', name: 'S. Sparham Electrical', place: 'Ripley and Derby' }
  };
  var trade = '';
  try {
    var p = new URLSearchParams(location.search);
    var tags = [p.get('trade'), p.get('utm_campaign'), p.get('utm_content')].join(' ').toLowerCase();
    if (/drive|resin|block pav|patio/.test(tags)) trade = 'driveways';
    else if (/electr|eletr|spark/.test(tags)) trade = 'electrical';
  } catch (e) {}
  var h = HEROES[trade];
  if (!h) return;
  var fig = document.querySelector('.hero-vis');
  if (!fig) return;
  var img = fig.querySelector('img');
  var b = fig.querySelector('figcaption b');
  if (img) { img.src = h.src; img.alt = h.alt; }
  if (b) {
    b.textContent = h.name;
    if (b.nextSibling) b.nextSibling.textContent = ', ' + h.place;
  }
  document.documentElement.setAttribute('data-trade', trade);
})();
