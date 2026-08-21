/* Derby & Nottingham Roofing — website lead logger
 * Receives POSTed JSON from the website and appends a row to the tab for the
 * channel the lead came from: "Google Ads", "Organic" or "Meta".
 * Form leads also send an email alert naming the channel. Click events
 * (call / WhatsApp taps) are logged silently.
 *
 * ?leadtest=1 on the website routes the row to the "Test" tab and sends no
 * email, so the live site can be verified without spamming the client.
 *
 * After editing: Deploy -> Manage deployments -> pencil -> Version: New version
 * -> Deploy. That keeps the /exec URL the website already points at.
 */

var PROP_KEY     = 'LEAD_SHEET_ID';
var NOTIFY_EMAIL = 'jamie@innov8workflows.co.uk';
var HEADERS = ['Timestamp','Name','Phone','Area','Service','Message','Page','GCLID','Type','FBCLID','Campaign'];

/* ---------- channel routing ----------
 * Order matters. Meta is tested BEFORE the generic /lp/ rule, or the Meta
 * landing page would be misfiled as Google Ads.
 * Caveat: gclid/fbclid only exist on the click arriving from the ad and are
 * held in sessionStorage, so a visitor who returns days later reads as Organic.
 */
function channelOf(d) {
  var page = String(d.page || '');
  var src  = String(d.utm_source || '').toLowerCase();
  var med  = String(d.utm_medium || '').toLowerCase();

  if (d.fbclid) return 'Meta';
  if (/facebook|instagram|meta|fbig/.test(src)) return 'Meta';
  if (page.indexOf('/lp/roof-check') === 0) return 'Meta';

  if (d.gclid) return 'Google Ads';
  if (med === 'cpc' || med === 'ppc' || med === 'paid') return 'Google Ads';
  if (page.indexOf('/lp/') === 0) return 'Google Ads';

  return 'Organic';
}

/* Fetch a tab, creating it with headers if missing — a typo or a new channel
 * must never cost a lead. */
function tab(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function setup() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty(PROP_KEY);
  if (!id) {
    var ss = SpreadsheetApp.create('Derby & Nottingham Roofing - Website Leads');
    props.setProperty(PROP_KEY, ss.getId());
    id = ss.getId();
  }
  var book = SpreadsheetApp.openById(id);
  ['Google Ads','Organic','Meta','Test'].forEach(function (n) { tab(book, n); });
  Logger.log('Lead sheet: https://docs.google.com/spreadsheets/d/' + id);
}

function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  var id = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  if (!id) return ContentService.createTextOutput('no sheet');

  var channel = channelOf(data);
  var isTest  = !!data.test;

  var lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (err2) {}
  try {
    var ss = SpreadsheetApp.openById(id);
    tab(ss, isTest ? 'Test' : channel).appendRow([
      new Date(),
      String(data.name || ''),
      data.phone ? "'" + String(data.phone) : '',
      String(data.area || ''),
      String(data.service || ''),
      String(data.msg || ''),
      String(data.page || ''),
      String(data.gclid || ''),
      String(data.type || 'form'),
      String(data.fbclid || ''),
      String(data.utm_campaign || '')
    ]);
    // Email only real form leads. Click events log silently or the inbox floods.
    if (!isTest && (data.type || 'form') === 'form') {
      try { notify(data, channel); } catch (e3) {}
    }
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput('ok');
}

function notify(data, channel) {
  var subject = 'New ' + channel + ' lead' + (data.name ? ' - ' + data.name : '')
              + ' | Derby & Nottingham Roofing';
  MailApp.sendEmail(NOTIFY_EMAIL, subject, [
    'Channel: ' + channel,
    '',
    'Name:     ' + (data.name || '-'),
    'Phone:    ' + (data.phone || '-'),
    'Area:     ' + (data.area || '-'),
    'Service:  ' + (data.service || '-'),
    'Message:  ' + (data.msg || '-'),
    'Page:     ' + (data.page || '-'),
    'Campaign: ' + (data.utm_campaign || '-'),
    'Click ID: ' + (data.gclid || data.fbclid || '(none - organic/direct)'),
    '',
    'Sheet: https://docs.google.com/spreadsheets/d/1wIUpK2HfI-kMPwJWcTrLiKTehSHoUzDg6XFvulKcYys/edit'
  ].join('\n'));
}

