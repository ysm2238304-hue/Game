// ============================================================
// 🎨 src/render/spriteAtlas.js — 料理精靈圖烘焙
// ============================================================
//
// 職責：預先將 20 款料理繪製成離屏 canvas，遊戲中直接 drawImage
//
// 對外提供：
//   - SPRITE_RES / SPRITE_DPR  常數
//   - FoodSpriteAtlas          物件（init / getSparkle / 繪圖工具）
//
// 依賴：
//   - ../config/items.js（ITEM_DEFS）
//
// 修改須知：
//   ⚠️ 改料理畫法 → 找對應的 case 'xxx'
//   ⚠️ 加新料理   → items.js 加資料 + 這裡加 case
//   ✅ 改顏色     → 直接改 hex
//   ✅ 改大小     → 改 SPRITE_RES（影響全部料理）
//
// 常見修改場景：
//   1. 御飯糰換配色     → case 'onigiri' 內的 fillStyle
//   2. 加新料理         → 複製 case 改內容
//   3. 全部料理更大     → 改 SPRITE_RES = 160
//
// 內部工具方法（被各 case 使用）：
//   - drawFluffyRice     畫蓬鬆米飯
//   - drawKawaiiSparkle  畫閃亮星星
//   - drawJellyGloss     畫果凍光澤
// ============================================================

import { ITEM_DEFS } from '../config/items.js';

export const SPRITE_RES = 140;
export const SPRITE_DPR = 2;

