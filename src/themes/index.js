// ============================================================
// 🎯 src/themes/index.js — 主題管理器
// ============================================================

import { japanese } from './japanese/index.js';
import { taiwan } from './taiwan/index.js';

const THEMES = {
  japanese,
  taiwan
};

// 從 URL ?theme=taiwan 讀取，沒指定就用 japanese
const urlParams = new URLSearchParams(window.location.search);
const urlTheme = urlParams.get('theme');
let activeThemeId = (urlTheme && THEMES[urlTheme]) ? urlTheme : 'japanese';

export function getActiveTheme() {
  return THEMES[activeThemeId];
}

export function setActiveTheme(id) {
  if (THEMES[id]) {
    activeThemeId = id;
    return true;
  }
  return false;
}

export function getAllThemes() {
  return Object.values(THEMES);
}

export function getThemeById(id) {
  return THEMES[id] || null;
}

export function getActiveThemeId() {
  return activeThemeId;
}
