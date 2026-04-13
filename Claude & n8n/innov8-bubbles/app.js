/* ============================================================
   app.js — Innov8 Bubbles: Entry point, state, event wiring
   ============================================================ */

import { ASSET_CLASSES, STORAGE, STRIPE_CONFIG, AD_BADGE_TYPES, CURRENCIES, COLOR_SCHEMES, formatPrice, formatLargeNumber, formatChange, getLogoUrl, setColorScheme, getColorScheme } from './config.js';
import { BubbleEngine } from './bubble-engine.js';
import { fetchAssets } from './data-service.js';
import * as Portfolio from './portfolio.js';
import { initFirebase, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut as firebaseSignOut, onAuthChange, getCurrentUser, isSignedIn, getUserInitial, getUserDisplayName, fetchApprovedAds, syncLocalPortfoliosToCloud, loadPortfoliosFromCloud, uploadAdLogo } from './auth.js';
import { initStripe, submitAndPay, checkPaymentReturn, generateAdPreviewHTML } from './ads.js';

// ─── State ───
const state = {
  assetClass: 'crypto',
  period: '24h',
  searchQuery: '',
  activePortfolioId: null,
  allAssets: [],        // raw from API
  filteredAssets: [],    // after search + portfolio filter
  isSample: false,
  refreshInterval: 60,
  refreshTimer: null,
  selectedAsset: null,   // for detail panel
  viewMode: 'bubble',   // 'bubble' or 'table'
  sortBy: 'marketCap',
  sortDir: 'desc',
  theme: 'midnight',    // 'midnight', 'dark', 'slate', 'light'
  currency: 'usd',      // 'usd', 'gbp', 'eur', 'jpy', 'aud'
  colorScheme: 'red-green', // 'red-green', 'blue-yellow', 'purple-orange'
};

// ─── DOM References ───
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  loading: $('#loading-screen'),
  canvas: $('#bubble-canvas'),
  canvasContainer: $('#canvas-container'),
  sampleBadge: $('#sample-badge'),
  emptyState: $('#empty-state'),
  apiPrompt: $('#api-prompt'),
  apiPromptBtn: $('#api-prompt-btn'),

  // Header
  assetPills: $('#asset-class-pills'),
  periodPills: $('#period-pills'),
  searchInput: $('#search-input'),
  mobileSearchInput: $('#mobile-search-input'),

  // Portfolio dropdown
  portfolioDropdown: $('#portfolio-dropdown'),
  portfolioBtn: $('#portfolio-btn'),
  portfolioLabel: $('#portfolio-label'),
  portfolioMenu: $('#portfolio-menu'),
  portfolioList: $('#portfolio-list'),
  managePortfoliosBtn: $('#manage-portfolios-btn'),

  // Detail panel
  detailPanel: $('#detail-panel'),
  detailClose: $('#detail-close'),
  detailImage: $('#detail-image'),
  detailName: $('#detail-name'),
  detailSymbol: $('#detail-symbol'),
  detailPrice: $('#detail-price'),
  detailChangeMain: $('#detail-change-main'),
  detailMcap: $('#detail-mcap'),
  detailVolume: $('#detail-volume'),
  detail1h: $('#detail-1h'),
  detail24h: $('#detail-24h'),
  detail7d: $('#detail-7d'),
  detail30d: $('#detail-30d'),
  detail1y: $('#detail-1y'),
  addToPortfolioBtn: $('#add-to-portfolio-btn'),
  portfolioPopover: $('#portfolio-popover'),
  popoverPortfolioList: $('#popover-portfolio-list'),
  popoverNewPortfolio: $('#popover-new-portfolio'),

  // Settings modal
  settingsBtn: $('#settings-btn'),
  settingsModal: $('#settings-modal'),
  settingsClose: $('#settings-close'),
  fmpKeyInput: $('#fmp-key-input'),
  settingsSave: $('#settings-save'),

  // Portfolio modal
  portfolioModal: $('#portfolio-modal'),
  portfolioModalClose: $('#portfolio-modal-close'),
  portfolioManagerList: $('#portfolio-manager-list'),
  newPortfolioInput: $('#new-portfolio-input'),
  createPortfolioBtn: $('#create-portfolio-btn'),

  // Mobile
  hamburgerBtn: $('#hamburger-btn'),
  mobileMenu: $('#mobile-menu'),
  mobileMenuClose: $('#mobile-menu-close'),
  mobileAssetPills: $('#mobile-asset-pills'),
  mobilePeriodPills: $('#mobile-period-pills'),
  mobilePortfolioList: $('#mobile-portfolio-list'),
  mobileSettingsBtn: $('#mobile-settings-btn'),

  // Toast
  toastContainer: $('#toast-container'),

  // View toggle + table
  viewBubbles: $('#view-bubbles'),
  viewTable: $('#view-table'),
  tableView: $('#table-view'),
  assetTableBody: $('#asset-table-body'),
  assetTable: $('#asset-table'),

  // Auth
  signinBtn: $('#signin-btn'),
  userMenu: $('#user-menu'),
  userAvatarBtn: $('#user-avatar-btn'),
  userAvatar: $('#user-avatar'),
  userDropdownMenu: $('#user-dropdown-menu'),
  userMenuName: $('#user-menu-name'),
  userMenuEmail: $('#user-menu-email'),
  userManagePortfolios: $('#user-manage-portfolios'),
  userPlaceAd: $('#user-place-ad'),
  userSignout: $('#user-signout'),

  // Auth modal
  authModal: $('#auth-modal'),
  authModalTitle: $('#auth-modal-title'),
  authClose: $('#auth-close'),
  googleSigninBtn: $('#google-signin-btn'),
  signinForm: $('#signin-form'),
  signupForm: $('#signup-form'),
  authError: $('#auth-error'),

  // Ad modal
  adModal: $('#ad-modal'),
  adClose: $('#ad-close'),
  adBadgeSelect: $('#ad-badge-select'),
  adName: $('#ad-name'),
  adText: $('#ad-text'),
  adUrl: $('#ad-url'),
  adDurationGrid: $('#ad-duration-grid'),
  adPreviewStrip: $('#ad-preview-strip'),
  adSummary: $('#ad-summary'),
  adPayBtn: $('#ad-pay-btn'),
};

