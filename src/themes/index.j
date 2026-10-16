// ============================================================
// 🎯 src/themes/index.js — 主題管理器
// ============================================================

import { japanese } from './japanese/index.js';

const THEMES = {
  japanese
};

let activeThemeId = 'japanese';

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
