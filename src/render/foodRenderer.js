// ============================================================
// 🎨 src/render/foodRenderer.js — 料理渲染器（含快取查詢與多主題相容保護）
// ============================================================

import { getActiveTheme } from '../themes/index.js';

let cachedAtlas = null;
let cachedFallbackKey = null;

function getSpriteFromAtlas(typeId) {
  if (!cachedAtlas) {
    const theme = getActiveTheme();
    cachedAtlas = theme?.spriteAtlas || null;
  }
  const cache = cachedAtlas?.cache;
  if (!cache) return null;

  if (cache[typeId]) return cache[typeId];
  if (cache.onigiri) return cache.onigiri;

  // 若切換至其他主題（例如夜市主題沒有 onigiri），自動取用第一個可用圖示防止空白
  if (!cachedFallbackKey || !cache[cachedFallbackKey]) {
    const keys = Object.keys(cache);
    cachedFallbackKey = keys.length > 0 ? keys[0] : null;
  }
  return cachedFallbackKey ? cache[cachedFallbackKey] : null;
}

export class CozyFoodRenderer {
  static drawIceOverlay(ctx, size, hp) {
    ctx.save();
    ctx.fillStyle = hp >= 2 ? 'rgba(168,230,207,0.65)' : 'rgba(224,244,255,0.55)';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 2;
    const box = size * 0.82;
    ctx.beginPath();
    ctx.roundRect(-box / 2, -box / 2, box, box, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath();
    ctx.roundRect(-16, -box / 2 - 4, 32, 13, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4A3326';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❄️×' + hp, 0, -box / 2 + 5.5);
    ctx.restore();
  }

  static drawFood(ctx, typeId, cx, cy, w, h, opts = {}) {
    const sprite = getSpriteFromAtlas(typeId);
    if (!sprite) return;

    const isBack = Boolean(opts.isBack);
    const scaleX = opts.scaleX || 1;
    const scaleY = opts.scaleY || 1;
    const lift = opts.lift || 0;
    const iceHp = opts.iceHp || 0;
    
    // 放大圖示：將原本的 1.14 與 0.92 改為 1.45 與 1.15
    const baseSize = Math.min(w * 1.45, h * 1.15);

    ctx.save();
    ctx.translate(cx, cy);

    if (isBack) {
      ctx.scale(0.75, 0.75);
      ctx.globalAlpha = 0.52;
    } else {
      const shadowScale = Math.max(0.5, 1 - lift * 0.015);
      ctx.beginPath();
      ctx.ellipse(
        0,
        baseSize * 0.34 + lift * 0.3,
        baseSize * 0.34 * shadowScale,
        baseSize * 0.09 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(74,51,38,0.22)';
      ctx.fill();
    }

    ctx.translate(0, -lift);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(sprite, -baseSize / 2, -baseSize / 2, baseSize, baseSize);

    if (iceHp > 0 && !isBack) {
      this.drawIceOverlay(ctx, baseSize, iceHp);
    }
    ctx.restore();
  }

}