let engine;


// ─── Ad Ticker ───

// Placeholder sponsored ads — replace with real ad data from your backend/n8n
const TICKER_ADS = [
  { badge: 'new-drop', badgeText: 'NEW', name: '$LUNAR', text: 'AI-powered DeFi launching May 2026 — Early access live', url: '#' },
  { badge: 'ipo', badgeText: 'IPO', name: 'Klarna', text: 'Fintech giant IPO expected Q2 2026 — $15B valuation', url: '#' },
  { badge: 'presale', badgeText: 'PRESALE', name: '$NEXGEN', text: 'Next-gen L2 blockchain — Presale now open', url: '#' },
  { badge: 'promo', badgeText: 'PROMO', name: 'Innov8', text: 'Build your custom portfolio — Track all assets in one place', url: '#' },
  { badge: 'new-drop', badgeText: 'NEW', name: '$AURA', text: 'Real-world asset tokenisation — Launching on Ethereum', url: '#' },
  { badge: 'ipo', badgeText: 'IPO', name: 'Stripe', text: 'Payments giant confidentially files for IPO', url: '#' },
  { badge: 'presale', badgeText: 'PRESALE', name: '$ORBIT', text: 'Cross-chain DEX aggregator — Whitelist open', url: '#' },
  { badge: 'new-drop', badgeText: 'NEW', name: '$VRTX', text: 'Decentralised GPU compute network — Token live', url: '#' },
];

async function _initTicker() {
  const container = document.getElementById('ticker-content');
  if (!container) return;

  // Try to fetch real ads from Firestore, fall back to placeholder ads
  let ads = TICKER_ADS;
  try {
    const approvedAds = await fetchApprovedAds();
    if (approvedAds && approvedAds.length > 0) {
      ads = [...approvedAds, ...TICKER_ADS]; // paid ads first, then defaults
    }
  } catch (e) {
    // Firestore not configured — use defaults
  }

  // Build items HTML — duplicate for seamless loop
  const itemsHTML = ads.map(ad => {
    const logoHtml = ad.logoUrl ? `<img class="ticker-ad-logo" src="${ad.logoUrl}" alt="">` : '';
    return `<a class="ticker-item" href="${ad.url || '#'}" target="_blank" rel="noopener">
      <span class="ticker-badge ${ad.badge}">${ad.badgeText}</span>
      ${logoHtml}
      <span class="ticker-name">${ad.name}</span>
      <span>${ad.text}</span>
    </a>`;
  }).join('<span class="ticker-sep">|</span>');

  // Double the content for seamless infinite scroll
  container.innerHTML = itemsHTML + '<span class="ticker-sep">|</span>' + itemsHTML;

  // Adjust speed based on content width
  const duration = Math.max(20, ads.length * 5);
  container.style.setProperty('--ticker-duration', duration + 's');
}


// ─── Initialize ───

function _init() {
  try {
    _loadSettings();
    state.activePortfolioId = Portfolio.getActivePortfolioId();

    // Init Firebase & Stripe (non-blocking — works without them)
    initFirebase();
    initStripe();
    checkPaymentReturn().then(adId => {
      if (adId) _toast('Ad submitted and approved!', 'success');
    });

    engine = new BubbleEngine(dom.canvas);
    engine.onBubbleClick(asset => _showDetail(asset));
    engine.start();

    _wireAssetPills();
    _wirePeriodPills();
    _wireSearch();
    _wirePortfolioDropdown();
    _wireDetailPanel();
    _wireSettingsModal();
    _wirePortfolioModal();
    _wireMobileMenu();
    _wireResize();
    _wireRefreshPills();
    _wireAuthModal();
    _wireUserMenu();
    _wireAdModal();
    _wireViewToggle();
    _wireShareButton();
    _wireKeyboardShortcuts();
    _wireVisibilityThrottle();
    _initTicker();

    // Listen for auth state
    onAuthChange(_handleAuthStateChange);

    _fetchAndRender();
  } catch (e) {
    console.error('[init] error:', e.message, e.stack);
  }
}

// Module scripts are deferred — DOM is parsed when this runs.
// Use setTimeout(0) to let the browser complete layout before measuring.
setTimeout(_init, 0);


// ─── Data Flow ───

let _hasLoadedOnce = false;

async function _fetchAndRender(showLoader = true) {
  // Only show full loading screen on first load or explicit asset class switch
  if (!_hasLoadedOnce && showLoader) {
    _showLoading(true);
  }
  _hideStates();

  const assetClass = state.assetClass;

  // Check if key required (skip for "all" — it will show what it can)
  if (assetClass !== 'all' && ASSET_CLASSES[assetClass] && ASSET_CLASSES[assetClass].requiresKey && !localStorage.getItem(STORAGE.FMP_KEY)) {
    _showLoading(false);
    _showApiPrompt(true);
    engine.setBubbles([], state.period);
    return;
  }

  try {
    const { data, isSample } = await fetchAssets(assetClass);
    state.allAssets = data;
    state.isSample = isSample;

    // Ensure canvas is sized correctly
    engine.resize();
    _applyFilters();
    _showLoading(false);
    _hasLoadedOnce = true;

    if (isSample) {
      dom.sampleBadge.classList.remove('hidden');
    }

    _updateFooterStats();
    _startAutoRefresh();
  } catch (err) {
    console.error('[app] fetch error:', err);
    _showLoading(false);
    _hasLoadedOnce = true;
    _toast('Failed to load data. Showing sample data.', 'error');
  }
}

