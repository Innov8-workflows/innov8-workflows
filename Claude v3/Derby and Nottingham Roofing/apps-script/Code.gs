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

var PROP_KEY  = 'LEAD_SHEET_ID';

/* Who gets told about a new lead.
 * The client is on this list so a completed quiz reaches the person who can
 * actually ring the customer back: the quiz says "we've got your details"
 * whether or not they then tap WhatsApp, so without this nobody would.
 * Each address is mailed SEPARATELY in notify(), so a bad or full mailbox
 * cannot stop the others being told. Jay stays on the list deliberately:
 * if info@ silently fails, the leads are still visibly arriving somewhere. */
var NOTIFY = [
  'jamie@innov8workflows.co.uk',
  'info@derbyandnottinghamroofing.co.uk',
];
/* MailApp always sends as the script owner (wicked.jay540@gmail.com), which is
 * not an address the client should be replying to. */
var REPLY_TO = 'jamie@innov8workflows.co.uk';

/* A form lead nobody has marked off within this many hours gets chased.
 * See chaseUnactioned(): it is inert until a time-driven trigger is added. */
var CHASE_AFTER_HOURS = 2;

/* Columns L and M are the follow-up trail: Status is typed by a human
 * ("called", "quoted", "no answer"), Chased is stamped by the script. */
var HEADERS = ['Timestamp','Name','Phone','Area','Service','Message','Page','GCLID','Type','FBCLID','Campaign','Status','Chased'];
var COL_STATUS = 12, COL_CHASED = 13;   // 1-based sheet columns

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
  /* The name and number go in the SUBJECT so the lead is actionable straight
   * off a phone's lock screen, without opening anything. The old subject
   * ended in the business name, which is the least useful thing in it. */
  var phone = String(data.phone || '').trim();
  var subject = 'New lead: ' + (data.name || 'no name')
              + (phone ? ', ' + phone : '')
              + (data.area ? ', ' + data.area : '')
              + (data.service ? ', ' + data.service : '');

  var body = [
    'CALL THEM BACK: ' + (phone || '(no number given)'),
    '',
    'Name:     ' + (data.name || '-'),
    'Phone:    ' + (phone || '-'),
    'Area:     ' + (data.area || '-'),
    'Service:  ' + (data.service || '-'),
    'Message:  ' + (data.msg || '-'),
    '',
    'They filled the form on the website and were told we would call them back,',
    'so they are expecting to hear from us. The quicker the better.',
    '',
    'Channel:  ' + channel,
    'Page:     ' + (data.page || '-'),
    'Campaign: ' + (data.utm_campaign || '-'),
    'Click ID: ' + (data.gclid || data.fbclid || '(none - organic/direct)'),
    '',
    'All leads: https://docs.google.com/spreadsheets/d/1wIUpK2HfI-kMPwJWcTrLiKTehSHoUzDg6XFvulKcYys/edit'
  ].join('\n');

  /* One address at a time. A single sendEmail to a comma list is all-or-nothing:
   * one rejected recipient and NOBODY is told about the lead. */
  NOTIFY.forEach(function (to) {
    try {
      MailApp.sendEmail({ to: to, subject: subject, body: body,
                          name: 'Derby & Nottingham Roofing website', replyTo: REPLY_TO });
    } catch (err) {
      Logger.log('Lead alert to ' + to + ' FAILED: ' + err);
    }
  });
}

/* ============================================================
   Safety net. An alert that is missed, filtered or spam-foldered still loses
   the customer, so any form lead with an empty Status after CHASE_AFTER_HOURS
   is re-sent as a digest. Marking column L stops the chase.

   INERT until a trigger exists. To enable: Apps Script editor -> Triggers ->
   Add trigger -> chaseUnactioned -> Time-driven -> Hour timer -> Every hour.
   ============================================================ */
function chaseUnactioned() {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  if (!id) return;
  var ss = SpreadsheetApp.openById(id);
  var now = new Date().getTime();
  var due = [];

  ['Google Ads', 'Organic', 'Meta'].forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return;
    var rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (String(r[8] || 'form') !== 'form') continue;          // clicks are not chaseable
      if (String(r[COL_STATUS - 1] || '').trim()) continue;     // someone has actioned it
      if (String(r[COL_CHASED - 1] || '').trim()) continue;     // already chased once
      // Not `instanceof Date`: that skips the row outright if the timestamp cell
      // is ever text rather than a real date, and a row silently skipped forever
      // is the exact failure this safety net exists to catch. new Date() handles
      // both; anything unparseable is logged, not swallowed.
      var ts = r[0] ? new Date(r[0]).getTime() : 0;
      if (!ts || isNaN(ts)) { Logger.log('Row ' + (i + 2) + ' of ' + name + ': unreadable timestamp, skipped'); continue; }
      if ((now - ts) / 3600000 < CHASE_AFTER_HOURS) continue;
      due.push({ sheet: sh, row: i + 2, channel: name, name: r[1], phone: r[2],
                 area: r[3], service: r[4], hours: Math.floor((now - ts) / 3600000) });
    }
  });
  if (!due.length) return;

  var body = ['These leads have had no response yet. Column L in the sheet is empty.', ''];
  due.forEach(function (d) {
    body.push(d.hours + 'h ago  ' + (d.name || '-') + '  ' + (d.phone || '-') +
              '   (' + d.channel + ', ' + (d.area || '-') + ', ' + (d.service || '-') + ')');
  });
  body.push('', 'Put anything in the Status column to stop the reminder.',
            'https://docs.google.com/spreadsheets/d/1wIUpK2HfI-kMPwJWcTrLiKTehSHoUzDg6XFvulKcYys/edit');

  var subject = due.length + ' lead' + (due.length > 1 ? 's' : '') + ' still waiting for a callback';
  NOTIFY.forEach(function (to) {
    try {
      MailApp.sendEmail({ to: to, subject: subject, body: body.join('\n'),
                          name: 'Derby & Nottingham Roofing website', replyTo: REPLY_TO });
    } catch (err) { Logger.log('Chase to ' + to + ' FAILED: ' + err); }
  });
  // Stamp AFTER sending, so a send failure does not silently retire the chase.
  due.forEach(function (d) { d.sheet.getRange(d.row, COL_CHASED).setValue(new Date()); });
}

/* ============================================================
   ONE-TIME MIGRATION — run migrate() once from the editor, then
   this function can be deleted. Safe to run twice (idempotent).
   ============================================================ */
function migrate() {
  var id = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  var ss = SpreadsheetApp.openById(id);
  var log = [];

  // 1. Whatever tab currently holds the history becomes the Google Ads tab.
  //    Do NOT assume the name: this sheet's tab is "PPC Leads", and an exact
  //    match on "Leads" would silently create an empty tab and strand the data.
  if (!ss.getSheetByName('Google Ads')) {
    var CHANNELS = ['Google Ads', 'Organic', 'Meta', 'Test', 'Dashboard'];
    var old = ss.getSheets().filter(function (sh) {
      return CHANNELS.indexOf(sh.getName()) === -1 && sh.getLastRow() > 0;
    })[0];
    if (old) { log.push('Renamed "' + old.getName() + '" -> "Google Ads"'); old.setName('Google Ads'); }
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
    var page = String(rows[i][6] || '');
    var junk = /^(TEST|DEBUG)/i.test(name) || /(test|pixel)/i.test(name)
               || name.toLowerCase() === 'shapon' || page.indexOf('/K:/') === 0;
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