export const FoodSpriteAtlas = {
  cache: {}, sparkleCache: {}, initialized: false,
  init() {
    if (this.initialized) return;
    ITEM_DEFS.forEach(def => {
      const cvs = document.createElement('canvas');
      cvs.width  = SPRITE_RES * SPRITE_DPR;
      cvs.height = SPRITE_RES * SPRITE_DPR;
      const ctx = cvs.getContext('2d');
      ctx.scale(SPRITE_DPR, SPRITE_DPR);
      this.bakeHandDrawnFood(ctx, def.id);
      this.cache[def.id] = cvs;
    });
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
  },
  drawFluffyRice(ctx, cx, cy, rx, ry, bumps = 14, fill = '#FFFDF7', stroke = '#4A3326') {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < bumps; i++) {
      const a1 = (i / bumps) * Math.PI * 2;
      const a2 = ((i + 0.5) / bumps) * Math.PI * 2;
      const a3 = ((i + 1) / bumps) * Math.PI * 2;
      const x1 = cx + Math.cos(a1) * rx, y1 = cy + Math.sin(a1) * ry;
      const xm = cx + Math.cos(a2) * (rx + 4.2), ym = cy + Math.sin(a2) * (ry + 4.2);
      const x2 = cx + Math.cos(a3) * rx, y2 = cy + Math.sin(a3) * ry;
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(xm, ym, x2, y2);
    }
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = 2.8; ctx.stroke();
    ctx.strokeStyle = '#E2D5BE'; ctx.lineWidth = 2;
    [[-rx*0.45,-ry*0.2],[rx*0.35,-ry*0.25],[-rx*0.25,ry*0.3],[rx*0.4,ry*0.25],[0,0]].forEach(([gx, gy]) => {
      ctx.beginPath();
      ctx.arc(cx + gx, cy + gy, 3.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    });
    ctx.restore();
  },
  drawKawaiiSparkle(ctx, x, y, r = 6.5, color = '#FFF3B0') {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = color; ctx.strokeStyle = '#D4A359'; ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.quadraticCurveTo(0, 0, 0, r);
    ctx.quadraticCurveTo(0, 0, -r, 0);
    ctx.quadraticCurveTo(0, 0, 0, -r);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath(); ctx.arc(r * 0.85, -r * 0.85, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  drawJellyGloss(ctx, x, y, rx, ry, rot = -0.3) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  bakeHandDrawnFood(ctx, id) {
    ctx.save();
    ctx.translate(70, 72);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const LINE = '#4A3326';
    switch (id) {
      case 'onigiri': {
        ctx.fillStyle = '#667EEA'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.moveTo(-54, 10); ctx.lineTo(48, -6); ctx.lineTo(56, 26); ctx.lineTo(-42, 36); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#FFFDF7'; ctx.lineWidth = 1.4;
        [-32, -12, 8, 28].forEach(bx => {
          ctx.beginPath(); ctx.arc(bx, 24, 8, Math.PI, 0); ctx.stroke();
          ctx.beginPath(); ctx.arc(bx, 24, 4.5, Math.PI, 0); ctx.stroke();
        });
        ctx.fillStyle = '#F7EBD2'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.moveTo(-48, 8); ctx.lineTo(14, -18); ctx.lineTo(52, 12); ctx.lineTo(-10, 34); ctx.closePath();
        ctx.fill(); ctx.stroke();
        const drawOne = (ox, oy, sc) => {
          ctx.save(); ctx.translate(ox, oy); ctx.scale(sc, sc);
          ctx.fillStyle = '#FFFDF9'; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.quadraticCurveTo(30, 8, 22, 18);
          ctx.quadraticCurveTo(0, 23, -22, 18);
          ctx.quadraticCurveTo(-30, 8, 0, -32);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#E0A96D';
          [[-4,-18],[3,-15],[0,-22],[-6,-11],[6,-10]].forEach(([sx, sy]) => {
            ctx.beginPath(); ctx.ellipse(sx, sy, 1.8, 1, 0.4, 0, Math.PI * 2); ctx.fill();
          });
          ctx.fillStyle = '#2B4C3F';
          ctx.beginPath(); ctx.roundRect(-13, -1, 26, 20, 3); ctx.fill(); ctx.stroke();
          ctx.restore();
        };
        drawOne(-14, -8, 0.9); drawOne(14, 0, 0.96);
        this.drawKawaiiSparkle(ctx, -32, -26, 6);
        this.drawKawaiiSparkle(ctx, 36, -18, 5.5);
        this.drawKawaiiSparkle(ctx, 8, 24, 5);
        break;
      }
      case 'tamagoyaki': {
        ctx.save(); ctx.rotate(-0.22);
        ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(-56, -12, 112, 34, 14); ctx.fill(); ctx.stroke();
        const leafG = ctx.createLinearGradient(-50, 0, 50, 0);
        leafG.addColorStop(0, '#74C69D'); leafG.addColorStop(1, '#40916C');
        ctx.fillStyle = leafG;
        ctx.beginPath();
        ctx.moveTo(-58, 12); ctx.quadraticCurveTo(0, -16, 54, -4);
        ctx.quadraticCurveTo(10, 20, -58, 12); ctx.closePath();
        ctx.fill(); ctx.stroke();
        [-28, -10, 8, 26].forEach((tx, idx) => {
          const ty = -4 + idx * 1.2;
          ctx.fillStyle = '#FFD166'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.roundRect(tx - 12, ty - 14, 24, 24, 6); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = '#B5651D'; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(tx, ty - 2, 6, 0, Math.PI * 1.65); ctx.stroke();
          ctx.fillStyle = '#FFFDF7';
          ctx.beginPath(); ctx.arc(tx, ty - 14, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#52B788';
          ctx.beginPath(); ctx.arc(tx - 1, ty - 15, 1.8, 0, Math.PI * 2); ctx.arc(tx + 2, ty - 13, 1.5, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
        this.drawKawaiiSparkle(ctx, -34, -26, 6);
        this.drawKawaiiSparkle(ctx, 32, 20, 5.5);
        break;
      }
      case 'sushi': {
        this.drawFluffyRice(ctx, 14, -6, 24, 12, 12);
        const tunaG = ctx.createLinearGradient(-12, -28, 38, -8);
        tunaG.addColorStop(0, '#E63946'); tunaG.addColorStop(1, '#9B2226');
        ctx.fillStyle = tunaG; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(-14, -26, 54, 19, [12, 12, 5, 5]); ctx.fill(); ctx.stroke();
        this.drawJellyGloss(ctx, 12, -20, 16, 3.2, -0.1);
        this.drawFluffyRice(ctx, -10, 16, 25, 12, 12);
        const salG = ctx.createLinearGradient(-38, -6, 20, 14);
        salG.addColorStop(0, '#FF9F68'); salG.addColorStop(1, '#E05A47');
        ctx.fillStyle = salG; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(-38, -4, 56, 20, [12, 12, 6, 6]); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#FFE5D9'; ctx.lineWidth = 2.4;
        [-22, -10, 2, 12].forEach(sx => {
          ctx.beginPath(); ctx.moveTo(sx - 5, -2); ctx.lineTo(sx + 5, 14); ctx.stroke();
        });
        this.drawJellyGloss(ctx, -10, 2, 17, 3.5, -0.12);
        this.drawKawaiiSparkle(ctx, -34, -22, 6.5);
        this.drawKawaiiSparkle(ctx, 34, 18, 6);
        this.drawKawaiiSparkle(ctx, 26, -26, 5);
        break;
      }
      case 'dango': {
        const plateG = ctx.createRadialGradient(0, 4, 8, 0, 6, 52);
        plateG.addColorStop(0, '#F4EFE6'); plateG.addColorStop(0.75, '#D6C7B2'); plateG.addColorStop(1, '#A68A71');
        ctx.fillStyle = plateG; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.ellipse(0, 6, 50, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#C88A55'; ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(46, 14); ctx.moveTo(-40, 2); ctx.lineTo(40, 24); ctx.stroke();
        const drawSkew = (bx, by) => {
          const cols = [['#FFC2D1','#FF85A1'],['#FFFFFF','#E6DEC8'],['#C7E9B0','#8FD18A']];
          [-18, 0, 18].forEach((off, i) => {
            const cx = bx + off * 0.95, cy = by + off * 0.32;
            const g = ctx.createRadialGradient(cx - 3, cy - 4, 2, cx, cy, 12);
            g.addColorStop(0, cols[i][0]); g.addColorStop(1, cols[i][1]);
            ctx.fillStyle = g; ctx.strokeStyle = LINE; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx, cy, 11.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            this.drawJellyGloss(ctx, cx - 3, cy - 4, 4, 2.2, -0.4);
          });
        };
        drawSkew(-4, -4); drawSkew(-10, 11);
        this.drawKawaiiSparkle(ctx, -32, -26, 6);
        this.drawKawaiiSparkle(ctx, 34, -18, 5.5);
        break;
      }
      case 'yakitori': {
        ctx.fillStyle = '#3D3A38'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(-54, 6); ctx.lineTo(14, -26); ctx.lineTo(56, 4); ctx.lineTo(-12, 36); ctx.closePath();
        ctx.fill(); ctx.stroke();
        const skews = [
          { x: -24, y: -4, type: 'tsukune' },
          { x: -10, y: 3,  type: 'bacon' },
          { x: 4,   y: 10, type: 'negi' },
          { x: 18,  y: 17, type: 'tare' }
        ];
        skews.forEach(sk => {
          ctx.strokeStyle = '#D4A373'; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(sk.x - 18, sk.y + 16); ctx.lineTo(sk.x + 18, sk.y - 16); ctx.stroke();
          [-7, 0, 7].forEach(step => {
            const px = sk.x + step * 0.9, py = sk.y - step * 0.8;
            ctx.strokeStyle = LINE; ctx.lineWidth = 2;
            if (sk.type === 'tsukune') {
              ctx.fillStyle = '#F3D5B5';
              ctx.beginPath(); ctx.arc(px, py, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (sk.type === 'bacon') {
              ctx.fillStyle = '#E07A5F';
              ctx.beginPath(); ctx.roundRect(px - 5, py - 4, 10, 8, 3); ctx.fill(); ctx.stroke();
              ctx.fillStyle = '#8FD18A';
              ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
            } else if (sk.type === 'negi') {
              ctx.fillStyle = '#74C69D';
              ctx.beginPath(); ctx.roundRect(px - 4.5, py - 3.5, 9, 7, 2); ctx.fill(); ctx.stroke();
            } else {
              ctx.fillStyle = '#D97724';
              ctx.beginPath(); ctx.roundRect(px - 5.5, py - 4, 11, 8, 3); ctx.fill(); ctx.stroke();
            }
          });
        });
        this.drawKawaiiSparkle(ctx, -32, -22, 6);
        this.drawKawaiiSparkle(ctx, 38, -14, 5.5);
        break;
      }
      case 'takoyaki': {
        ctx.fillStyle = '#3D3A38'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.moveTo(-46, 24); ctx.lineTo(-34, -8); ctx.lineTo(36, -8); ctx.lineTo(48, 24); ctx.closePath();
        ctx.fill(); ctx.stroke();
        [[-15, -4], [15, -4], [-18, 12], [14, 12]].forEach(([bx, by]) => {
          ctx.fillStyle = '#E09F5A'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.arc(bx, by, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#6F3826';
          ctx.beginPath();
          ctx.arc(bx, by - 3, 13.5, Math.PI * 0.95, Math.PI * 2.05);
          ctx.quadraticCurveTo(bx + 6, by + 4, bx, by - 1);
          ctx.quadraticCurveTo(bx - 6, by + 5, bx - 13.5, by - 3);
          ctx.fill();
          ctx.strokeStyle = '#FFFDF7'; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(bx - 8, by - 6); ctx.lineTo(bx + 8, by - 4); ctx.lineTo(bx - 6, by); ctx.stroke();
          ctx.fillStyle = '#E6B88A'; ctx.strokeStyle = '#8C583A'; ctx.lineWidth = 1.2;
          [-5, 3].forEach(fx => {
            ctx.beginPath(); ctx.ellipse(bx + fx, by - 14, 5, 2.5, fx * 0.1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          });
        });
        this.drawKawaiiSparkle(ctx, -34, -22, 6);
        this.drawKawaiiSparkle(ctx, 36, -20, 6);
        break;
      }
      case 'futomaki': {
        ctx.fillStyle = '#383A3F'; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-38, -36, 76, 56, 26); ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 0, 2, 34, 24, 16);
        ctx.lineWidth = 2.4; ctx.strokeStyle = LINE;
        ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.roundRect(-12, 0, 24, 13, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#74C69D'; ctx.beginPath(); ctx.roundRect(-15, -12, 13, 13, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E63946'; ctx.beginPath(); ctx.roundRect(-2, -12, 15, 13, 4); ctx.fill(); ctx.stroke();
        this.drawJellyGloss(ctx, -14, -26, 12, 3.5, -0.2);
        this.drawKawaiiSparkle(ctx, -20, -24, 5.5);
        this.drawKawaiiSparkle(ctx, 22, -20, 6);
        this.drawKawaiiSparkle(ctx, 28, 22, 5.5);
        break;
      }
      case 'tempura': {
        this.drawFluffyRice(ctx, 0, 2, 38, 34, 16);
        ctx.fillStyle = '#8FD18A'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.roundRect(-18, -8, 16, 16, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E63946';
        ctx.beginPath(); ctx.moveTo(-4, 8); ctx.lineTo(-18, 20); ctx.lineTo(-2, 22); ctx.closePath();
        ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 8, -4, 14, 14, 10, '#FFB703', LINE);
        this.drawKawaiiSparkle(ctx, -28, -24, 6.5);
        this.drawKawaiiSparkle(ctx, 30, 20, 6);
        this.drawKawaiiSparkle(ctx, 26, -24, 5);
        break;
      }
      case 'ikura': {
        const wrapG = ctx.createLinearGradient(-36, -15, 36, 30);
        wrapG.addColorStop(0, '#95B88D'); wrapG.addColorStop(1, '#6B9063');
        ctx.fillStyle = wrapG; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-36, -16, 72, 48, [10, 10, 24, 24]); ctx.fill(); ctx.stroke();
        [[-20,-14],[-8,-16],[6,-16],[19,-13],[-14,-24],[0,-26],[13,-23],[-3,-10],[10,-10]].forEach(([rx, ry]) => {
          ctx.fillStyle = '#FF9F1C'; ctx.strokeStyle = '#9C4A1A'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(rx, ry, 9.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#FFFDF7';
          ctx.beginPath(); ctx.arc(rx - 3, ry - 3, 2.5, 0, Math.PI * 2); ctx.fill();
        });
        this.drawJellyGloss(ctx, -22, 8, 5, 12, 0);
        this.drawKawaiiSparkle(ctx, -10, 12, 6);
        this.drawKawaiiSparkle(ctx, 18, 6, 6.5);
        this.drawKawaiiSparkle(ctx, 4, 20, 5);
        break;
      }
      case 'wakame': {
        ctx.fillStyle = '#4A4B50'; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-36, -8, 72, 42, [8, 8, 22, 22]); ctx.fill(); ctx.stroke();
        [-24, -14, -4, 6, 16, 24].forEach((wx, idx) => {
          ctx.strokeStyle = '#2D6A4F'; ctx.lineWidth = 5.5;
          ctx.beginPath(); ctx.moveTo(wx, -6);
          ctx.quadraticCurveTo(wx - 6, -20, wx + (idx % 2 ? 5 : -4), -32);
          ctx.stroke();
          ctx.strokeStyle = '#95D5B2'; ctx.lineWidth = 2.6; ctx.stroke();
        });
        this.drawKawaiiSparkle(ctx, -18, 12, 6);
        this.drawKawaiiSparkle(ctx, 14, 16, 6.5);
        this.drawKawaiiSparkle(ctx, 0, 6, 5);
        break;
      }
      case 'inari': {
        const wrapG = ctx.createLinearGradient(-38, -10, 38, 34);
        wrapG.addColorStop(0, '#F2845C'); wrapG.addColorStop(1, '#C85A32');
        ctx.fillStyle = wrapG; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-38, -12, 76, 46, [10, 10, 24, 24]); ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 0, -12, 36, 18, 14);
        ctx.strokeStyle = LINE; ctx.lineWidth = 2.2;
        ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.roundRect(-16, -20, 14, 13, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#74C69D'; ctx.beginPath(); ctx.roundRect(2, -22, 14, 13, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E63946'; ctx.beginPath(); ctx.roundRect(-5, -16, 15, 13, 3); ctx.fill(); ctx.stroke();
        this.drawKawaiiSparkle(ctx, -18, 14, 6);
        this.drawKawaiiSparkle(ctx, 16, 12, 6.5);
        this.drawKawaiiSparkle(ctx, 0, 22, 5);
        break;
      }
      case 'sando': {
        const eggG = ctx.createLinearGradient(-38, -30, 38, 30);
        eggG.addColorStop(0, '#FFE169'); eggG.addColorStop(1, '#E09F3E');
        ctx.fillStyle = eggG; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(-38, 8, 76, 22, 9); ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 0, 2, 37, 11, 14);
        ctx.fillStyle = eggG;
        ctx.beginPath(); ctx.roundRect(-38, -26, 76, 24, 9); ctx.fill(); ctx.stroke();
        this.drawJellyGloss(ctx, -14, -18, 16, 3.5, 0);
        this.drawKawaiiSparkle(ctx, -20, -12, 5.5);
        this.drawKawaiiSparkle(ctx, 20, 18, 6);
        this.drawKawaiiSparkle(ctx, 26, -16, 5.5);
        break;
      }
      case 'bento': {
        ctx.fillStyle = '#C88A55'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.6;
        ctx.fillRect(-34, 16, 12, 14); ctx.strokeRect(-34, 16, 12, 14);
        ctx.fillRect(18, 10, 12, 14); ctx.strokeRect(18, 10, 12, 14);
        ctx.fillStyle = '#E6B88A';
        ctx.beginPath(); ctx.moveTo(-54, 8); ctx.lineTo(14, -22); ctx.lineTo(54, 4); ctx.lineTo(-14, 32); ctx.closePath();
        ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, -16, 6, 14, 8, 8);
        ctx.fillStyle = '#FF9E9E'; ctx.beginPath(); ctx.roundRect(-30, -4, 28, 10, 5); ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 8, 0, 14, 8, 8);
        ctx.fillStyle = '#FFD166'; ctx.beginPath(); ctx.roundRect(-6, -10, 26, 10, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2B4C3F'; ctx.fillRect(3, -10, 7, 16);
        ctx.fillStyle = '#2B4C3F'; ctx.beginPath(); ctx.roundRect(14, -22, 22, 16, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FF7B00';
        ctx.beginPath(); ctx.ellipse(25, -22, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
        this.drawKawaiiSparkle(ctx, -32, -16, 6);
        this.drawKawaiiSparkle(ctx, 36, 18, 5.5);
        break;
      }
      case 'ramen': {
        ctx.fillStyle = '#D94E4E'; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, -2, 42, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFE599';
        ctx.beginPath(); ctx.ellipse(0, -4, 40, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E07A5F';
        ctx.beginPath(); ctx.ellipse(-14, -6, 14, 9, -0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFFDF7';
        ctx.beginPath(); ctx.ellipse(14, -8, 11, 8, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FF9F1C';
        ctx.beginPath(); ctx.arc(14, -8, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFDF7';
        ctx.beginPath(); ctx.arc(0, 2, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#FF85A1'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, 2, 4.5, 0, Math.PI * 1.5); ctx.stroke();
        this.drawKawaiiSparkle(ctx, -28, -26, 6);
        this.drawKawaiiSparkle(ctx, 30, -22, 5.5);
        break;
      }
      case 'taiyaki': {
        const taiG = ctx.createRadialGradient(-6, -6, 6, 0, 0, 42);
        taiG.addColorStop(0, '#FFE169'); taiG.addColorStop(0.65, '#E09F3E'); taiG.addColorStop(1, '#B5651D');
        ctx.fillStyle = taiG; ctx.strokeStyle = LINE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(44, -18); ctx.lineTo(42, 16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(-6, 0, 32, 23, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = LINE;
        ctx.beginPath(); ctx.arc(-20, -5, 3.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#8C4A27'; ctx.lineWidth = 2;
        [-4, 6].forEach(sx => {
          ctx.beginPath(); ctx.arc(sx, -2, 6, -0.8, 0.8); ctx.stroke();
          ctx.beginPath(); ctx.arc(sx, 8, 6, -0.8, 0.8); ctx.stroke();
        });
        this.drawJellyGloss(ctx, -12, -14, 10, 3, -0.2);
        this.drawKawaiiSparkle(ctx, -32, -24, 6);
        this.drawKawaiiSparkle(ctx, 32, 24, 6);
        break;
      }
      case 'daifuku': {
        this.drawFluffyRice(ctx, 0, 8, 34, 22, 14, '#A3D99B', LINE);
        ctx.fillStyle = '#FFFDF7'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.ellipse(0, -6, 18, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const berryG = ctx.createRadialGradient(-4, -20, 2, 0, -18, 16);
        berryG.addColorStop(0, '#FF8FA3'); berryG.addColorStop(1, '#E63946');
        ctx.fillStyle = berryG;
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.quadraticCurveTo(18, -18, 12, -4);
        ctx.quadraticCurveTo(0, 0, -12, -4);
        ctx.quadraticCurveTo(-18, -18, 0, -34);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        this.drawJellyGloss(ctx, -5, -20, 4.5, 2.2, -0.5);
        this.drawKawaiiSparkle(ctx, -28, -18, 6);
        this.drawKawaiiSparkle(ctx, 28, -14, 6);
        break;
      }
      case 'pudding': {
        ctx.fillStyle = '#E0F4FF'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.ellipse(0, 18, 42, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFE169';
        ctx.beginPath();
        ctx.moveTo(-30, 16);
        ctx.quadraticCurveTo(-24, -18, -18, -20);
        ctx.lineTo(18, -20);
        ctx.quadraticCurveTo(24, -18, 30, 16);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#7F3F18';
        ctx.beginPath();
        ctx.moveTo(-21, -12);
        ctx.quadraticCurveTo(-18, -22, 0, -22);
        ctx.quadraticCurveTo(18, -22, 21, -12);
        ctx.quadraticCurveTo(12, -4, 6, -12);
        ctx.quadraticCurveTo(0, -3, -6, -12);
        ctx.quadraticCurveTo(-12, -4, -21, -12);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        this.drawFluffyRice(ctx, 0, -25, 11, 6, 8, '#FFFDF7', LINE);
        ctx.fillStyle = '#E63946';
        ctx.beginPath(); ctx.arc(0, -34, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        this.drawKawaiiSparkle(ctx, -28, -22, 6);
        this.drawKawaiiSparkle(ctx, 30, -14, 5.5);
        break;
      }
      case 'cake': {
        ctx.fillStyle = '#FFE8A3'; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath(); ctx.roundRect(-32, -14, 64, 36, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#FFFDF7'; ctx.fillRect(-30, 1, 60, 8);
        ctx.fillStyle = '#FF85A1';
        [-18, 0, 18].forEach(cx => { ctx.beginPath(); ctx.arc(cx, 5, 4, 0, Math.PI * 2); ctx.fill(); });
        this.drawFluffyRice(ctx, 0, -16, 34, 10, 12, '#FFFDF7', LINE);
        ctx.fillStyle = '#E63946';
        ctx.beginPath(); ctx.ellipse(0, -30, 11, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        this.drawJellyGloss(ctx, -4, -33, 4, 2, -0.4);
        this.drawKawaiiSparkle(ctx, -30, -28, 6);
        this.drawKawaiiSparkle(ctx, 30, -24, 6);
        break;
      }
      case 'oden': {
        ctx.strokeStyle = '#C88A55'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(-28, 28); ctx.lineTo(28, -32); ctx.stroke();
        ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.fillStyle = '#FFF3D1';
        ctx.beginPath(); ctx.roundRect(-24, 4, 28, 20, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9E9A95';
        ctx.beginPath(); ctx.moveTo(-18, 4); ctx.lineTo(18, 4); ctx.lineTo(0, -20); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#E09F5A';
        ctx.beginPath(); ctx.ellipse(14, -20, 14, 9, -0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        this.drawKawaiiSparkle(ctx, -28, -16, 6);
        this.drawKawaiiSparkle(ctx, 30, 10, 6);
        break;
      }
      case 'boba': {
        const cupG = ctx.createLinearGradient(0, -30, 0, 26);
        cupG.addColorStop(0, '#FFFDF7'); cupG.addColorStop(0.55, '#95D5B2'); cupG.addColorStop(1, '#52B788');
        ctx.fillStyle = cupG; ctx.strokeStyle = LINE; ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(-26, -24); ctx.lineTo(26, -24); ctx.lineTo(20, 26);
        ctx.quadraticCurveTo(0, 31, -20, 26);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        [[-10,20],[0,22],[10,20],[-6,12],[6,12]].forEach(([px, py]) => {
          ctx.fillStyle = '#4A2C18';
          ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FFF3B0';
          ctx.beginPath(); ctx.arc(px - 1.5, py - 1.5, 1.4, 0, Math.PI * 2); ctx.fill();
        });
        this.drawFluffyRice(ctx, 0, -24, 26, 9, 12, '#FFFDF7', LINE);
        ctx.fillStyle = '#FF85A1'; ctx.strokeStyle = LINE;
        ctx.beginPath(); ctx.roundRect(4, -44, 9, 22, 3); ctx.fill(); ctx.stroke();
        this.drawKawaiiSparkle(ctx, -28, -10, 6);
        this.drawKawaiiSparkle(ctx, 28, 2, 6);
        break;
      }
    }
    ctx.restore();
  }
};