/* ============================================================
   ONE-TIME MIGRATION — run migrate() once from the editor, then
   this function can be deleted. Safe to run twice (idempotent).
   ============================================================ */
function migrate() {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  var ss = SpreadsheetApp.openById(id);
  var log = [];

  // 1. "Leads" becomes the Google Ads tab, keeping all existing history.
  var old = ss.getSheetByName('Leads');
  if (old && !ss.getSheetByName('Google Ads')) {
    old.setName('Google Ads');
    log.push('Renamed "Leads" -> "Google Ads"');
  }

  // 2. Every channel tab exists, with the full 11-column header.
  ['Google Ads','Organic','Meta','Test'].forEach(function (n) {
    var sh = tab(ss, n);
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sh.setFrozenRows(1);
  });

  // 3. Remove my test rows and the review-spam enquiry from the Ads tab.
  //    Deliberately exact matches only - a loose pattern could bin a real lead.
  var ads = ss.getSheetByName('Google Ads');
  var rows = ads.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    var name = String(rows[i][1] || '').trim();
    var junk = /^(TEST|DEBUG)\b/i.test(name) || name.toLowerCase() === 'shapon';
    if (junk) { ads.deleteRow(i + 1); log.push('Deleted row ' + (i + 1) + ': ' + name); }
  }

  // 4. Dashboard.
  var d = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard');
  d.clear();
  var C = ['Google Ads','Organic','Meta'];
  var q = function (n) { return n.indexOf(' ') > -1 ? "'" + n + "'" : n; };
  var block = function (top, title, extra) {
    d.getRange(top, 1).setValue(title).setFontWeight('bold');
    d.getRange(top + 1, 1, 1, 5).setValues([['', 'Google Ads', 'Organic', 'Meta', 'Total']]).setFontWeight('bold');
    [['Form leads','form'], ['Call clicks','call_click'], ['WhatsApp clicks','whatsapp_click']]
      .forEach(function (r, k) {
        var row = top + 2 + k;
        d.getRange(row, 1).setValue(r[0]);
        C.forEach(function (ch, j) {
          d.getRange(row, 2 + j).setFormula(
            '=COUNTIFS(' + q(ch) + '!$I:$I,"' + r[1] + '"' + extra(ch) + ')');
        });
        d.getRange(row, 5).setFormula('=SUM(B' + row + ':D' + row + ')');
      });
    var tot = top + 5;
    d.getRange(tot, 1).setValue('Total').setFontWeight('bold');
    d.getRange(tot, 2, 1, 4).setFormulas([['=SUM(B' + (top+2) + ':B' + (tot-1) + ')',
      '=SUM(C' + (top+2) + ':C' + (tot-1) + ')', '=SUM(D' + (top+2) + ':D' + (tot-1) + ')',
      '=SUM(E' + (top+2) + ':E' + (tot-1) + ')']]).setFontWeight('bold');
  };

  d.getRange(1, 1).setValue('Derby & Nottingham Roofing — Leads by channel')
   .setFontSize(14).setFontWeight('bold');
  block(3, 'THIS MONTH', function (ch) {
    return ',' + q(ch) + '!$A:$A,">="&EOMONTH(TODAY(),-1)+1,' + q(ch) + '!$A:$A,"<"&EOMONTH(TODAY(),0)+1';
  });
  block(11, 'ALL TIME', function () { return ''; });
  d.getRange(18, 1).setValue('Form leads = someone left a name and number. Clicks = tapped call/WhatsApp, no details captured.')
   .setFontStyle('italic').setFontColor('#666');
  d.setColumnWidth(1, 160);

  log.push('Dashboard rebuilt');
  Logger.log(log.join('\n') || 'Nothing to do — already migrated.');
}