function _applyFilters() {
  let assets = [...state.allAssets];

  // Portfolio filter
  if (state.activePortfolioId) {
    const portfolio = Portfolio.getActivePortfolio();
    if (portfolio) {
      const idSet = new Set(portfolio.assetIds);
      assets = assets.filter(a => idSet.has(a.id));
    }
  }

  // Search filter
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    assets = assets.filter(a =>
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    );
  }

  state.filteredAssets = assets;

  // Render the active view
  if (state.viewMode === 'table') {
    _renderTable();
  } else {
    engine.setBubbles(assets, state.period);
  }

  // Show/hide empty state
  if (assets.length === 0 && state.allAssets.length > 0) {
    dom.emptyState.classList.remove('hidden');
  } else {
    dom.emptyState.classList.add('hidden');
  }
}


// ─── Asset Class Pills ───

function _wireAssetPills() {
  const handler = (e) => {
    const btn = e.target.closest('.pill');
    if (!btn || !btn.dataset.class) return;
    state.assetClass = btn.dataset.class;

    // Update all pill groups
    _syncPills('class', btn.dataset.class);
    _closeDetail();
    _fetchAndRender();
  };

  dom.assetPills.addEventListener('click', handler);
  dom.mobileAssetPills.addEventListener('click', handler);
}

function _syncPills(type, value) {
  const attr = type === 'class' ? 'data-class' : 'data-period';
  $$(`[${attr}]`).forEach(pill => {
    pill.classList.toggle('active', pill.getAttribute(attr) === value);
  });
}


// ─── Period Pills ───

function _wirePeriodPills() {
  const periodToField = { '1h': 'change1h', '24h': 'change24h', '7d': 'change7d', '30d': 'change30d', '1y': 'change1y' };
  const handler = (e) => {
    const btn = e.target.closest('.pill');
    if (!btn || !btn.dataset.period) return;
    state.period = btn.dataset.period;
    _syncPills('period', btn.dataset.period);
    // In table view, also sort by the selected period
    if (state.viewMode === 'table') {
      const field = periodToField[btn.dataset.period];
      if (field) {
        state.sortBy = field;
        state.sortDir = 'desc'; // best performers first
      }
    }
    _applyFilters();
  };

  dom.periodPills.addEventListener('click', handler);
  dom.mobilePeriodPills.addEventListener('click', handler);
}


// ─── Search ───

function _wireSearch() {
  let debounce;
  const handler = (value) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.searchQuery = value;
      _applyFilters();
    }, 300);
  };

  dom.searchInput.addEventListener('input', (e) => handler(e.target.value));
  dom.mobileSearchInput.addEventListener('input', (e) => {
    handler(e.target.value);
    dom.searchInput.value = e.target.value;
  });
}


// ─── Portfolio Dropdown ───

function _wirePortfolioDropdown() {
  dom.portfolioBtn.addEventListener('click', () => {
    dom.portfolioDropdown.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dom.portfolioDropdown.contains(e.target)) {
      dom.portfolioDropdown.classList.remove('open');
    }
  });

  dom.portfolioMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.dropdown-item[data-portfolio]');
    if (!item) return;

    const id = item.dataset.portfolio === 'all' ? null : item.dataset.portfolio;
    state.activePortfolioId = id;
    Portfolio.setActivePortfolio(id);

    _updatePortfolioLabel();
    _applyFilters();
    dom.portfolioDropdown.classList.remove('open');
  });

  dom.managePortfoliosBtn.addEventListener('click', () => {
    dom.portfolioDropdown.classList.remove('open');
    _openPortfolioModal();
  });

  _renderPortfolioDropdown();
}

function _renderPortfolioDropdown() {
  const portfolios = Portfolio.getPortfolios();

  // Desktop dropdown
  dom.portfolioList.innerHTML = portfolios.map(p =>
    `<button class="dropdown-item ${state.activePortfolioId === p.id ? 'active' : ''}" data-portfolio="${p.id}">${p.name} <span style="color:var(--muted);font-size:0.7rem">(${p.assetIds.length})</span></button>`
  ).join('');

  // "All Assets" active state
  dom.portfolioMenu.querySelector('[data-portfolio="all"]').classList.toggle('active', !state.activePortfolioId);

  // Mobile portfolio list
  dom.mobilePortfolioList.innerHTML =
    `<button class="mobile-menu-item ${!state.activePortfolioId ? 'active' : ''}" data-portfolio="all">All Assets</button>` +
    portfolios.map(p =>
      `<button class="mobile-menu-item ${state.activePortfolioId === p.id ? 'active' : ''}" data-portfolio="${p.id}">${p.name} (${p.assetIds.length})</button>`
    ).join('');

  // Mobile portfolio click
  dom.mobilePortfolioList.onclick = (e) => {
    const item = e.target.closest('[data-portfolio]');
    if (!item) return;
    const id = item.dataset.portfolio === 'all' ? null : item.dataset.portfolio;
    state.activePortfolioId = id;
    Portfolio.setActivePortfolio(id);
    _updatePortfolioLabel();
    _applyFilters();
    _closeMobileMenu();
  };

  _updatePortfolioLabel();
}

function _updatePortfolioLabel() {
  if (state.activePortfolioId) {
    const p = Portfolio.getActivePortfolio();
    dom.portfolioLabel.textContent = p ? p.name : 'All Assets';
  } else {
    dom.portfolioLabel.textContent = 'All Assets';
  }
}


// ─── Detail Panel ───

