/* ============================================================
   portfolio.js — LocalStorage + Firestore-backed watchlist CRUD
   ============================================================ */

import { STORAGE } from './config.js';
import { savePortfolioToCloud, deletePortfolioFromCloud } from './auth.js';

// ─── Cloud mode state ───
let _cloudMode = false;
let _cloudUid = null;

// ─── Internal ───

function _load() {
  try {
    const raw = localStorage.getItem(STORAGE.PORTFOLIOS);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return { portfolios: [], activePortfolioId: null };
}

function _save(state) {
  localStorage.setItem(STORAGE.PORTFOLIOS, JSON.stringify(state));
}

function _uuid() {
  return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// ─── Cloud Mode Control ───

export function setCloudMode(uid, cloudPortfolios) {
  _cloudMode = true;
  _cloudUid = uid;

  // Replace local with cloud data
  if (cloudPortfolios) {
    const state = _load();
    state.portfolios = cloudPortfolios;
    _save(state);
  }
}

export function setLocalMode() {
  _cloudMode = false;
  _cloudUid = null;
}

export function isCloudMode() {
  return _cloudMode;
}

// ─── Cloud Sync Helper ───

function _syncToCloud(portfolio) {
  if (_cloudMode) {
    savePortfolioToCloud(portfolio).catch(e => {
      console.warn('[portfolio] cloud sync failed:', e.message);
    });
  }
}

function _deleteFromCloud(portfolioId) {
  if (_cloudMode) {
    deletePortfolioFromCloud(portfolioId).catch(e => {
      console.warn('[portfolio] cloud delete failed:', e.message);
    });
  }
}

// ─── Public API ───

export function getPortfolios() {
  return _load().portfolios;
}

export function getActivePortfolioId() {
  return _load().activePortfolioId;
}

export function getActivePortfolio() {
  const state = _load();
  if (!state.activePortfolioId) return null;
  return state.portfolios.find(p => p.id === state.activePortfolioId) || null;
}

export function setActivePortfolio(id) {
  const state = _load();
  state.activePortfolioId = id || null;
  _save(state);
}

export function createPortfolio(name) {
  const state = _load();
  const portfolio = {
    id: _uuid(),
    name: name.trim() || 'My Portfolio',
    assetIds: [],
    createdAt: Date.now(),
  };
  state.portfolios.push(portfolio);
  _save(state);
  _syncToCloud(portfolio);
  return portfolio;
}

export function deletePortfolio(id) {
  const state = _load();
  state.portfolios = state.portfolios.filter(p => p.id !== id);
  if (state.activePortfolioId === id) state.activePortfolioId = null;
  _save(state);
  _deleteFromCloud(id);
}

export function renamePortfolio(id, name) {
  const state = _load();
  const p = state.portfolios.find(p => p.id === id);
  if (p) {
    p.name = name.trim();
    _save(state);
    _syncToCloud(p);
  }
}

export function addAsset(portfolioId, assetId) {
  const state = _load();
  const p = state.portfolios.find(p => p.id === portfolioId);
  if (p && !p.assetIds.includes(assetId)) {
    p.assetIds.push(assetId);
    _save(state);
    _syncToCloud(p);
  }
}

export function removeAsset(portfolioId, assetId) {
  const state = _load();
  const p = state.portfolios.find(p => p.id === portfolioId);
  if (p) {
    p.assetIds = p.assetIds.filter(id => id !== assetId);
    _save(state);
    _syncToCloud(p);
  }
}

export function isAssetInPortfolio(portfolioId, assetId) {
  const state = _load();
  const p = state.portfolios.find(p => p.id === portfolioId);
  return p ? p.assetIds.includes(assetId) : false;
}

export function toggleAssetInPortfolio(portfolioId, assetId) {
  if (isAssetInPortfolio(portfolioId, assetId)) {
    removeAsset(portfolioId, assetId);
    return false;
  } else {
    addAsset(portfolioId, assetId);
    return true;
  }
}
