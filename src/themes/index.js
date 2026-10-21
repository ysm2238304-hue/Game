// ============================================================
// 🎯 src/themes/index.js — 主題管理器 (純日式版)
// ============================================================

import { japanese } from './japanese/index.js';

const THEMES = {
  japanese
};

// 固定為日式主題
let activeThemeId = 'japanese';

export function getActiveTheme() {
  return THEMES[activeThemeId];
}

export function getActiveThemeId() {
  return activeThemeId;
}

// 保留空函數以防其他地方報錯
export function setActiveTheme(id) {
  return false; 
}

export function getAllThemes() {
  return Object.values(THEMES);
}

export function getThemeById(id) {
  return THEMES[id] || null;
}
