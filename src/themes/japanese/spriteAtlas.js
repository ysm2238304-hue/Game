// ============================================================
// 🎨 src/themes/japanese/spriteAtlas.js — 料理精靈圖（載入 PNG + 強制破除快取版）
// ============================================================

import { ITEM_DEFS } from './items.js';

// 強制快取破除版號，確保手機端與電腦端立即載入最新超商圖示
const ASSET_VER = 'v=20261109_carrefour_autocrop_v1';

const FOOD_IMAGES = {
  onigiri:    `./assets/food/onigiri.png?${ASSET_VER}`,
  sushi:      `./assets/food/sushi.png?${ASSET_VER}`,
  ramen:      `./assets/food/ramen.png?${ASSET_VER}`,
  tamagoyaki: `./assets/food/tamagoyaki.png?${ASSET_VER}`,
  takoyaki:   `./assets/food/takoyaki.png?${ASSET_VER}`,
  yakitori:   `./assets/food/yakitori.png?${ASSET_VER}`,
  inari:      `./assets/food/inari.png?${ASSET_VER}`,
  ikura:      `./assets/food/ikura.png?${ASSET_VER}`,
  daifuku:    `./assets/food/daifuku.png?${ASSET_VER}`,
  pudding:    `./assets/food/pudding.png?${ASSET_VER}`
};

export const SPRITE_RES = 140;
export const SPRITE_DPR = 2;

export const FoodSpriteAtlas = {
  cache: {}, sparkleCache: {}, initialized: false,

  async init() {
    if (this.initialized) return;
    const entries = Object.entries(FOOD_IMAGES);
    await Promise.all(entries.map(([id, src]) =>
      new Promise(resolve => {
        const img = new Image();
        img.onload = () => { this.cache[id] = img; resolve(); };
        img.onerror = () => {
          console.warn('⚠️ 缺圖:', id, src);
          resolve();
        };
        img.src = src;
      })
    ));
    this.initialized = true;
  },

  getSparkle(color) {
    if (this.sparkleCache[color]) return this.sparkleCache[color];
    const SIZE = 16;
    const cvs = document.createElement('canvas');
    cvs.width = SIZE * 2; cvs.height = SIZE * 2;
    const ctx = cvs.getContext('2d');
    ctx.scale(2, 2);
    ctx.translate(SIZE / 2, SIZE / 2);
    const r = 6;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#D4A359';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(r * 0.85, -r * 0.85, 1.5, 0, Math.PI * 2);
    ctx.fill();
    this.sparkleCache[color] = { cvs, halfLogic: SIZE / 2, radius: r };
    return this.sparkleCache[color];
  }
};