function _wireDetailPanel() {
  dom.detailClose.addEventListener('click', _closeDetail);

  dom.addToPortfolioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.portfolioPopover.classList.toggle('hidden');
    _renderPopoverPortfolios();
  });

  dom.popoverNewPortfolio.addEventListener('click', () => {
    const name = prompt('Portfolio name:');
    if (name && name.trim()) {
      const p = Portfolio.createPortfolio(name);
      if (state.selectedAsset) {
        Portfolio.addAsset(p.id, state.selectedAsset.id);
        _toast(`Added to "${p.name}"`, 'success');
      }
      dom.portfolioPopover.classList.add('hidden');
      _renderPortfolioDropdown();
    }
  });

  // Close popover on outside click
  document.addEventListener('click', (e) => {
    if (!dom.portfolioPopover.contains(e.target) && e.target !== dom.addToPortfolioBtn) {
      dom.portfolioPopover.classList.add('hidden');
    }
  });
}

function _showDetail(asset) {
  state.selectedAsset = asset;
  const p = dom.detailPanel;

  const logoUrl = getLogoUrl(asset);
  dom.detailImage.src = logoUrl || '';
  dom.detailImage.style.display = logoUrl ? 'block' : 'none';
  dom.detailName.textContent = asset.name;
  dom.detailSymbol.textContent = asset.symbol;
  dom.detailPrice.textContent = formatPrice(asset.price);

  const mainChange = asset['change' + state.period.replace('h','h').replace('d','d').replace('y','y')] || asset.change24h;
  dom.detailChangeMain.textContent = formatChange(mainChange);
  dom.detailChangeMain.className = 'detail-change ' + (mainChange >= 0 ? 'color-green' : 'color-red');

  dom.detailMcap.textContent = formatLargeNumber(asset.marketCap);
  dom.detailVolume.textContent = formatLargeNumber(asset.volume24h);

  _setChangeEl(dom.detail1h, asset.change1h);
  _setChangeEl(dom.detail24h, asset.change24h);
  _setChangeEl(dom.detail7d, asset.change7d);
  _setChangeEl(dom.detail30d, asset.change30d);
  _setChangeEl(dom.detail1y, asset.change1y);

  p.classList.remove('hidden');
  requestAnimationFrame(() => p.classList.add('open'));
}

function _setChangeEl(el, val) {
  el.textContent = formatChange(val);
  el.className = 'detail-stat-value ' + (val == null ? '' : val >= 0 ? 'color-green' : 'color-red');
}

function _closeDetail() {
  dom.detailPanel.classList.remove('open');
  setTimeout(() => dom.detailPanel.classList.add('hidden'), 300);
  dom.portfolioPopover.classList.add('hidden');
  state.selectedAsset = null;
}

function _renderPopoverPortfolios() {
  const portfolios = Portfolio.getPortfolios();
  const assetId = state.selectedAsset?.id;

  dom.popoverPortfolioList.innerHTML = portfolios.map(p => {
    const inPortfolio = assetId && p.assetIds.includes(assetId);
    return `<button class="dropdown-item" data-popover-portfolio="${p.id}" style="${inPortfolio ? 'color:var(--green)' : ''}">
      ${inPortfolio ? '&#10003; ' : ''}${p.name}
    </button>`;
  }).join('');

  dom.popoverPortfolioList.onclick = (e) => {
    const item = e.target.closest('[data-popover-portfolio]');
    if (!item || !assetId) return;
    const pid = item.dataset.popoverPortfolio;
    const added = Portfolio.toggleAssetInPortfolio(pid, assetId);
    const pName = Portfolio.getPortfolios().find(p => p.id === pid)?.name;
    _toast(added ? `Added to "${pName}"` : `Removed from "${pName}"`, 'success');
    _renderPopoverPortfolios();
    _renderPortfolioDropdown();
    if (state.activePortfolioId) _applyFilters();
  };
}


// ─── Settings Modal ───

function _wireSettingsModal() {
  dom.settingsBtn.addEventListener('click', () => _openModal(dom.settingsModal));
  dom.settingsClose.addEventListener('click', () => _closeModal(dom.settingsModal));
  dom.apiPromptBtn.addEventListener('click', () => _openModal(dom.settingsModal));
  dom.mobileSettingsBtn?.addEventListener('click', () => {
    _closeMobileMenu();
    _openModal(dom.settingsModal);
  });

  dom.settingsSave.addEventListener('click', () => {
    const key = dom.fmpKeyInput.value.trim();
    if (key) {
      localStorage.setItem(STORAGE.FMP_KEY, key);
    } else {
      localStorage.removeItem(STORAGE.FMP_KEY);
    }

    // Save refresh interval
    const activeRefresh = dom.settingsModal.querySelector('[data-refresh].active');
    if (activeRefresh) {
      state.refreshInterval = activeRefresh.dataset.refresh === 'off' ? 0 : parseInt(activeRefresh.dataset.refresh);
    }
    _saveSettings();

    _closeModal(dom.settingsModal);
    _toast('Settings saved', 'success');
    _fetchAndRender();
  });

  // Load saved key
  dom.fmpKeyInput.value = localStorage.getItem(STORAGE.FMP_KEY) || '';
}

function _wireRefreshPills() {
  dom.settingsModal.querySelectorAll('[data-refresh]').forEach(pill => {
    pill.addEventListener('click', () => {
      dom.settingsModal.querySelectorAll('[data-refresh]').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Theme switcher
  const themeGrid = document.getElementById('theme-grid');
  if (themeGrid) {
    themeGrid.querySelectorAll('.theme-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        themeGrid.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        _applyTheme(swatch.dataset.theme);
      });
    });
  }

  // Currency switcher
  const currencyPills = document.getElementById('currency-pills');
  if (currencyPills) {
    currencyPills.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        currencyPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.currency = pill.dataset.currency;
        localStorage.setItem('innov8-bubbles-currency', pill.dataset.currency);
        _saveSettings();
        _fetchAndRender(); // re-fetch with new currency
      });
    });
  }

  // Color scheme switcher
  const colorPills = document.getElementById('color-scheme-pills');
  if (colorPills) {
    colorPills.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        colorPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.colorScheme = pill.dataset.colors;
        setColorScheme(pill.dataset.colors);
        _saveSettings();
        _applyFilters(); // re-render bubbles with new colors
      });
    });
  }
}

