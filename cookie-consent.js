/*
  INNOV8 WORKFLOWS — COOKIE CONSENT BANNER
  =========================================
  Drop the <script> tag referencing this file just before </body>
  on every HTML page, OR paste the contents of this file directly
  into a <script> tag at the bottom of each page.

  The banner:
  - Appears on first visit
  - Remembers the user's choice for 365 days
  - Blocks the Jotform chatbot script until consent is given
  - Has Accept and Decline options
  - Links to the Privacy Policy
  - Matches the Innov8 brand exactly
*/

(function () {
  'use strict';

  const CONSENT_KEY = 'innov8_cookie_consent';
  const CONSENT_EXPIRY_DAYS = 365;
  const JOTFORM_AGENT_ID = '019d21ae740c7db289b331944a1348e32b39';

  // ── Check existing consent ──
  function getConsent() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (!stored) return null;
      if (Date.now() > stored.expires) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return stored.value; // 'accepted' | 'declined'
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    const expires = Date.now() + CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, expires }));
  }

  // ── Load Jotform chatbot ──
  function loadChatbot() {
    if (document.querySelector('script[src*="jotfor.ms/agent"]')) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jotfor.ms/agent/embedjs/' + JOTFORM_AGENT_ID + '/embed.js';
    s.async = true;
    document.body.appendChild(s);
  }

  // ── Remove any chatbot already injected (on decline) ──
  function removeChatbot() {
    const existing = document.querySelector('script[src*="jotfor.ms/agent"]');
    if (existing) existing.remove();
    // Remove Jotform widget iframe if already rendered
    const widgets = document.querySelectorAll('iframe[src*="jotform"], [id*="jotform"], [class*="jotform"]');
    widgets.forEach(w => w.remove());
  }

  // ── Build and inject the banner ──
  function showBanner() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #i8-cookie-banner {
        position: fixed;
        bottom: 24px;
        left: 24px;
        right: 24px;
        max-width: 540px;
        z-index: 99999;
        background: #161616;
        border: 1px solid #2a2a2a;
        border-top: 3px solid #ea580c;
        border-radius: 14px;
        padding: 24px 28px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.6);
        font-family: 'Bricolage Grotesque', 'Segoe UI', sans-serif;
        animation: i8-slideUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
      }
      @keyframes i8-slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      #i8-cookie-banner .i8-cb-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      #i8-cookie-banner .i8-cb-icon {
        width: 28px;
        height: 28px;
        background: rgba(234,88,12,0.12);
        border: 1px solid rgba(234,88,12,0.2);
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      #i8-cookie-banner .i8-cb-title {
        font-size: 0.92rem;
        font-weight: 700;
        color: #f0f0f0;
        letter-spacing: -0.01em;
      }
      #i8-cookie-banner .i8-cb-body {
        font-size: 0.82rem;
        color: #888;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      #i8-cookie-banner .i8-cb-body a {
        color: #ea580c;
        text-decoration: none;
      }
      #i8-cookie-banner .i8-cb-body a:hover {
        text-decoration: underline;
      }
      #i8-cookie-banner .i8-cb-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      #i8-cookie-banner .i8-cb-accept {
        background: #ea580c;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 10px 22px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        font-family: inherit;
        letter-spacing: 0.01em;
      }
      #i8-cookie-banner .i8-cb-accept:hover {
        background: #f97316;
        transform: translateY(-1px);
      }
      #i8-cookie-banner .i8-cb-decline {
        background: transparent;
        color: #666;
        border: 1px solid #2a2a2a;
        border-radius: 8px;
        padding: 10px 18px;
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: color 0.2s, border-color 0.2s;
        font-family: inherit;
      }
      #i8-cookie-banner .i8-cb-decline:hover {
        color: #f0f0f0;
        border-color: #666;
      }
      #i8-cookie-banner .i8-cb-manage {
        font-size: 0.72rem;
        color: #555;
        text-decoration: none;
        margin-left: auto;
        transition: color 0.2s;
        font-family: 'DM Mono', monospace;
        letter-spacing: 0.03em;
      }
      #i8-cookie-banner .i8-cb-manage:hover {
        color: #888;
      }
    `;
    document.head.appendChild(style);

    // Build banner HTML
    const banner = document.createElement('div');
    banner.id = 'i8-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="i8-cb-top">
        <div class="i8-cb-icon">🍪</div>
        <div class="i8-cb-title">We use cookies</div>
      </div>
      <p class="i8-cb-body">
        We use essential cookies to keep the site working, and third-party cookies (including our AI chatbot) to improve your experience. Read our <a href="privacy-policy.html">Privacy Policy</a> for full details.
      </p>
      <div class="i8-cb-actions">
        <button class="i8-cb-accept" id="i8-accept-btn">Accept cookies</button>
        <button class="i8-cb-decline" id="i8-decline-btn">Decline</button>
        <a href="privacy-policy.html" class="i8-cb-manage">Learn more</a>
      </div>
    `;

    document.body.appendChild(banner);

    // Event listeners
    document.getElementById('i8-accept-btn').addEventListener('click', function () {
      setConsent('accepted');
      loadChatbot();
      dismissBanner();
    });

    document.getElementById('i8-decline-btn').addEventListener('click', function () {
      setConsent('declined');
      removeChatbot();
      dismissBanner();
    });
  }

  function dismissBanner() {
    const banner = document.getElementById('i8-cookie-banner');
    if (banner) {
      banner.style.transition = 'opacity 0.3s, transform 0.3s';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(10px)';
      setTimeout(() => banner.remove(), 300);
    }
  }

  // ── Init ──
  function init() {
    const consent = getConsent();
    if (consent === 'accepted') {
      loadChatbot();
    } else if (consent === 'declined') {
      removeChatbot();
    } else {
      // No consent yet — show banner, don't load chatbot
      showBanner();
    }
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
