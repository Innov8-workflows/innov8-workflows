/* ============================================================
   ads.js — Ad placement submission + Stripe Checkout
   ============================================================ */

import { STRIPE_CONFIG, AD_BADGE_TYPES } from './config.js';
import { submitAdToFirestore, markAdAsPaid, isSignedIn } from './auth.js';

let _stripe = null;

// ─── Init ───

export function initStripe() {
  if (typeof Stripe === 'undefined') {
    console.warn('[ads] Stripe SDK not loaded');
    return false;
  }
  try {
    _stripe = Stripe(STRIPE_CONFIG.publishableKey);
    return true;
  } catch (e) {
    console.error('[ads] Stripe init failed:', e.message);
    return false;
  }
}

// ─── Ad Submission Flow ───

/**
 * Submit an ad and redirect to Stripe Checkout
 * @param {Object} adData - { badge, badgeText, name, text, url }
 * @param {number} durationIndex - index into STRIPE_CONFIG.prices
 * @returns {string} adId from Firestore
 */
export async function submitAndPay(adData, durationIndex) {
  if (!isSignedIn()) {
    throw new Error('You must be signed in to place an ad');
  }

  const duration = STRIPE_CONFIG.prices[durationIndex];
  if (!duration) throw new Error('Invalid duration selected');

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + duration.days);

  // Save ad to Firestore
  const adId = await submitAdToFirestore({
    badge: adData.badge,
    badgeText: adData.badgeText,
    name: adData.name,
    text: adData.text,
    url: adData.url,
    logoUrl: adData.logoUrl || null,
    duration: duration.days,
    priceLabel: duration.price,
    expiresAt: expiresAt.toISOString(),
  });

  // Redirect to Stripe Payment Link
  if (duration.paymentLink) {
    // Store the ad ID so we can approve it when they return
    localStorage.setItem('innov8-bubbles-pending-ad', adId);
    window.location.href = duration.paymentLink;
  } else {
    throw new Error('Payment system unavailable. Please try again later.');
  }

  return adId;
}

// ─── Check for payment success on page load ───

export async function checkPaymentReturn() {
  const params = new URLSearchParams(window.location.search);
  const paid = params.get('ad_paid');
  if (paid) {
    // Check for pending ad ID from before redirect
    const pendingAdId = localStorage.getItem('innov8-bubbles-pending-ad');
    if (pendingAdId) {
      try {
        await markAdAsPaid(pendingAdId);
        localStorage.removeItem('innov8-bubbles-pending-ad');
      } catch (e) {
        console.warn('[ads] Could not mark ad as paid on return:', e.message);
      }
    }
    // Clean up URL
    window.history.replaceState({}, '', window.location.pathname);
    return pendingAdId;
  }
  return null;
}

// ─── Ad Preview ───

export function generateAdPreviewHTML(adData) {
  const badge = AD_BADGE_TYPES.find(b => b.value === adData.badge) || AD_BADGE_TYPES[0];
  const logoHtml = adData.logoUrl ? `<img class="ticker-ad-logo" src="${adData.logoUrl}" alt="">` : '';
  return `<a class="ticker-item" href="${adData.url || '#'}" target="_blank" rel="noopener">
    <span class="ticker-badge ${badge.value}">${badge.badgeText}</span>
    ${logoHtml}
    <span class="ticker-name">${adData.name || '$TOKEN'}</span>
    <span>${adData.text || 'Your ad description here'}</span>
  </a>`;
}
