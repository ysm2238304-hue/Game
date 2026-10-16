// ============================================================
// 🎨 src/themes/japanese/spriteAtlas.js — 料理精靈圖（載入 PNG）
// ============================================================

import { ITEM_DEFS } from './items.js';

const FOOD_IMAGES = {
  onigiri:    './assets/food/onigiri.png',
  sushi:      './assets/food/sushi.png',
  ramen:      './assets/food/ramen.png',
  tamagoyaki: './assets/food/tamagoyaki.png',
  takoyaki:   './assets/food/takoyaki.png',
  yakitori:   './assets/food/yakitori.png',
  inari:      './assets/food/inari.png',
  ikura:      './assets/food/ikura.png',
  daifuku:    './assets/food/daifuku.png',
  pudding:    './assets/food/pudding.png'
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