function _applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-slate', 'theme-light');
  if (theme && theme !== 'midnight') {
    document.body.classList.add('theme-' + theme);
  }
  state.theme = theme || 'midnight';
}


// ─── Portfolio Modal ───

function _wirePortfolioModal() {
  dom.portfolioModalClose.addEventListener('click', () => _closeModal(dom.portfolioModal));

  dom.createPortfolioBtn.addEventListener('click', () => {
    const name = dom.newPortfolioInput.value.trim();
    if (!name) return;
    Portfolio.createPortfolio(name);
    dom.newPortfolioInput.value = '';
    _renderPortfolioManager();
    _renderPortfolioDropdown();
    _toast(`Portfolio "${name}" created`, 'success');
  });

  dom.newPortfolioInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') dom.createPortfolioBtn.click();
  });
}

function _openPortfolioModal() {
  _renderPortfolioManager();
  _openModal(dom.portfolioModal);
}

function _renderPortfolioManager() {
  const portfolios = Portfolio.getPortfolios();
  dom.portfolioManagerList.innerHTML = portfolios.map(p => `
    <div class="portfolio-manager-item" data-pid="${p.id}">
      <span class="portfolio-name">${p.name}</span>
      <span class="portfolio-count">${p.assetIds.length} assets</span>
      <button class="btn btn-danger btn-sm" data-delete="${p.id}" title="Delete">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
      </button>
    </div>
  `).join('') || '<p style="color:var(--muted);font-family:var(--font-mono);font-size:0.85rem;text-align:center;padding:var(--space-lg)">No portfolios yet</p>';

  // Delete handlers
  dom.portfolioManagerList.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      Portfolio.deletePortfolio(id);
      if (state.activePortfolioId === id) {
        state.activePortfolioId = null;
        _applyFilters();
      }
      _renderPortfolioManager();
      _renderPortfolioDropdown();
      _toast('Portfolio deleted', 'success');
    });
  });
}


// ─── Mobile Menu ───

function _wireMobileMenu() {
  dom.hamburgerBtn.addEventListener('click', () => {
    dom.mobileMenu.classList.add('open');
  });
  dom.mobileMenuClose.addEventListener('click', _closeMobileMenu);
}

function _closeMobileMenu() {
  dom.mobileMenu.classList.remove('open');
}


// ─── Modal Helpers ───

function _openModal(modal) {
  modal.classList.remove('hidden');
}

function _closeModal(modal) {
  modal.classList.add('hidden');
}

// Close modals on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
  }
});


// ─── Resize ───

function _wireResize() {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      engine.resize();
    }, 100);
  });
}


// ─── Auto Refresh ───

function _startAutoRefresh() {
  if (state.refreshTimer) clearInterval(state.refreshTimer);
  if (state.refreshInterval > 0) {
    state.refreshTimer = setInterval(() => {
      _fetchAndRender(false);
    }, state.refreshInterval * 1000);
  }
}


// ─── UI State Helpers ───

function _showLoading(show) {
  dom.loading.classList.toggle('hidden', !show);
}

function _hideStates() {
  dom.sampleBadge.classList.add('hidden');
  dom.emptyState.classList.add('hidden');
  dom.apiPrompt.classList.add('hidden');
}

function _showApiPrompt(show) {
  dom.apiPrompt.classList.toggle('hidden', !show);
}


// ─── Toast ───

function _toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  dom.toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}


// ─── Settings Persistence ───

function _loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE.SETTINGS);
    if (raw) {
      const s = JSON.parse(raw);
      state.refreshInterval = s.refreshInterval || 60;

      if (s.theme) {
        state.theme = s.theme;
        _applyTheme(s.theme);
        const themeGrid = document.getElementById('theme-grid');
        if (themeGrid) {
          themeGrid.querySelectorAll('.theme-swatch').forEach(sw => {
            sw.classList.toggle('active', sw.dataset.theme === s.theme);
          });
        }
      }

      if (s.currency) {
        state.currency = s.currency;
        const currencyPills = document.getElementById('currency-pills');
        if (currencyPills) {
          currencyPills.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('active', p.dataset.currency === s.currency);
          });
        }
      }

      if (s.colorScheme) {
        state.colorScheme = s.colorScheme;
        setColorScheme(s.colorScheme);
        const colorPills = document.getElementById('color-scheme-pills');
        if (colorPills) {
          colorPills.querySelectorAll('.pill').forEach(p => {
            p.classList.toggle('active', p.dataset.colors === s.colorScheme);
          });
        }
      }
    }
  } catch (e) { /* ignore */ }
}

function _saveSettings() {
  localStorage.setItem(STORAGE.SETTINGS, JSON.stringify({
    refreshInterval: state.refreshInterval,
    theme: state.theme,
    currency: state.currency,
    colorScheme: state.colorScheme,
  }));
}


// ─── View Toggle (Bubble / Table) ───

function _wireViewToggle() {
  dom.viewBubbles.addEventListener('click', () => _setViewMode('bubble'));
  dom.viewTable.addEventListener('click', () => _setViewMode('table'));

  // Table header sort
  dom.assetTable.querySelector('thead').addEventListener('click', (e) => {
    const th = e.target.closest('th.sortable');
    if (!th) return;
    const col = th.dataset.sort;
    if (state.sortBy === col) {
      state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      state.sortBy = col;
      state.sortDir = col === 'name' ? 'asc' : 'desc';
    }
    _renderTable();
  });
}

