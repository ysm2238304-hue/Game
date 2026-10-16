// ============================================================
// 🎯 src/themes/index.js — 主題管理器
// ============================================================
//
// 職責：
//   1. 註冊所有主題
//   2. 提供「當前主題」讀取
//   3. 提供「切換主題」介面
//
// 之後加新主題：import 進來，放進 THEMES
// ============================================================

import { japanese } from './japanese/index.js';

const THEMES = {
  japanese
  // 之後加：taiwan, french, fantasy...
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
