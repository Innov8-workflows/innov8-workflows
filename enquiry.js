// Saves a website enquiry to the innov8 CRM, then the form carries on and opens
// WhatsApp as before. Fire-and-forget: keepalive lets the request finish even
// if WhatsApp replaces the page, and text/plain skips the CORS preflight.
// Nothing is stored in the browser.
window.innov8SaveEnquiry = function (form, fields) {
  try {
    var body = { form: form, page: location.href, referrer: document.referrer };
    for (var k in fields) body[k] = fields[k];
    fetch('https://crm.innov8workflows.co.uk/api/webhook/site-enquiry', {
      method: 'POST', mode: 'cors', keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(body)
    }).catch(function () {});
  } catch (e) {}
};