function _setViewMode(mode) {
  state.viewMode = mode;
  dom.viewBubbles.classList.toggle('active', mode === 'bubble');
  dom.viewTable.classList.toggle('active', mode === 'table');

  // Show/hide views
  dom.canvas.style.display = mode === 'bubble' ? 'block' : 'none';
  document.querySelector('.hero-glow').style.display = mode === 'bubble' ? 'block' : 'none';
  dom.tableView.classList.toggle('hidden', mode !== 'table');

  // Render
  if (mode === 'table') {
    _renderTable();
  } else {
    engine.resize();
    engine.setBubbles(state.filteredAssets, state.period);
  }
}

function _renderTable() {
  const assets = _getSortedAssets();
  const activePeriod = state.period; // e.g. '1h', '24h', '7d', '30d', '1y'

  // Map period key to the data field name
  const periodToField = { '1h': 'change1h', '24h': 'change24h', '7d': 'change7d', '30d': 'change30d', '1y': 'change1y' };
  const activeField = periodToField[activePeriod] || 'change24h';

  // Update sort indicators and active period highlight in header
  dom.assetTable.querySelectorAll('th.sortable').forEach(th => {
    th.classList.remove('sorted', 'asc', 'desc', 'col-active');
    if (th.dataset.sort === state.sortBy) {
      th.classList.add('sorted', state.sortDir);
    }
    if (th.dataset.sort === activeField) {
      th.classList.add('col-active');
    }
  });

  // Helper: format change with arrow
  const fmtChange = (val, field) => {
    if (val == null || isNaN(val)) return '<span class="table-change table-change-neutral">—</span>';
    const cls = val >= 0 ? 'table-change-pos' : 'table-change-neg';
    const arrow = val >= 0 ? '&#9650;' : '&#9660;';
    const pct = Math.abs(val).toFixed(2);
    return `<span class="table-change ${cls}"><span class="table-arrow">${arrow}</span>${pct}%</span>`;
  };

  // Check which assets are in the active portfolio (for star)
  const activePortfolio = Portfolio.getActivePortfolio();
  const starredIds = new Set(activePortfolio ? activePortfolio.assetIds : []);

  // Helper: mark the active period column cell
  const activeClass = (field) => field === activeField ? 'col-active-cell' : '';

  dom.assetTableBody.innerHTML = assets.map((a, i) => {
    const logo = getLogoUrl(a);
    const starred = starredIds.has(a.id);

    return `<tr data-asset-id="${a.id}">
      <td class="table-star ${starred ? 'active' : ''}" data-star="${a.id}">&#9734;</td>
      <td class="col-rank">${i + 1}</td>
      <td class="col-name">
        <div class="table-name-cell">
          ${logo ? `<img class="table-logo" src="${logo}" alt="" loading="lazy" onerror="this.style.display='none'">` : '<div class="table-logo"></div>'}
          <div class="table-name-text">
            <span class="table-fullname">${a.name}</span>
            <span class="table-symbol">${a.symbol}</span>
          </div>
        </div>
      </td>
      <td class="table-price">${formatPrice(a.price)}</td>
      <td class="${activeClass('change1h')}">${fmtChange(a.change1h, 'change1h')}</td>
      <td class="${activeClass('change24h')}">${fmtChange(a.change24h, 'change24h')}</td>
      <td class="${activeClass('change7d')}">${fmtChange(a.change7d, 'change7d')}</td>
      <td class="col-hide-mobile ${activeClass('change30d')}">${fmtChange(a.change30d, 'change30d')}</td>
      <td class="col-hide-mobile ${activeClass('change1y')}">${fmtChange(a.change1y, 'change1y')}</td>
      <td class="table-mcap">${formatLargeNumber(a.marketCap)}</td>
      <td class="table-volume col-hide-mobile">${formatLargeNumber(a.volume24h)}</td>
    </tr>`;
  }).join('');

  // Star click → add/remove from portfolio
  dom.assetTableBody.querySelectorAll('.table-star').forEach(star => {
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      const assetId = star.dataset.star;
      const portfolios = Portfolio.getPortfolios();
      if (portfolios.length === 0) {
        // Auto-create a "Favourites" portfolio
        const p = Portfolio.createPortfolio('Favourites');
        Portfolio.addAsset(p.id, assetId);
        _toast('Added to Favourites', 'success');
      } else {
        // Toggle in first portfolio
        const added = Portfolio.toggleAssetInPortfolio(portfolios[0].id, assetId);
        _toast(added ? 'Added to ' + portfolios[0].name : 'Removed from ' + portfolios[0].name, 'success');
      }
      _renderPortfolioDropdown();
      _renderTable();
    });
  });

  // Row click → detail panel
  dom.assetTableBody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const asset = state.filteredAssets.find(a => a.id === row.dataset.assetId);
      if (asset) _showDetail(asset);
    });
  });
}

function _getSortedAssets() {
  const assets = [...state.filteredAssets];
  const { sortBy, sortDir } = state;
  const dir = sortDir === 'asc' ? 1 : -1;

  assets.sort((a, b) => {
    let va = a[sortBy];
    let vb = b[sortBy];

    // Handle nulls
    if (va == null) va = sortDir === 'asc' ? Infinity : -Infinity;
    if (vb == null) vb = sortDir === 'asc' ? Infinity : -Infinity;

    // String comparison for name
    if (sortBy === 'name') {
      return dir * String(va).localeCompare(String(vb));
    }

    return dir * (va - vb);
  });

  return assets;
}


// ─── Footer Stats ───

