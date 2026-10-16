// ============================================================
// 🎯 src/themes/index.js — 主題管理器
// ============================================================

import { japanese } from './japanese/index.js';
import { taiwan } from './taiwan/index.js';

const THEMES = {
  japanese,
  taiwan
};

const urlParams = new URLSearchParams(window.location.search);
const urlTheme = urlParams.get('theme');
const savedTheme = localStorage.getItem('activeTheme');

let activeThemeId =
  (urlTheme && THEMES[urlTheme]) ? urlTheme :
  (savedTheme && THEMES[savedTheme]) ? savedTheme :
  'japanese';

if (urlTheme && THEMES[urlTheme]) {
  localStorage.setItem('activeTheme', urlTheme);
}

export function getActiveTheme() {
  return THEMES[activeThemeId];
}

export function getActiveThemeId() {
  return activeThemeId;
}

export function setActiveTheme(id) {
  if (THEMES[id]) {
    activeThemeId = id;
    localStorage.setItem('activeTheme', id);
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
