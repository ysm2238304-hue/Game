// ============================================================
// 🎨 src/render/foodRenderer.js — 料理渲染器
// ============================================================
//
// 職責：將精靈圖畫到任意 canvas 上（含陰影、冰霜、翻轉）
//
// 對外提供：
//   - CozyFoodRenderer
//     · drawIceOverlay  畫冰霜疊圖
//     · drawFood        畫料理（主要入口）
//
// 依賴：
//   - ./spriteAtlas.js（FoodSpriteAtlas）
//
// 修改須知：
//   ✅ 改料理大小     → 改 baseSize 的計算式
//   ✅ 改陰影濃度     → 改 shadow fillStyle 的 alpha
//   ✅ 改冰霜外觀     → 改 drawIceOverlay
//
// 常見修改場景：
//   1. 料理太大/太小   → 改 baseSize 的 1.14 / 0.92 係數
//   2. 陰影更明顯     → 改 rgba(74,51,38,0.22) 的 0.22
// ============================================================

import { getActiveTheme } from '../themes/index.js';

export class CozyFoodRenderer {
  static drawIceOverlay(ctx, size, hp) {
    ctx.save();
    ctx.fillStyle = hp >= 2 ? 'rgba(168,230,207,0.65)' : 'rgba(224,244,255,0.55)';
    ctx.strokeStyle = '#4A3326'; ctx.lineWidth = 2;
    const box = size * 0.82;
    ctx.beginPath(); ctx.roundRect(-box/2, -box/2, box, box, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath(); ctx.roundRect(-16, -box/2 - 4, 32, 13, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4A3326';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`❄️×${hp}`, 0, -box/2 + 5.5);
    ctx.restore();
  }
  static drawFood(ctx, typeId, cx, cy, w, h, opts = {}) {
    FoodSpriteAtlas.init();
    const { isBack = false, scaleX = 1, scaleY = 1, lift = 0, iceHp = 0 } = opts;
    const sprite = FoodSpriteAtlas.cache[typeId] || FoodSpriteAtlas.cache['onigiri'];
    const baseSize = Math.min(w * 1.14, h * 0.92);
    ctx.save();
    ctx.translate(cx, cy);
    if (isBack) {
      ctx.scale(0.75, 0.75);
      ctx.globalAlpha = 0.52;
    } else {
      const shadowScale = Math.max(0.5, 1 - lift * 0.015);
      ctx.beginPath();
      ctx.ellipse(0, baseSize * 0.34 + lift * 0.3, baseSize * 0.34 * shadowScale, baseSize * 0.09 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74,51,38,0.22)';
      ctx.fill();
    }
    ctx.translate(0, -lift);
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(sprite, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
    if (iceHp > 0 && !isBack) this.drawIceOverlay(ctx, baseSize, iceHp);
    ctx.restore();
  }
}