function _updateFooterStats() {
  const assets = state.allAssets;
  if (!assets.length) return;

  const count = assets.length;
  const totalMcap = assets.reduce((sum, a) => sum + (a.marketCap || 0), 0);
  const totalVolume = assets.reduce((sum, a) => sum + (a.volume24h || 0), 0);

  // BTC dominance
  const btc = assets.find(a => a.symbol === 'BTC' || a.id === 'bitcoin');
  const btcDom = btc && totalMcap > 0 ? ((btc.marketCap / totalMcap) * 100).toFixed(1) + '%' : '—';

  const $count = document.getElementById('stats-count');
  const $mcap = document.getElementById('stats-mcap');
  const $volume = document.getElementById('stats-volume');
  const $btcDom = document.getElementById('stats-btc-dom');

  if ($count) $count.textContent = count;
  if ($mcap) $mcap.textContent = formatLargeNumber(totalMcap);
  if ($volume) $volume.textContent = formatLargeNumber(totalVolume);
  if ($btcDom) $btcDom.textContent = btcDom;
}


// ─── Share Button ───

function _wireShareButton() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const url = window.location.href;
    const title = 'Innov8 Bubbles — ' + (state.assetClass === 'all' ? 'All Assets' : state.assetClass);

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) { /* user cancelled */ }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        _toast('Link copied to clipboard', 'success');
      } catch (e) {
        _toast('Could not copy link', 'error');
      }
    }
  });
}


// ─── Keyboard Shortcuts ───

function _wireKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    // Ignore if modal is open
    if (document.querySelector('.modal-overlay:not(.hidden)')) return;

    switch (e.key) {
      case '1': _switchAssetClass('all'); break;
      case '2': _switchAssetClass('crypto'); break;
      case '3': _switchAssetClass('indices'); break;
      case '4': _switchAssetClass('stocks'); break;
      case '5': _switchAssetClass('commodities'); break;
      case '6': _switchAssetClass('realestate'); break;
      case 'b': case 'B': _setViewMode('bubble'); break;
      case 't': case 'T': _setViewMode('table'); break;
      case '/': e.preventDefault(); dom.searchInput.focus(); break;
      case 'Escape': _closeDetail(); break;
    }
  });
}

function _switchAssetClass(cls) {
  state.assetClass = cls;
  _syncPills('class', cls);
  _closeDetail();
  _fetchAndRender();
}


// ─── Security: Input Sanitisation ───

function _sanitize(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


// ─── Performance: Background Throttle ───

function _wireVisibilityThrottle() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Slow down to ~10fps when tab is hidden
      if (engine) engine.stop();
    } else {
      // Resume full speed
      if (engine) engine.start();
    }
  });
}


// ─── Auth Modal ───

function _wireAuthModal() {
  dom.signinBtn.addEventListener('click', () => {
    _showAuthTab('signin');
    _openModal(dom.authModal);
  });

  dom.authClose.addEventListener('click', () => _closeModal(dom.authModal));

  // Tab switching
  dom.authModal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      _showAuthTab(tab.dataset.authTab);
    });
  });

  // Google sign-in
  dom.googleSigninBtn.addEventListener('click', async () => {
    try {
      _hideAuthError();
      await signInWithGoogle();
      _closeModal(dom.authModal);
      _toast('Signed in with Google', 'success');
    } catch (e) {
      _showAuthError(e.message);
    }
  });

  // Email sign-in
  dom.signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#signin-email').value.trim();
    const pass = $('#signin-password').value;
    try {
      _hideAuthError();
      await signInWithEmail(email, pass);
      _closeModal(dom.authModal);
      _toast('Signed in successfully', 'success');
    } catch (e) {
      _showAuthError(_friendlyAuthError(e.code));
    }
  });

  // Email sign-up
  dom.signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#signup-name').value.trim();
    const email = $('#signup-email').value.trim();
    const pass = $('#signup-password').value;
    const confirm = $('#signup-confirm').value;

    if (pass !== confirm) {
      _showAuthError('Passwords do not match');
      return;
    }

    try {
      _hideAuthError();
      await signUpWithEmail(email, pass, name);
      _closeModal(dom.authModal);
      _toast('Account created!', 'success');
    } catch (e) {
      _showAuthError(_friendlyAuthError(e.code));
    }
  });
}

function _showAuthTab(tab) {
  dom.authModal.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.authTab === tab));
  dom.signinForm.classList.toggle('hidden', tab !== 'signin');
  dom.signupForm.classList.toggle('hidden', tab !== 'signup');
  dom.authModalTitle.textContent = tab === 'signin' ? 'Sign In' : 'Sign Up';
  _hideAuthError();
}

function _showAuthError(msg) {
  dom.authError.textContent = msg;
  dom.authError.classList.remove('hidden');
}

function _hideAuthError() {
  dom.authError.classList.add('hidden');
}

function _friendlyAuthError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
  };
  return map[code] || 'Authentication failed. Please try again.';
}


// ─── User Menu ───

function _wireUserMenu() {
  dom.userAvatarBtn.addEventListener('click', () => {
    dom.userMenu.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!dom.userMenu.contains(e.target)) {
      dom.userMenu.classList.remove('open');
    }
  });

  dom.userManagePortfolios.addEventListener('click', () => {
    dom.userMenu.classList.remove('open');
    _openPortfolioModal();
  });

  dom.userPlaceAd.addEventListener('click', () => {
    dom.userMenu.classList.remove('open');
    if (!isSignedIn()) {
      _toast('Please sign in to place an ad', 'error');
      _openModal(dom.authModal);
      return;
    }
    _openAdModal();
  });

  dom.userSignout.addEventListener('click', async () => {
    dom.userMenu.classList.remove('open');
    try {
      await firebaseSignOut();
      Portfolio.setLocalMode();
      _toast('Signed out', 'success');
    } catch (e) {
      _toast('Sign out failed', 'error');
    }
  });
}

