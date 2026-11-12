// ============================================================
// 🎨 src/render/foodRenderer.js — 料理渲染器（家樂福風格：等比例最大化 + 零重疊）
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

  if (!cachedFallbackKey || !cache[cachedFallbackKey]) {
    const keys = Object.keys(cache);
    cachedFallbackKey = keys.length > 0 ? keys[0] : null;
  }
  return cachedFallbackKey ? cache[cachedFallbackKey] : null;
}

export class CozyFoodRenderer {
  static drawIceOverlay(ctx, drawW, drawH, hp) {
    ctx.save();
    ctx.fillStyle = hp >= 2 ? 'rgba(168,230,207,0.65)' : 'rgba(224,244,255,0.55)';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 2;
    const boxW = drawW * 0.92;
    const boxH = drawH * 0.92;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath();
    ctx.roundRect(-15, -boxH / 2 - 4, 30, 12, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#4A3326';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('❄️×' + hp, 0, -boxH / 2 + 5);
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

    // 🌟 家樂福等比例最大化算法：
    // slotW 限制最大寬度防止相鄰槽位重疊，slotH 提供充足垂直縱深
    const slotW = Math.max(34, w);
    const slotH = Math.max(60, h);
    
    const maxW = Math.round(slotW * 0.98);
    const maxH = Math.round(slotH * 0.88);

    const imgRatio = (sprite.width || 1) / (sprite.height || 1);
    let drawW, drawH;

    if (imgRatio >= 1) {
      // 橫向商品（漢堡、披薩、甜甜圈）：寬度填滿槽位，高度等比例縮放
      drawW = maxW;
      drawH = Math.round(maxW / imgRatio);
    } else {
      // 直向商品（飲料、冰淇淋、串燒、奶茶）：高度拉長至極致，寬度不超過槽位
      drawH = Math.min(maxH, Math.round(maxW / imgRatio));
      drawW = Math.round(drawH * imgRatio);
      if (drawW > maxW) {
        drawW = maxW;
        drawH = Math.round(maxW / imgRatio);
      }
    }

    ctx.save();
    ctx.translate(cx, cy);

    if (isBack) {
      // 後排商品：縮小 20%，微露在後方，半透明帶出立體景深
      ctx.scale(0.80, 0.80);
      ctx.globalAlpha = 0.52;
    } else {
      // 前排商品：底部接觸陰影
      const shadowScale = Math.max(0.4, 1 - lift * 0.015);
      ctx.beginPath();
      ctx.ellipse(
        0,
        drawH * 0.48 + lift * 0.25,
        drawW * 0.44 * shadowScale,
        Math.max(3, drawW * 0.12 * shadowScale),
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(25, 12, 6, 0.26)';
      ctx.fill();
    }

    ctx.translate(0, -lift);
    ctx.scale(scaleX, scaleY);

    ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);

    if (iceHp > 0 && !isBack) {
      this.drawIceOverlay(ctx, drawW, drawH, iceHp);
    }
    ctx.restore();
  }
}