function _handleAuthStateChange(user) {
  if (user) {
    // Signed in
    dom.signinBtn.classList.add('hidden');
    dom.userMenu.classList.remove('hidden');
    dom.userAvatar.textContent = getUserInitial();
    dom.userMenuName.textContent = user.displayName || '';
    dom.userMenuEmail.textContent = user.email || '';

    // Sync portfolios to cloud
    const localPortfolios = Portfolio.getPortfolios();
    syncLocalPortfoliosToCloud(localPortfolios).then(() => {
      return loadPortfoliosFromCloud();
    }).then(cloudPortfolios => {
      if (cloudPortfolios) {
        Portfolio.setCloudMode(user.uid, cloudPortfolios);
        state.activePortfolioId = Portfolio.getActivePortfolioId();
        _renderPortfolioDropdown();
        _applyFilters();
      }
    }).catch(e => {
      console.warn('[app] Portfolio cloud sync failed:', e.message);
    });
  } else {
    // Signed out
    dom.signinBtn.classList.remove('hidden');
    dom.userMenu.classList.add('hidden');
    dom.userMenu.classList.remove('open');
    Portfolio.setLocalMode();
    _renderPortfolioDropdown();
  }
}


// ─── Ad Placement Modal ───

let _adState = { step: 1, durationIndex: 0 };

function _wireAdModal() {
  dom.adClose.addEventListener('click', () => _closeModal(dom.adModal));

  // Step 1 → 2
  $('#ad-next-1').addEventListener('click', () => {
    if (!dom.adName.value.trim() || !dom.adText.value.trim()) {
      _toast('Please fill in the ad name and description', 'error');
      return;
    }
    _adGoToStep(2);
  });

  // Step 2 → 3
  $('#ad-next-2').addEventListener('click', () => _adGoToStep(3));
  $('#ad-back-2').addEventListener('click', () => _adGoToStep(1));
  $('#ad-back-3').addEventListener('click', () => _adGoToStep(2));

  // Pay button
  dom.adPayBtn.addEventListener('click', async () => {
    dom.adPayBtn.disabled = true;
    dom.adPayBtn.textContent = 'Uploading...';
    try {
      // Upload logo first if provided
      let logoUrl = null;
      if (_adState.logoFile) {
        logoUrl = await uploadAdLogo(_adState.logoFile);
      }
      const adData = _getAdFormData();
      adData.logoUrl = logoUrl;
      dom.adPayBtn.textContent = 'Redirecting to payment...';
      await submitAndPay(adData, _adState.durationIndex);
      _closeModal(dom.adModal);
      _toast('Ad submitted successfully!', 'success');
      _initTicker();
    } catch (e) {
      _toast(e.message || 'Payment failed', 'error');
    } finally {
      dom.adPayBtn.disabled = false;
      dom.adPayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> Pay & Submit';
    }
  });
}

function _openAdModal() {
  _adState.step = 1;
  _adState.durationIndex = 0;
  _adState.logoFile = null;
  _adState.logoUrl = null;

  // Reset form
  dom.adBadgeSelect.value = 'new-drop';
  dom.adName.value = '';
  dom.adText.value = '';
  dom.adUrl.value = '';

  // Reset logo upload
  const logoPreview = document.getElementById('ad-logo-preview');
  const logoInput = document.getElementById('ad-logo-input');
  logoPreview.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>Click to upload</span>';
  logoPreview.classList.remove('has-image');
  logoInput.value = '';

  // Wire logo upload click
  document.getElementById('ad-logo-upload').onclick = () => logoInput.click();
  logoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) { _toast('Logo must be under 200KB', 'error'); return; }
    _adState.logoFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      logoPreview.innerHTML = `<img src="${ev.target.result}" alt="Logo preview">`;
      logoPreview.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  };

  // Render duration cards
  dom.adDurationGrid.innerHTML = STRIPE_CONFIG.prices.map((p, i) =>
    `<div class="ad-duration-card ${i === 0 ? 'selected' : ''}" data-duration="${i}">
      <span class="duration-days">${p.label}</span>
      <span class="duration-price">${p.price}</span>
    </div>`
  ).join('');

  // Duration card click
  dom.adDurationGrid.querySelectorAll('.ad-duration-card').forEach(card => {
    card.addEventListener('click', () => {
      dom.adDurationGrid.querySelectorAll('.ad-duration-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      _adState.durationIndex = parseInt(card.dataset.duration);
    });
  });

  _adGoToStep(1);
  _openModal(dom.adModal);
}

function _adGoToStep(step) {
  _adState.step = step;

  // Update step indicators
  dom.adModal.querySelectorAll('.ad-step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.classList.toggle('active', sn === step);
    s.classList.toggle('done', sn < step);
  });

  // Show/hide step content
  for (let i = 1; i <= 3; i++) {
    const el = $(`#ad-step-${i}`);
    if (el) el.classList.toggle('hidden', i !== step);
  }

  // Step 3: render preview
  if (step === 3) {
    const adData = _getAdFormData();
    dom.adPreviewStrip.innerHTML = generateAdPreviewHTML(adData);
    const dur = STRIPE_CONFIG.prices[_adState.durationIndex];
    dom.adSummary.innerHTML = `<strong>${dur.label}</strong> — ${dur.price} — Your ad will run for ${dur.days} days`;
  }
}

function _getAdFormData() {
  const badgeValue = dom.adBadgeSelect.value;
  const badge = AD_BADGE_TYPES.find(b => b.value === badgeValue) || AD_BADGE_TYPES[0];
  return {
    badge: badge.value,
    badgeText: badge.badgeText,
    name: dom.adName.value.trim(),
    text: dom.adText.value.trim(),
    url: dom.adUrl.value.trim() || '#',
  };
}
