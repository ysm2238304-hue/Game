import { ITEM_DEFS } from './config/items.js';
import { GUIDE_DATA } from './config/guides.js';
import { SHELF_THEMES } from './config/shelfThemes.js';
import { generateLevelConfig } from './logic/levelGen.js';

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 8);
    r = Math.min(r, w / 2, h / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const SFX = {
  ctx: null, enabled: true, unlocked: false,
  init() {
    if (!this.enabled || this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch (e) {}
  },
  resume() {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') this.ctx.resume().catch(() => {});
    if (!this.unlocked && this.ctx.state === 'running') {
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.connect(this.ctx.destination); src.start(0);
      this.unlocked = true;
    }
  },
  toggle() { this.enabled = !this.enabled; return this.enabled; },
  tone(freq, dur, type = 'sine', vol = 0.11, delay = 0, slideFreq = null) {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, t0 + dur);
    gain.gain.setValueAtTime(0.001, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.04);
  },
  tap()      { this.tone(720, 0.05, 'triangle', 0.09, 0, 980); },
  pick()     { this.tone(580, 0.07, 'sine', 0.11, 0, 880); },
  drop()     { this.tone(520, 0.06, 'triangle', 0.1, 0, 420); },
  cancel()   { this.tone(360, 0.08, 'sine', 0.08, 0, 260); },
  swap()     { this.tone(640, 0.06, 'triangle', 0.1); this.tone(880, 0.07, 'triangle', 0.1, 0.04); },
  shutter()  { this.tone(440, 0.09, 'sine', 0.08, 0, 660); this.tone(880, 0.12, 'triangle', 0.09, 0.08); },
  iceCrack() {
    this.tone(1200, 0.06, 'triangle', 0.08, 0, 850);
    this.tone(1650, 0.08, 'sine', 0.08, 0.03, 1100);
  },
  bingo(combo = 1) {
    const boost = Math.min(combo - 1, 6) * 65;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      this.tone(f + boost, 0.16, 'triangle', 0.13, i * 0.045);
    });
    this.tone(1318.51 + boost, 0.26, 'sine', 0.14, 0.18);
  },
  win()   { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.12, i * 0.07)); },
  fail()  { [400, 350, 300, 250].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.08, i * 0.09)); },
  gacha() { [523, 659, 784, 987, 1174, 1568].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.11, i * 0.05)); }
};

window.addEventListener('touchstart', () => SFX.resume(), { passive: true });
window.addEventListener('pointerdown', () => SFX.resume(), { passive: true });

const AnimeMascot = {
  renderSVG(mood = 'happy', headshotOnly = false) {
    const viewBox = headshotOnly ? "18 6 64 56" : "0 0 100 116";
    let eyes = '', mouth = '', fx = '';

    if (mood === 'star') {
      eyes = `
        <path d="M29 33 Q37 28 44 34" stroke="#4A2E2B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M56 34 Q63 28 71 33" stroke="#4A2E2B" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <ellipse cx="37" cy="40" rx="5.5" ry="6.8" fill="url(#aoiEyeGrad)"/>
        <ellipse cx="63" cy="40" rx="5.5" ry="6.8" fill="url(#aoiEyeGrad)"/>
        <path d="M37 35 L38.3 38.7 L42 40 L38.3 41.3 L37 45 L35.7 41.3 L32 40 L35.7 38.7 Z" fill="#FFF3B0"/>
        <path d="M63 35 L64.3 38.7 L68 40 L64.3 41.3 L63 45 L61.7 41.3 L58 40 L61.7 38.7 Z" fill="#FFF3B0"/>
        <circle cx="34.2" cy="36.2" r="2.2" fill="#FFFFFF"/>
        <circle cx="60.2" cy="36.2" r="2.2" fill="#FFFFFF"/>
      `;
      mouth = `<path d="M44.5 48 Q50 55.5 55.5 48 Z" fill="#FF758F" stroke="#4A2E2B" stroke-width="1.8"/>`;
      fx = `
        <path d="M80 18 L82 23 L87 25 L82 27 L80 32 L78 27 L73 25 L78 23 Z" fill="#FFD166" stroke="#4A2E2B" stroke-width="1"/>
        <path d="M16 20 L17.5 24 L21.5 25.5 L17.5 27 L16 31 L14.5 27 L10.5 25.5 L14.5 24 Z" fill="#FF85A1" stroke="#4A2E2B" stroke-width="1"/>
      `;
    } else if (mood === 'worry') {
      eyes = `
        <path d="M30 33 Q37 36 43 32" stroke="#4A2E2B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M70 33 Q63 36 57 32" stroke="#4A2E2B" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M32 38 L42 40.5 L32 43" stroke="#4A2E2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <path d="M68 38 L58 40.5 L68 43" stroke="#4A2E2B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      `;
      mouth = `<path d="M45 50.5 Q50 47.5 55 50.5" stroke="#4A2E2B" stroke-width="2" stroke-linecap="round" fill="none"/>`;
      fx = `<path d="M76 26 Q80 33 76 37 Q72 33 76 26 Z" fill="#90E0EF" stroke="#4A2E2B" stroke-width="1.5"/>`;
    } else {
      eyes = `
        <g class="mascot-eye-blink">
          <path d="M29 31 Q37 29 43 32" stroke="#6E473B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M57 32 Q63 29 71 31" stroke="#6E473B" stroke-width="1.8" stroke-linecap="round" fill="none"/>
          <path d="M29.5 34.5 Q37 30.5 44 35.5" stroke="#4A2E2B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
          <path d="M56 35.5 Q63 30.5 70.5 34.5" stroke="#4A2E2B" stroke-width="2.8" stroke-linecap="round" fill="none"/>
          <ellipse cx="37" cy="40.5" rx="5.3" ry="6.5" fill="url(#aoiEyeGrad)"/>
          <ellipse cx="63" cy="40.5" rx="5.3" ry="6.5" fill="url(#aoiEyeGrad)"/>
          <ellipse cx="37" cy="40.5" rx="2.7" ry="3.4" fill="#4A2E2B"/>
          <ellipse cx="63" cy="40.5" rx="2.7" ry="3.4" fill="#4A2E2B"/>
          <circle cx="34.5" cy="37" r="2.3" fill="#FFFFFF"/>
          <circle cx="60.5" cy="37" r="2.3" fill="#FFFFFF"/>
          <circle cx="39.2" cy="43.5" r="1.2" fill="#FFF3B0"/>
          <circle cx="65.2" cy="43.5" r="1.2" fill="#FFF3B0"/>
        </g>
      `;
      mouth = `<path d="M46 48.5 Q50 53 54 48.5 Z" fill="#FF85A1" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>`;
    }

    return `
      <svg viewBox="${viewBox}" class="w-full h-full">
        <path d="M22 28 C8 34, 7 68, 17 85 C23 76, 26 56, 27 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M78 28 C92 34, 93 68, 83 85 C77 76, 74 56, 73 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M23 27 L13 21 L15 32 Z" fill="#8FD18A" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M77 27 L87 21 L85 32 Z" fill="#8FD18A" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <rect x="44" y="55" width="12" height="12" rx="4" fill="#FFEFE2" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M44 56 Q50 61 56 56 L56 60 Q50 63 44 60 Z" fill="#F0C9B2"/>
        <path d="M25 64 C25 60, 75 60, 75 64 L83 113 L17 113 Z" fill="#FFFDF7" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M33 65 L38 65 L38 113 L28 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M62 65 L67 65 L72 113 L62 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2"/>
        <path d="M31 76 L69 76 L73 113 L27 113 Z" fill="url(#apronGrad)" stroke="#4A2E2B" stroke-width="2.2"/>
        <polygon points="50,69 37,63 39,75" fill="#6BA368" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <polygon points="50,69 63,63 61,75" fill="#6BA368" stroke="#4A2E2B" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="50" cy="69" r="3.8" fill="#FFF3B0" stroke="#4A2E2B" stroke-width="1.8"/>
        <path d="M27 36 C27 20, 73 20, 73 36 C73 49, 58 58.5, 50 59.5 C42 58.5, 27 49, 27 36 Z" fill="#FFEFE2" stroke="#4A2E2B" stroke-width="2.2"/>
        <ellipse cx="31.5" cy="45" rx="4.8" ry="2.3" fill="#FF85A1" opacity="0.55"/>
        <ellipse cx="68.5" cy="45" rx="4.8" ry="2.3" fill="#FF85A1" opacity="0.55"/>
        <line x1="29.5" y1="44.2" x2="31" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="32" y1="44.2" x2="33.5" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="66.5" y1="44.2" x2="68" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        <line x1="69" y1="44.2" x2="70.5" y2="46" stroke="#E05780" stroke-width="1" opacity="0.7"/>
        ${eyes}
        ${mouth}
        <path d="M25 48 C22 36, 24 22, 29 19 C27 30, 28 40, 29 50 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M75 48 C78 36, 76 22, 71 19 C73 30, 72 40, 71 50 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M24 36 C24 11, 76 11, 76 36 C70 23, 64 34, 58 22 C53 34, 47 34, 42 22 C36 34, 30 23, 24 36 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M33 21 Q50 16 67 21" stroke="#FFF8EC" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M38 23.5 Q50 20 62 23.5" stroke="#FFE5EC" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.75"/>
        <path d="M50 13 Q55 3 62 8 Q56 11 50 13 Z" fill="url(#aoiHairGrad)" stroke="#4A2E2B" stroke-width="1.8"/>
        <path d="M33 15 Q50 7 67 15 L63 20 Q50 15.5 37 20 Z" fill="#FFFDF7" stroke="#4A2E2B" stroke-width="2" stroke-linejoin="round"/>
        <path d="M46 11 L54 11 L53 14.5 L47 14.5 Z" fill="#FF85A1"/>
        ${fx}
      </svg>
    `;
  }
};

const SPRITE_RES = 140;
const SPRITE_DPR = 2;

const FoodSpriteAtlas = {
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

class CozyFoodRenderer {
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

const SCENE_THEMES = {
  'view-lobby': {
    bgClass: 'scene-bg-lobby', tag: 'NOREN CURTAIN • 歡迎光臨星野和風マルシェ',
    title: '星野總店 • 迎賓大廳', tip: '點擊中央的星野葵或下方人氣旬味櫥窗，可聽取今日手作料理介紹喔♪',
    icon: '🏮', accent: 'from-[#FF85A1] to-[#FFAE6B]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFFDF7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full h-4 noren-stripes rounded border border-[#4A3326]"></div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🌸</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#D94E67]">いらっしゃいませ！</div>
            <div class="text-lg font-black text-[#4A3326]">和風暖簾掀開中</div>
          </div>
        </div>
        <div class="text-[9px] font-black text-[#8C583A] text-center">HOSHINO WASHOKU MARCHÉ</div>
      </div>`
  },
  'view-game': {
    bgClass: 'scene-bg-game', tag: 'OPEN FOR BUSINESS • 本日旬味上架',
    title: '檜木和食陳列專區', tip: '將 3 份相同手繪料理擺入同一木櫃即可完售，集滿繁盛熱度還可觸發 FEVER 獎勵！',
    icon: '🍱', accent: 'from-[#FF9E7D] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full py-1 bg-[#FFF3B0] text-[#4A3326] font-black text-[10px] text-center rounded-lg border border-[#4A3326]">✦ 檜木專櫃開啟 • 營業開始 ✦</div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🍣</span>
          <div class="text-left">
            <div class="text-xs font-black text-[#D94E67]">FRESH HANDMADE</div>
            <div class="text-lg font-black text-[#4A3326]">手作旬味上架！</div>
          </div>
        </div>
        <div class="h-2 w-full bg-gradient-to-r from-[#FF85A1] via-[#FFD166] to-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-map': {
    bgClass: 'scene-bg-map', tag: 'SHOTENGAI LINE • 商店街路面電車',
    title: '夕陽提燈商店街巡禮', tip: '累積營業星數可開啟上方三階段里程碑寶箱，領取大量星鑽與福引券！',
    icon: '🚃', accent: 'from-[#FFAE6B] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF3D6] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex justify-between items-center text-[10px] font-black text-[#8C583A]">
          <span>🏮 夕陽商店街線</span><span>NEXT ➔ 和風本町</span>
        </div>
        <div class="w-full py-2 px-3 bg-[#A8E6CF] rounded-2xl anime-border flex items-center justify-around my-auto">
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <span class="text-xl">🚃</span>
        </div>
        <div class="text-[10px] font-black text-[#4A3326] text-center">叮叮電車進站中 • 請留意月台步伐</div>
      </div>`
  },
  'view-gacha': {
    bgClass: 'scene-bg-gacha', tag: 'FUKUBIKI SHRINE • 商店街福引抽獎亭',
    title: '春日櫻花福引轉蛋亭', tip: '每回祈願皆可累積 20% 開運值，集滿 5 次下次祈願必中「特賞」超稀有秘寶！',
    icon: '🎐', accent: 'from-[#FF85A1] to-[#FFB3C6]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF0F5] anime-border p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
        <div class="text-4xl spin-slow mb-1">🌸</div>
        <div class="text-base font-black text-[#4A3326]">福引祈願鈴搖響！</div>
        <div class="text-[10px] font-bold text-[#D94E67] mt-0.5">特賞秘寶大放送中 ✦</div>
      </div>`
  },
  'view-shop': {
    bgClass: 'scene-bg-shop', tag: 'CRAFT CARPENTRY • 職人木工研發室',
    title: '檜木專櫃與設備工坊', tip: '除了改造收銀機與檜木架，還可解鎖店內開運擺設，永久提升全店營收加成！',
    icon: '🪚', accent: 'from-[#6BA368] to-[#A8E6CF]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#F4F9F4] anime-border overflow-hidden flex flex-col justify-between p-3 shadow-md">
        <div class="text-[10px] font-black text-[#3B6E4C] text-center border-b border-[#4A3326]/20 pb-1">✦ 職人木工設計圖 ✦</div>
        <div class="flex items-center justify-center gap-3 px-3 my-auto">
          <span class="text-4xl">🪚</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#3B6E4C]">HINOKI CRAFTSMAN</div>
            <div class="text-base font-black text-[#4A3326]">設備工坊修繕中</div>
          </div>
        </div>
        <div class="h-2 w-full bg-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-quests': {
    bgClass: 'scene-bg-quests', tag: 'MANAGER ROOM • 店長和室業務核定',
    title: '店長室日常委託帳', tip: '蓋滿自治會五格集章卡可領取特別大獎，下方還能鑑賞全 20 款手繪和食圖鑑！',
    icon: '📋', accent: 'from-[#8C583A] to-[#D4A373]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col items-center justify-center relative shadow-md">
        <div class="px-4 py-1.5 rounded-xl border-2 border-[#D94E67] bg-[#FFE5EC] text-[#D94E67] font-black text-base rotate-[-6deg] shadow-sm">💮 店務確認濟</div>
        <div class="text-sm font-black text-[#4A3326] mt-2">正在翻閱今日營業委託帳...</div>
      </div>`
  }
};

const SHOP_DECORS = [
  { id: 'maneki', name: '金運招財白貓', icon: '🐱', cost: 400, bonusText: '營收 +10%' },
  { id: 'matcha', name: '宇治抹茶石臼', icon: '🍵', cost: 650, bonusText: '營收 +10%' },
  { id: 'sakura', name: '春日櫻花盆栽', icon: '🌸', cost: 900, bonusText: '營收 +10%' }
];

const MAP_MILESTONES = [
  { stars: 15, coins: 300, diam: 30, voucher: 1, title: '15★ 銅之寶箱' },
  { stars: 35, coins: 600, diam: 60, voucher: 2, title: '35★ 銀之寶箱' },
  { stars: 60, coins: 1200, diam: 120, voucher: 3, title: '60★ 金之寶箱' }
];

const GameState = {
  unlockedLevel: 1,
  coins: 1200, diamonds: 200, vouchers: 8,
  direction: 'rush', stars: {},
  totalDishesCleared: 12,
  gachaPity: 0,
  stampCount: 2,
  milestonesClaimed: {},
  decorsUnlocked: { maneki: false, matcha: false, sakura: false },
  upgrades: { register: 1, shelf: 1, cold: 1 },
  boosters: { shuffle: 3, hammer: 2, magnet: 2 },
  quests: [
    { id: 'q1', desc: '完成 2 次木櫃和食全數完售', cur: 0, target: 2, claimed: false, coins: 200, diam: 20 },
    { id: 'q2', desc: '累計達成 6 次料理三連完售', cur: 0, target: 6, claimed: false, coins: 250, diam: 25 },
    { id: 'q3', desc: '在營業中施展 1 次店長秘技', cur: 0, target: 1, claimed: false, coins: 150, diam: 15 }
  ],
  load() {
    try {
      const data = localStorage.getItem('HoshinoWashoku_Save_v7');
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(this, parsed);
        this.milestonesClaimed = parsed.milestonesClaimed || {};
        this.decorsUnlocked = parsed.decorsUnlocked || { maneki: false, matcha: false, sakura: false };
      }
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem('HoshinoWashoku_Save_v7', JSON.stringify({
        unlockedLevel: this.unlockedLevel,
        coins: this.coins, diamonds: this.diamonds, vouchers: this.vouchers,
        direction: this.direction, stars: this.stars,
        totalDishesCleared: this.totalDishesCleared,
        gachaPity: this.gachaPity,
        stampCount: this.stampCount,
        milestonesClaimed: this.milestonesClaimed,
        decorsUnlocked: this.decorsUnlocked,
        upgrades: this.upgrades, boosters: this.boosters, quests: this.quests
      }));
    } catch (e) {}
  }
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateLevelConfig(levelId) {
  const rng = mulberry32(levelId * 9137 + 101);
  const cols = 3;
  const rows = 3;
  const shelfCount = 9;
  const totalSlots = shelfCount * 3;
  const depthPerSlot = levelId >= 21 ? 4 : (levelId >= 8 ? 3 : 2);
  const rawCapacity = totalSlots * depthPerSlot;
  const totalItems = Math.floor((rawCapacity - 3) / 3) * 3;
  const matchTriplets = totalItems / 3;

  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const varietyCount = Math.min(pool.length, 6 + Math.floor(levelId / 2));
  const chosenTypes = [];
  for (let i = 0; i < matchTriplets; i++) chosenTypes.push(pool[i % varietyCount].id);

  const itemPool = [];
  chosenTypes.forEach(t => itemPool.push(t, t, t));
  for (let i = itemPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [itemPool[i], itemPool[j]] = [itemPool[j], itemPool[i]];
  }

  const iceCount = Math.min(shelfCount - 2, Math.floor((levelId + 1) / 2));
  const moves = 24 + matchTriplets * 2 + (GameState.upgrades.shelf - 1) * 2;
  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = levelId >= 10 ? 3 : 2;
  const orders = uniqueTypes.slice(0, orderCount).map(id => ({ id, req: 3, done: 0 }));

  return { levelId, rows, cols, shelfCount, depthPerSlot, itemPool, totalItems, iceCount, moves, orders };
}

class GameApp {
  constructor() {
    GameState.load();
    FoodSpriteAtlas.init();
    this.canvas = document.getElementById('shelf-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.fxCtx = this.fxCanvas.getContext('2d');
    this.appEl = document.getElementById('app');
    this.stageContainer = document.getElementById('shelves-stage-container');

    this.currentView = 'view-lobby';
    this.isTransitioning = false;
    this.curLevel = GameState.unlockedLevel;
    this.shelves = [];
    this.cartSlots = [];
    this.totalLevelItems = 1;
    this.combo = 0;
    this.fever = 0;
    this.lastMatchTime = 0;
    this.customerCheerUntil = 0;
    this.customers = [
      { name: '女學生', hair: '#4A2E2B', clothes: '#FF85A1', wantId: 'onigiri' },
      { name: '上班族', hair: '#2B3A4A', clothes: '#6699CC', wantId: 'sushi' },
      { name: '柴犬叔', hair: '#D99B52', clothes: '#6BA368', wantId: 'dango' }
    ];

    this.particles = [];
    this.flyers = [];
    this.dragging = null;
    this.dragPointer = { x: 0, y: 0 };
    this.appRect = null;
    this.dpr = 1;
    this.topSceneH = 52;
    this.bottomSceneH = 62;
    this.shelfStatic = null;
    this.shelfStaticCtx = null;

    this.lobbyLines = [
      '「歡迎回來店長！今天有笹葉厚燒玉子、花見糰子與鮭魚卵軍艦唷♪」',
      '「店內採用 9 座檜木專櫃九宮格陳列，越後面的分店補貨層數越豐富喔✦」',
      '「連續完售可累積🔥繁盛熱度，集滿時全店顧客都會歡呼打賞唷！」',
      '「別忘了去工坊解鎖招財白貓，它也會出現在營業畫面的收銀吧台上♪」'
    ];
    this.lobbyLineIdx = 0;

    this.initMascots();
    this.initCartSlots();
    this.bindEvents();
    this.renderLobbyShowcase();
    this.renderShopDecors();
    this.renderEncyclopedia();
    this.renderHUD();
    this.renderRoadmap();
    this.renderQuests();
    this.startLevel(this.curLevel);
    this.startLoop();
  }

  initMascots() {
    document.getElementById('lobby-mascot-svg').innerHTML = AnimeMascot.renderSVG('happy', false);
    document.getElementById('map-mascot-holder').innerHTML = AnimeMascot.renderSVG('star', false);
    document.getElementById('guide-mascot').innerHTML = AnimeMascot.renderSVG('happy', false);
    this.setMascotMood('happy', '「同櫃擺滿3份同款手繪料理即可完售♪」');
  }

  setMascotMood(mood, speechText) {
    const faceBox = document.getElementById('hud-mascot-face');
    if (faceBox) faceBox.innerHTML = AnimeMascot.renderSVG(mood, true);
    if (speechText) document.getElementById('mascot-speech').innerText = speechText;
  }

  renderLobbyShowcase() {
    const container = document.getElementById('lobby-daily-specials');
    if (!container) return;
    container.innerHTML = '';
    const picks = [ITEM_DEFS[0], ITEM_DEFS[1], ITEM_DEFS[8]];
    picks.forEach((def, idx) => {
      const card = document.createElement('button');
      card.className = 'pop-btn bg-gradient-to-b from-[#FFFDF9] to-[#FFF3D6] rounded-xl p-1.5 border-2 border-[#4A3326] flex items-center gap-1.5 text-left shadow-xs';
      const cvs = document.createElement('canvas');
      cvs.width = 40; cvs.height = 40;
      cvs.className = 'w-9 h-9 shrink-0';
      CozyFoodRenderer.drawFood(cvs.getContext('2d'), def.id, 20, 20, 36, 36, { isBack: false });

      const info = document.createElement('div');
      info.className = 'min-w-0 flex-1 leading-tight';
      info.innerHTML = `
        <div class="text-[8px] font-black text-white bg-[#FF85A1] px-1 rounded w-max">人氣#${idx + 1}</div>
        <div class="text-[10px] font-black text-[#4A3326] truncate mt-0.5">${def.label}</div>
        <div class="text-[9px] font-black text-[#D94E67]">${def.price}</div>
      `;
      card.appendChild(cvs);
      card.appendChild(info);
      card.onclick = () => {
        SFX.tap();
        document.getElementById('lobby-speech-text').innerText = `「『${def.name}』(${def.price})：${def.desc}」`;
        document.getElementById('lobby-mascot-svg').innerHTML = AnimeMascot.renderSVG('star', false);
      };
      container.appendChild(card);
    });
  }

  renderShopDecors() {
    const box = document.getElementById('shop-decor-cabinet');
    if (!box) return;
    box.innerHTML = '';
    SHOP_DECORS.forEach(dc => {
      const unlocked = !!GameState.decorsUnlocked[dc.id];
      const card = document.createElement('div');
      card.className = `rounded-xl p-2 border-2 border-[#4A3326] flex flex-col items-center text-center ${
        unlocked ? 'bg-[#FFF3B0]' : 'bg-[#F4F9F4]'
      }`;
      card.innerHTML = `
        <div class="text-2xl mb-0.5 ${unlocked ? 'animate-bounce' : 'opacity-60'}">${dc.icon}</div>
        <div class="text-[10px] font-black text-[#4A3326] leading-tight">${dc.name}</div>
        <div class="text-[8px] font-bold text-[#D94E67] my-0.5">${dc.bonusText}</div>
        <button class="anime-btn w-full py-1 mt-0.5 rounded-lg text-[9px] font-black ${
          unlocked ? 'bg-[#A8E6CF] text-[#4A3326]' : 'bg-[#FFE5B4] text-[#4A3326]'
        }">${unlocked ? '✔ 陳列中' : `🪙 ${dc.cost}`}</button>
      `;
      if (!unlocked) {
        card.querySelector('button').onclick = () => {
          if (GameState.coins < dc.cost) { SFX.cancel(); return; }
          SFX.win();
          GameState.coins -= dc.cost;
          GameState.decorsUnlocked[dc.id] = true;
          GameState.save();
          this.renderShopDecors();
          this.rebuildShelfStaticLayer();
          this.renderHUD();
        };
      }
      box.appendChild(card);
    });
  }

  renderEncyclopedia() {
    const list = document.getElementById('food-encyclopedia-list');
    if (!list) return;
    list.innerHTML = '';
    ITEM_DEFS.forEach((def) => {
      const item = document.createElement('button');
      item.className = 'pop-btn shrink-0 w-16 bg-gradient-to-b from-[#FFFDF7] to-[#FFF3D6] rounded-xl p-1.5 border-2 border-[#4A3326] flex flex-col items-center text-center';
      const cvs = document.createElement('canvas');
      cvs.width = 44; cvs.height = 44;
      cvs.className = 'w-10 h-10';
      CozyFoodRenderer.drawFood(cvs.getContext('2d'), def.id, 22, 22, 40, 40, { isBack: false });

      const label = document.createElement('div');
      label.className = 'text-[9px] font-black text-[#4A3326] truncate w-full mt-0.5';
      label.innerText = def.label;

      const price = document.createElement('div');
      price.className = 'text-[8px] font-bold text-[#D94E67]';
      price.innerText = def.price;

      item.appendChild(cvs);
      item.appendChild(label);
      item.appendChild(price);
      item.onclick = () => {
        SFX.tap();
        document.getElementById('encyclopedia-selected-info').innerText = `【${def.name} ${def.price}】${def.desc}`;
      };
      list.appendChild(item);
    });
  }

  showTopToast(mainBadge, subTitle, dishLabel) {
    const toastWrap = document.getElementById('top-combo-toast');
    const toastBox  = document.getElementById('top-combo-box');
    document.getElementById('combo-maintext').innerText = mainBadge;
    document.getElementById('combo-subtext').innerText  = subTitle;
    document.getElementById('combo-dish-name').innerText = dishLabel;
    toastWrap.classList.remove('hidden');
    toastBox.classList.remove('toast-banner-anim');
    void toastBox.offsetWidth;
    toastBox.classList.add('toast-banner-anim');
    clearTimeout(this.hideToastTimer);
    this.hideToastTimer = setTimeout(() => toastWrap.classList.add('hidden'), 1150);
  }

  navigateTo(targetViewId) {
    if (this.isTransitioning || targetViewId === this.currentView) return;
    this.isTransitioning = true;
    SFX.shutter();
    const theme = SCENE_THEMES[targetViewId] || SCENE_THEMES['view-lobby'];
    const transEl  = document.getElementById('scene-transition');
    const backdrop = document.getElementById('trans-backdrop');
    const stage    = document.getElementById('trans-visual-stage');
    stage.innerHTML = `
      <div class="w-full max-w-xs anime-panel rounded-3xl p-4 flex flex-col items-center text-center transform transition-all duration-300 scale-95 opacity-0" id="trans-card-inner">
        <span class="px-3 py-0.5 rounded-full bg-gradient-to-r ${theme.accent} text-white text-[9px] font-black tracking-wider border border-[#4A3326] mb-2">${theme.tag}</span>
        ${theme.renderVisual()}
        <h3 class="text-lg font-black text-[#4A3326] mt-3 flex items-center gap-1.5">
          <span>${theme.icon}</span><span>${theme.title}</span>
        </h3>
        <div class="w-full mt-2 p-2.5 rounded-2xl bg-[#FFF3D6] anime-border flex items-center gap-2 text-left">
          <div class="w-10 h-10 rounded-xl bg-white border border-[#4A3326] shrink-0 overflow-hidden">${AnimeMascot.renderSVG('star', true)}</div>
          <p class="text-[11px] font-bold text-[#4A3326] leading-snug">${theme.tip}</p>
        </div>
      </div>`;
    transEl.classList.remove('hidden');
    const cardInner = document.getElementById('trans-card-inner');
    requestAnimationFrame(() => {
      backdrop.classList.remove('opacity-0'); backdrop.classList.add('opacity-100');
      cardInner.classList.remove('scale-95', 'opacity-0');
      cardInner.classList.add('scale-100', 'opacity-100');
    });
    setTimeout(() => {
      Object.values(SCENE_THEMES).forEach(t => this.appEl.classList.remove(t.bgClass));
      this.appEl.classList.add(theme.bgClass);
      document.querySelectorAll('.view-panel').forEach(p => { p.classList.add('hidden'); p.classList.remove('flex'); });
      const targetEl = document.getElementById(targetViewId);
      if (targetEl) { targetEl.classList.remove('hidden'); targetEl.classList.add('flex'); }
      this.currentView = targetViewId;
      if (targetViewId === 'view-game') setTimeout(() => this.initCanvasSize(), 20);
      this.renderHUD();
    }, 340);
    setTimeout(() => {
      backdrop.classList.remove('opacity-100'); backdrop.classList.add('opacity-0');
      cardInner.classList.remove('scale-100', 'opacity-100');
      cardInner.classList.add('scale-105', 'opacity-0');
    }, 680);
    setTimeout(() => {
      transEl.classList.add('hidden');
      this.isTransitioning = false;
    }, 900);
  }

  openGuideModal(guideKey) {
    SFX.tap();
    const info = GUIDE_DATA[guideKey] || GUIDE_DATA.game;
    document.getElementById('guide-title').innerText = info.title;
    document.getElementById('guide-body').innerText = info.body;
    document.getElementById('modal-guide').classList.remove('hidden');
  }

  initCartSlots() {
    const cap = GameState.direction === 'storage' ? 3 : 2;
    const oldItems = this.cartSlots ? this.cartSlots.filter(Boolean) : [];
    this.cartSlots = new Array(cap).fill(null);
    oldItems.slice(0, cap).forEach((it, idx) => this.cartSlots[idx] = it);
    document.getElementById('label-cart-capacity').innerText = `${cap} 籃位`;
    this.renderCartUI();
  }

  initCanvasSize() {
    this.width  = this.stageContainer.clientWidth  || 360;
    this.height = this.stageContainer.clientHeight || 440;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.canvas.width  = this.width  * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.appRect = this.appEl.getBoundingClientRect();
    this.fxCanvas.width  = this.appRect.width  * dpr;
    this.fxCanvas.height = this.appRect.height * dpr;
    this.fxCtx.setTransform(1, 0, 0, 1, 0, 0);
    this.fxCtx.scale(dpr, dpr);
    this.recalcShelvesLayout();
    this.rebuildShelfStaticLayer();
  }

  recalcShelvesLayout() {
    if (!this.shelves.length) return;
    const cols = 3;
    const rows = 3;
    const padX = 7, gapX = 6, gapY = 10;

    this.topSceneH    = Math.max(46, Math.min(60, this.height * 0.13));
    this.bottomSceneH = Math.max(54, Math.min(70, this.height * 0.15));

    const shelfW = (this.width - padX * 2 - gapX * (cols - 1)) / cols;
    const availH = this.height - this.topSceneH - this.bottomSceneH - gapY * (rows - 1) - 8;
    const maxIdealShelfH = Math.min(98, shelfW * 0.78);
    const shelfH = Math.max(66, Math.min(availH / rows, maxIdealShelfH));

    const totalGridH = rows * shelfH + (rows - 1) * gapY;
    const freeMidH = this.height - this.topSceneH - this.bottomSceneH;
    const startY = this.topSceneH + Math.max(4, (freeMidH - totalGridH) / 2);

    this.shelves.forEach((sh, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      sh.x = padX + c * (shelfW + gapX);
      sh.y = startY + r * (shelfH + gapY);
      sh.w = shelfW;
      sh.h = shelfH;

      const innerPadX = 2.5;
      const headerH = 14;
      const bottomPlankH = 6;
      const slotW = (shelfW - innerPadX * 2) / 3;
      const slotH = shelfH - headerH - bottomPlankH;

      sh.slots.forEach((sl, sIdx) => {
        sl.x = sh.x + innerPadX + sIdx * slotW;
        sl.y = sh.y + headerH;
        sl.w = slotW;
        sl.h = slotH;
      });
    });
  }

  rebuildShelfStaticLayer() {
    if (!this.width || !this.height) return;
    if (!this.shelfStatic) this.shelfStatic = document.createElement('canvas');
    const dpr = this.dpr || 1;
    this.shelfStatic.width  = Math.round(this.width  * dpr);
    this.shelfStatic.height = Math.round(this.height * dpr);
    if (!this.shelfStaticCtx) this.shelfStaticCtx = this.shelfStatic.getContext('2d');
    const sctx = this.shelfStaticCtx;
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.scale(dpr, dpr);
    sctx.clearRect(0, 0, this.width, this.height);
    sctx.lineJoin = 'round';

    this.paintTopShopEaves(sctx);
    this.shelves.forEach(sh => this.paintShelfFrame(sctx, sh));
    this.paintBottomCounterBase(sctx);
  }

  paintTopShopEaves(ctx) {
    const w = this.width;
    ctx.save();
    ctx.fillStyle = '#8C583A';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 2;
    ctx.fillRect(0, 0, w, 7);
    ctx.strokeRect(0, 0, w, 7);

    const norenCount = 6;
    const nw = w / norenCount;
    const nh = 22;
    for (let i = 0; i < norenCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#FF85A1' : '#FFFDF7';
      ctx.beginPath();
      ctx.roundRect(i * nw + 1, 5, nw - 2, nh, [0, 0, 6, 6]);
      ctx.fill();
      ctx.stroke();
    }

    [22, w - 22].forEach(lx => {
      const ly = 24;
      ctx.fillStyle = '#D94E67';
      ctx.beginPath();
      ctx.ellipse(lx, ly, 8.5, 11, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#FFF3B0';
      ctx.fillRect(lx - 4, ly - 2, 8, 4);
    });

    const boardW = Math.min(212, w * 0.58);
    const boardH = 25;
    const bx = (w - boardW) / 2;
    const by = 13;
    ctx.fillStyle = '#2B4C3F';
    ctx.strokeStyle = '#C88A55';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(bx, by, boardW, boardH, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#FFF3B0';
    ctx.font = '900 10px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ 本日のおすすめ・職人手握和食 ✦', w / 2, by + 17);
    ctx.restore();
  }

  paintBottomCounterBase(ctx) {
    const h = this.bottomSceneH;
    const w = this.width;
    const topY = this.height - h;

    ctx.save();
    ctx.fillStyle = '#C88A55';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 2;
    ctx.fillRect(0, topY + h * 0.36, w, h * 0.64);
    ctx.strokeRect(0, topY + h * 0.36, w, h * 0.64);

    ctx.fillStyle = '#E6B88A';
    ctx.fillRect(0, topY + h * 0.30, w, 7);
    ctx.strokeRect(0, topY + h * 0.30, w, 7);

    ctx.fillStyle = '#FFF3B0';
    ctx.beginPath();
    ctx.roundRect(8, topY + h * 0.08, 36, 22, 4);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4A3326';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('会計処', 26, topY + h * 0.08 + 14);

    const decors = GameState.decorsUnlocked || {};
    ctx.font = '13px sans-serif';
    if (decors.maneki) ctx.fillText('🐱', 54, topY + h * 0.25);
    if (decors.matcha) ctx.fillText('🍵', 70, topY + h * 0.25);
    if (decors.sakura) ctx.fillText('🌸', 86, topY + h * 0.25);
    ctx.restore();
  }

  paintShelfFrame(ctx, sh) {
    const theme = sh.theme || SHELF_THEMES[0];

    const lampX = sh.x + sh.w / 2;
    const lampY = sh.y - 4;
    const glow = ctx.createRadialGradient(lampX, lampY + 4, 2, lampX, lampY + 4, 34);
    glow.addColorStop(0, 'rgba(255,243,176,0.5)');
    glow.addColorStop(1, 'rgba(255,243,176,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(lampX, lampY + 4, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(74,51,38,0.2)';
    ctx.beginPath();
    ctx.roundRect(sh.x, sh.y + 3, sh.w, sh.h, 11);
    ctx.fill();

    const woodGrad = ctx.createLinearGradient(0, sh.y, 0, sh.y + sh.h);
    woodGrad.addColorStop(0, '#FFF8EC');
    woodGrad.addColorStop(1, '#EED4B1');
    ctx.fillStyle = woodGrad;
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(sh.x, sh.y, sh.w, sh.h, 10);
    ctx.fill(); ctx.stroke();

    const innerX = sh.x + 2.5, innerY = sh.y + 14;
    const innerW = sh.w - 5, innerH = sh.h - 18;
    const recessG = ctx.createLinearGradient(0, innerY, 0, innerY + innerH);
    recessG.addColorStop(0, '#DEC09A');
    recessG.addColorStop(0.55, '#F3E1C7');
    recessG.addColorStop(1, '#FFFDF9');
    ctx.fillStyle = recessG;
    ctx.strokeStyle = '#8C583A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(innerX, innerY, innerW, innerH, 6);
    ctx.fill(); ctx.stroke();

    ctx.strokeStyle = 'rgba(110,79,58,0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (let i = 1; i <= 2; i++) {
      const divX = innerX + (innerW / 3) * i;
      ctx.beginPath();
      ctx.moveTo(divX, innerY + 3);
      ctx.lineTo(divX, innerY + innerH - 5);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.fillStyle = '#C88A55';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.roundRect(innerX, sh.y + sh.h - 8, innerW, 6, [2, 2, 5, 5]);
    ctx.fill(); ctx.stroke();

    const tagW = 24, tagH = 8.5;
    const tagX = sh.x + sh.w - tagW - 5;
    const tagY = sh.y + sh.h - 9.5;
    ctx.fillStyle = '#FFF3B0';
    ctx.strokeStyle = '#4A3326';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(tagX, tagY, tagW, tagH, 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#D94E67';
    ctx.font = '900 6.5px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(theme.price || '¥200', tagX + tagW / 2, tagY + 6.5);

    const topBarG = ctx.createLinearGradient(sh.x, 0, sh.x + sh.w, 0);
    topBarG.addColorStop(0, theme.strip[0]);
    topBarG.addColorStop(1, theme.strip[1]);
    ctx.fillStyle = topBarG;
    ctx.beginPath();
    ctx.roundRect(sh.x + 2, sh.y + 1.5, sh.w - 4, 11.5, [8, 8, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#FFFDF7';
    ctx.font = '900 7.5px "M PLUS Rounded 1c", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`✦ ${theme.tag}`, sh.x + 6, sh.y + 10);
  }

  drawBottomCustomers(ctx, now) {
    const w = this.width;
    const baseY = this.height - 6;
    const isCheering = now < this.customerCheerUntil;

    const positions = [w * 0.34, w * 0.59, w * 0.84];
    this.customers.forEach((cust, idx) => {
      const cx = positions[idx];
      const bob = isCheering
        ? -Math.abs(Math.sin(now * 0.015 + idx)) * 7
        : Math.sin(now * 0.004 + idx * 1.4) * 2;
      const cy = baseY + bob;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.92, 0.92);

      ctx.fillStyle = cust.clothes;
      ctx.strokeStyle = '#4A3326';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 18, [10, 10, 2, 2]);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = '#FFEFE2';
      ctx.beginPath();
      ctx.arc(0, -29, 13, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      ctx.fillStyle = cust.hair;
      ctx.beginPath();
      ctx.arc(0, -31, 13.2, Math.PI * 0.95, Math.PI * 2.05);
      ctx.fill(); ctx.stroke();

      ctx.strokeStyle = '#4A3326';
      ctx.lineWidth = 1.8;
      if (isCheering) {
        ctx.beginPath();
        ctx.arc(-4.5, -28, 2.5, Math.PI, 0);
        ctx.moveTo(2, -28);
        ctx.arc(4.5, -28, 2.5, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#FF85A1';
        ctx.beginPath();
        ctx.arc(0, -23, 3, 0, Math.PI);
        ctx.fill();
      } else {
        ctx.fillStyle = '#4A3326';
        ctx.beginPath();
        ctx.arc(-4.5, -28, 1.7, 0, Math.PI * 2);
        ctx.arc(4.5, -28, 1.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -24, 2.2, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      const bubbleX = 18, bubbleY = -36;
      ctx.fillStyle = '#FFFDF7';
      ctx.strokeStyle = '#4A3326';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(bubbleX - 11, bubbleY - 11, 22, 22, 6);
      ctx.fill();
      ctx.stroke();

      if (isCheering) {
        ctx.fillStyle = '#E05780';
        ctx.font = '900 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', bubbleX, bubbleY + 4);
      } else {
        CozyFoodRenderer.drawFood(ctx, cust.wantId || 'onigiri', bubbleX, bubbleY, 18, 18, { isBack: false });
      }
      ctx.restore();
    });
  }

  getStoreRankInfo() {
    const d = GameState.totalDishesCleared || 0;
    const ranks = [
      { lv: 1, title: '街角和食小舖', min: 0,   next: 30 },
      { lv: 2, title: '人氣旬味食堂', min: 30,  next: 90 },
      { lv: 3, title: '商店街名物店', min: 90,  next: 180 },
      { lv: 4, title: '特選和風料亭', min: 180, next: 320 },
      { lv: 5, title: '星野總本家 ✦', min: 320, next: 500 }
    ];
    let cur = ranks[0];
    for (const r of ranks) {
      if (d >= r.min) cur = r;
    }
    const pct = Math.min(100, Math.round(((d - cur.min) / Math.max(1, cur.next - cur.min)) * 100));
    return { lv: cur.lv, title: cur.title, pct, total: d };
  }

  getTotalCoinBonusPct() {
    const regPct = GameState.upgrades.register * 25;
    const decorCount = Object.values(GameState.decorsUnlocked || {}).filter(Boolean).length;
    const dirPct = GameState.direction === 'rush' ? 25 : 0;
    return regPct + decorCount * 10 + dirPct;
  }

  renderHUD() {
    document.getElementById('res-coins').innerText = GameState.coins.toLocaleString();
    document.getElementById('res-diamonds').innerText = GameState.diamonds.toLocaleString();
    document.getElementById('res-vouchers').innerText = GameState.vouchers;
    document.getElementById('label-level').innerText = this.curLevel;
    document.getElementById('lobby-cur-stage').innerText = GameState.unlockedLevel;
    document.getElementById('btn-stage-num').innerText = this.curLevel;

    const rank = this.getStoreRankInfo();
    const rankBadge  = document.getElementById('lobby-rank-badge');
    const rankTitle  = document.getElementById('lobby-rank-title');
    const rankBar    = document.getElementById('lobby-rank-bar');
    const rankDishes = document.getElementById('lobby-total-dishes');
    if (rankBadge)  rankBadge.innerText = `Lv.${rank.lv}`;
    if (rankTitle)  rankTitle.innerText = rank.title;
    if (rankBar)    rankBar.style.width = `${rank.pct}%`;
    if (rankDishes) rankDishes.innerText = rank.total;

    document.getElementById('cnt-tool-shuffle').innerText = GameState.boosters.shuffle;
    document.getElementById('cnt-tool-hammer').innerText  = GameState.boosters.hammer;
    document.getElementById('cnt-tool-magnet').innerText  = GameState.boosters.magnet;
    const gStockMag = document.getElementById('gacha-stock-magnet');
    const gStockHam = document.getElementById('gacha-stock-hammer');
    const gStockShu = document.getElementById('gacha-stock-shuffle');
    if (gStockMag) gStockMag.innerText = `持有:${GameState.boosters.magnet}`;
    if (gStockHam) gStockHam.innerText = `持有:${GameState.boosters.hammer}`;
    if (gStockShu) gStockShu.innerText = `持有:${GameState.boosters.shuffle}`;

    const pity = Math.min(5, GameState.gachaPity || 0);
    const pityBar = document.getElementById('gacha-pity-bar');
    const pityTxt = document.getElementById('gacha-pity-text');
    if (pityBar) pityBar.style.width = `${(pity / 5) * 100}%`;
    if (pityTxt) pityTxt.innerText = pity >= 5 ? '5/5 (次回必中特賞!)' : `${pity}/5 (滿額必中特賞)`;

    const totalBonusPct = this.getTotalCoinBonusPct();
    const extraMoves = GameState.upgrades.shelf * 2;
    const coldRange = 1 + Math.floor((GameState.upgrades.cold - 1) / 1);

    document.getElementById('up-reg-val').innerText     = GameState.upgrades.register;
    document.getElementById('up-reg-pct').innerText     = GameState.upgrades.register * 25;
    document.getElementById('up-shelf-val').innerText   = GameState.upgrades.shelf;
    document.getElementById('up-shelf-moves').innerText = extraMoves;
    document.getElementById('up-cold-val').innerText    = GameState.upgrades.cold;

    const dashReg   = document.getElementById('dash-reg-bonus');
    const dashShelf = document.getElementById('dash-shelf-bonus');
    const dashCold  = document.getElementById('dash-cold-bonus');
    if (dashReg)   dashReg.innerText   = `+${totalBonusPct}%`;
    if (dashShelf) dashShelf.innerText = `+${extraMoves} 步`;
    if (dashCold)  dashCold.innerText  = `${coldRange} 櫃`;

    const discount = GameState.direction === 'tycoon' ? 0.8 : 1;
    const regCost   = Math.floor(200 * GameState.upgrades.register * discount);
    const shelfCost = Math.floor(350 * GameState.upgrades.shelf * discount);
    const coldCost  = Math.floor(500 * GameState.upgrades.cold * discount);
    document.getElementById('btn-up-register').innerText = `🪙 ${regCost} 改造`;
    document.getElementById('btn-up-shelf').innerText    = `🪙 ${shelfCost} 改造`;
    document.getElementById('btn-up-cold').innerText     = `🪙 ${coldCost} 改造`;

    const dirNames = { rush: '⚡速銷狂熱', storage: '🧺極限收納', tycoon: '💎商業巨頭' };
    const curDirLabel = dirNames[GameState.direction] || '⚡速銷狂熱';
    document.getElementById('badge-direction-hud').innerText = curDirLabel.slice(0, 3);
    document.getElementById('lobby-skill-name').innerText = curDirLabel.slice(1);

    const hasClaimableQuest = GameState.quests.some(q => q.cur >= q.target && !q.claimed) || (GameState.stampCount >= 5);
    const questDot = document.getElementById('badge-quest-dot');
    if (questDot) questDot.classList.toggle('hidden', !hasClaimableQuest);
    const gachaDot = document.getElementById('badge-gacha-dot');
    if (gachaDot) gachaDot.classList.toggle('hidden', GameState.vouchers <= 0);

    this.renderStampCard();
  }

  startLevel(lvId) {
    this.curLevel = lvId;
    this.combo = 0;
    this.fever = 0;
    const cfg = generateLevelConfig(lvId);
    this.moves = cfg.moves;
    this.totalLevelItems = cfg.totalItems;
    this.activeOrders = cfg.orders;
    document.getElementById('label-moves').innerText = this.moves;
    document.getElementById('label-shelves-count').innerText = `9 座檜木櫃 (${cfg.depthPerSlot}層)`;
    document.getElementById('top-combo-toast').classList.add('hidden');
    const feverBar = document.getElementById('fever-progress-bar');
    if (feverBar) feverBar.style.width = '0%';

    this.customers.forEach((c, idx) => {
      const ord = this.activeOrders[idx % this.activeOrders.length];
      c.wantId = ord ? ord.id : ITEM_DEFS[(lvId + idx) % ITEM_DEFS.length].id;
    });

    this.cartSlots.fill(null);
    this.initCartSlots();
    this.initShelves(cfg);
    this.initCanvasSize();
    this.renderOrders();
    this.updateClearProgress();
    this.renderHUD();
    this.setMascotMood('happy', `「第 ${lvId} 日營業開始！9座檜木專櫃已補滿 ${cfg.depthPerSlot} 層旬味♪」`);
  }

  initShelves(cfg) {
    this.shelves = [];
    for (let s = 0; s < cfg.shelfCount; s++) {
      const slots = [];
      for (let sl = 0; sl < 3; sl++) {
        slots.push({ shelfIdx: s, slotIdx: sl, x: 0, y: 0, w: 50, h: 60, queue: [], iceHp: 0, scaleX: 1, scaleY: 1 });
      }
      this.shelves.push({
        shelfIdx: s, x: 0, y: 0, w: 160, h: 80,
        theme: SHELF_THEMES[s % SHELF_THEMES.length],
        slots
      });
    }
    const allSlots = [];
    this.shelves.forEach(sh => sh.slots.forEach(sl => allSlots.push(sl)));
    let poolIdx = 0;
    for (let layer = 0; layer < cfg.depthPerSlot; layer++) {
      for (let i = 0; i < allSlots.length; i++) {
        if (layer === 0 && i >= allSlots.length - 2) continue;
        if (poolIdx < cfg.itemPool.length) allSlots[i].queue.push(cfg.itemPool[poolIdx++]);
      }
    }
    while (poolIdx < cfg.itemPool.length) {
      const target = allSlots[poolIdx % (allSlots.length - 1)];
      target.queue.push(cfg.itemPool[poolIdx++]);
    }
    this.shelves.forEach(sh => {
      const [a, b, c] = sh.slots;
      if (a.queue[0] && a.queue[0] === b.queue[0] && b.queue[0] === c.queue[0]) {
        const swapTarget = allSlots.find(s => s.queue[0] && s.queue[0] !== a.queue[0]);
        if (swapTarget) {
          const tmp = c.queue[0];
          c.queue[0] = swapTarget.queue[0];
          swapTarget.queue[0] = tmp;
        }
      }
    });
    const filledSlots = allSlots.filter(s => s.queue.length > 0);
    for (let i = 0; i < cfg.iceCount && i < filledSlots.length; i++) {
      const target = filledSlots[(i * 5 + 3) % filledSlots.length];
      target.iceHp = GameState.upgrades.cold >= 2 ? 1 : 2;
    }
  }

  updateClearProgress() {
    let remain = 0;
    this.shelves.forEach(sh => sh.slots.forEach(sl => { remain += sl.queue.length; }));
    this.cartSlots.forEach(it => { if (it) remain++; });
    const cleared = Math.max(0, this.totalLevelItems - remain);
    const pct = Math.min(100, Math.round((cleared / this.totalLevelItems) * 100));
    document.getElementById('clear-progress-bar').style.width = `${pct}%`;
    document.getElementById('clear-progress-text').innerText = `${pct}%`;
    return remain;
  }

  renderOrders() {
    const box = document.getElementById('order-items');
    box.innerHTML = '';
    this.activeOrders.forEach(ord => {
      const def = ITEM_DEFS.find(d => d.id === ord.id) || ITEM_DEFS[0];
      const remain = Math.max(0, ord.req - ord.done);
      const div = document.createElement('div');
      div.className = `flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#4A3326] text-[9px] font-black leading-none ${
        remain === 0 ? 'bg-[#A8E6CF] text-[#4A3326]' : 'bg-[#FFF3D6] text-[#4A3326]'
      }`;
      div.innerHTML = `<span>${def.label}</span><span class="${remain === 0 ? 'text-[#2D5A43]' : 'text-[#D94E67]'}">${remain === 0 ? '✔' : `×${remain}`}</span>`;
      box.appendChild(div);
    });
  }

  jellyBounce(slot) {
    slot.scaleX = 1.22; slot.scaleY = 0.8;
    setTimeout(() => { slot.scaleX = 0.92; slot.scaleY = 1.12; }, 75);
    setTimeout(() => { slot.scaleX = 1.04; slot.scaleY = 0.97; }, 150);
    setTimeout(() => { slot.scaleX = 1; slot.scaleY = 1; }, 220);
  }

  spawnParticles(x, y, color = '#FFF3B0', count = 14) {
    const palette = [color, '#FF85A1', '#FFD166', '#A8E6CF', '#FFFDF7'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2.2 + Math.random() * 4.5;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 5 + Math.random() * 4,
        color: palette[i % palette.length],
        alpha: 1
      });
    }
  }

  spawnFlyer(typeId, sx, sy, tx, ty, onComplete, duration = 240) {
    this.flyers.push({ typeId, sx, sy, tx, ty, startTime: performance.now(), duration, onComplete });
  }

  bindEvents() {
    window.addEventListener('resize', () => this.initCanvasSize());
    document.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.allow-scroll-y') && !e.target.closest('.allow-scroll-x')) {
        e.preventDefault();
      }
    }, { passive: false });

    document.getElementById('btn-enter-lobby').onclick = () => {
      SFX.tap();
      document.getElementById('view-title').classList.add('hidden');
      this.renderHUD();
    };

    const updateSfxButtons = () => {
      const on = SFX.enabled;
      document.getElementById('btn-toggle-sfx').innerText = on ? '🔊 音效: 開啟' : '🔇 音效: 關閉';
      document.getElementById('btn-hud-sfx').innerText = on ? '🔊' : '🔇';
    };
    document.getElementById('btn-toggle-sfx').onclick = () => { SFX.toggle(); updateSfxButtons(); };
    document.getElementById('btn-hud-sfx').onclick    = () => { SFX.toggle(); updateSfxButtons(); };

    document.getElementById('lobby-mascot-touch').onclick = () => {
      SFX.tap();
      this.lobbyLineIdx = (this.lobbyLineIdx + 1) % this.lobbyLines.length;
      document.getElementById('lobby-speech-text').innerText = this.lobbyLines[this.lobbyLineIdx];
      const moods = ['happy', 'star', 'happy', 'star'];
      document.getElementById('lobby-mascot-svg').innerHTML = AnimeMascot.renderSVG(moods[this.lobbyLineIdx % moods.length], false);
    };

    document.querySelectorAll('.scene-nav-btn').forEach(btn => {
      btn.onclick = () => { const target = btn.dataset.nav; if (target) this.navigateTo(target); };
    });

    document.querySelectorAll('.btn-open-guide').forEach(btn => {
      btn.onclick = () => this.openGuideModal(btn.dataset.guide);
    });
    document.getElementById('btn-close-guide').onclick = () => {
      SFX.tap();
      document.getElementById('modal-guide').classList.add('hidden');
    };

    const openDirModal = () => {
      SFX.tap();
      document.getElementById('modal-direction').classList.remove('hidden');
    };
    document.getElementById('btn-lobby-skill').onclick      = openDirModal;
    document.getElementById('badge-direction-hud').onclick = openDirModal;
    document.getElementById('hud-mascot-face').onclick     = openDirModal;

    document.querySelectorAll('.direction-card').forEach(card => {
      card.onclick = () => {
        SFX.tap();
        document.querySelectorAll('.direction-card').forEach(c => {
          c.classList.remove('bg-[#FFF3B0]'); c.classList.add('bg-white');
          c.querySelector('.dir-radio').innerText = '○';
          c.querySelector('.dir-radio').className = 'dir-radio text-slate-300 font-black text-lg';
        });
        card.classList.add('bg-[#FFF3B0]'); card.classList.remove('bg-white');
        card.querySelector('.dir-radio').innerText = '✔';
        card.querySelector('.dir-radio').className = 'dir-radio text-[#D94E67] font-black text-lg';
        GameState.direction = card.dataset.direction;
      };
    });
    document.getElementById('btn-confirm-direction').onclick = () => {
      SFX.tap();
      GameState.save();
      this.initCartSlots();
      this.renderHUD();
      document.getElementById('modal-direction').classList.add('hidden');
    };

    const getAppCoords = (clientX, clientY) => {
      const appRect = this.appRect || this.appEl.getBoundingClientRect();
      return { appX: clientX - appRect.left, appY: clientY - appRect.top };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      for (const sh of this.shelves) {
        for (const slot of sh.slots) {
          if (canvasX >= slot.x && canvasX <= slot.x + slot.w &&
              canvasY >= slot.y && canvasY <= slot.y + slot.h) {
            if (!slot.queue.length) return;
            if (slot.iceHp > 0) {
              SFX.iceCrack();
              this.jellyBounce(slot);
              this.setMascotMood('worry', '「這道料理結霜了！在鄰近木櫃完售或用暖茶融霜吧！」');
              return;
            }
            const { appX, appY } = getAppCoords(e.clientX, e.clientY);
            this.beginShelfDrag({ slot, shelf: sh, startX: e.clientX, startY: e.clientY, appX, appY });
            return;
          }
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const { appX, appY } = getAppCoords(e.clientX, e.clientY);
      this.dragPointer = { x: appX, y: appY, clientX: e.clientX, clientY: e.clientY };
    });

    window.addEventListener('pointerup', (e) => { if (this.dragging) this.handleDrop(e); });
    window.addEventListener('pointercancel', () => {
      if (this.dragging) {
        const drag = this.dragging;
        this.dragging = null;
        this.cancelDragReturn(drag);
      }
    });

    document.getElementById('btn-tool-shuffle').onclick = () => this.useTool('shuffle');
    document.getElementById('btn-tool-hammer').onclick  = () => this.useTool('hammer');
    document.getElementById('btn-tool-magnet').onclick  = () => this.useTool('magnet');
    document.getElementById('btn-draw-gacha').onclick   = () => this.triggerGacha();
    document.getElementById('btn-close-gacha-reward').onclick = () => {
      document.getElementById('modal-gacha-reward').classList.add('hidden');
    };

    document.getElementById('btn-settle-action').onclick = () => {
      SFX.tap();
      document.getElementById('modal-settle').classList.add('hidden');
      this.startLevel(GameState.unlockedLevel);
    };
    document.getElementById('btn-settle-lobby').onclick = () => {
      SFX.tap();
      document.getElementById('modal-settle').classList.add('hidden');
      this.navigateTo('view-lobby');
    };

    document.getElementById('btn-daily-claim').onclick = () => {
      SFX.win();
      GameState.diamonds += 50;
      GameState.save();
      this.renderHUD();
      const btn = document.getElementById('btn-daily-claim');
      btn.innerText = '✔ 今日出勤獎金已領取';
      btn.disabled = true;
      btn.classList.add('opacity-60');
    };

    const stampBtn = document.getElementById('btn-claim-stamp-card');
    if (stampBtn) {
      stampBtn.onclick = () => {
        if ((GameState.stampCount || 0) < 5) {
          SFX.cancel();
          return;
        }
        SFX.win();
        GameState.stampCount = Math.max(0, GameState.stampCount - 5);
        GameState.diamonds += 50;
        GameState.coins += 200;
        GameState.save();
        this.renderHUD();
      };
    }

    document.getElementById('btn-up-register').onclick = () => this.buyUpgrade('register', 200);
    document.getElementById('btn-up-shelf').onclick    = () => this.buyUpgrade('shelf', 350);
    document.getElementById('btn-up-cold').onclick     = () => this.buyUpgrade('cold', 500);
  }

  beginShelfDrag(cand) {
    SFX.pick();
    const cRect = this.canvas.getBoundingClientRect();
    const appRect = this.appRect || this.appEl.getBoundingClientRect();
    const originAppX = (cRect.left - appRect.left) + cand.slot.x + cand.slot.w / 2;
    const originAppY = (cRect.top  - appRect.top)  + cand.slot.y + cand.slot.h / 2;
    this.dragging = {
      sourceType: 'shelf',
      fromSlot: cand.slot, fromShelf: cand.shelf,
      typeId: cand.slot.queue[0],
      originAppX, originAppY
    };
    this.dragPointer = { x: cand.appX, y: cand.appY, clientX: cand.startX, clientY: cand.startY };
  }

  beginCartDrag(cartIdx, e) {
    const typeId = this.cartSlots[cartIdx];
    if (!typeId) return;
    SFX.pick();
    const appRect = this.appRect || this.appEl.getBoundingClientRect();
    const slotEl = document.querySelector(`[data-cart="${cartIdx}"]`);
    const sRect  = slotEl.getBoundingClientRect();
    const originAppX = (sRect.left - appRect.left) + sRect.width / 2;
    const originAppY = (sRect.top  - appRect.top)  + sRect.height / 2;
    this.dragging = { sourceType: 'cart', cartIdx, typeId, originAppX, originAppY };
    this.dragPointer = { x: e.clientX - appRect.left, y: e.clientY - appRect.top, clientX: e.clientX, clientY: e.clientY };
    this.renderCartUI();
  }

  handleDrop(e) {
    const drag = this.dragging;
    this.dragging = null;
    const cx = this.dragPointer.clientX;
    const cy = this.dragPointer.clientY;
    for (let i = 0; i < this.cartSlots.length; i++) {
      const el = document.querySelector(`[data-cart="${i}"]`);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) {
        if (drag.sourceType === 'cart' && drag.cartIdx === i) { this.cancelDragReturn(drag); return; }
        const targetCartItem = this.cartSlots[i];
        this.cartSlots[i] = drag.typeId;
        if (drag.sourceType === 'shelf') {
          if (targetCartItem) drag.fromSlot.queue[0] = targetCartItem;
          else drag.fromSlot.queue.shift();
          this.jellyBounce(drag.fromSlot);
        } else if (drag.sourceType === 'cart') {
          this.cartSlots[drag.cartIdx] = targetCartItem;
        }
        SFX.drop();
        this.renderCartUI();
        this.checkMatches();
        return;
      }
    }
    const cRect = this.canvas.getBoundingClientRect();
    const canvasX = cx - cRect.left;
    const canvasY = cy - cRect.top;
    for (const sh of this.shelves) {
      for (const slot of sh.slots) {
        if (canvasX >= slot.x && canvasX <= slot.x + slot.w &&
            canvasY >= slot.y && canvasY <= slot.y + slot.h) {
          if ((drag.sourceType === 'shelf' && slot === drag.fromSlot) || slot.iceHp > 0) {
            if (slot.iceHp > 0) {
              SFX.iceCrack();
              this.setMascotMood('worry', '「結霜中的木櫃格位要先融霜才能擺放料理喔！」');
            }
            this.cancelDragReturn(drag);
            return;
          }
          this.consumeMove();
          const displacedItem = slot.queue.length > 0 ? slot.queue[0] : null;
          if (displacedItem) slot.queue[0] = drag.typeId;
          else slot.queue.unshift(drag.typeId);
          this.jellyBounce(slot);
          if (drag.sourceType === 'shelf') {
            if (displacedItem) drag.fromSlot.queue[0] = displacedItem;
            else drag.fromSlot.queue.shift();
            this.jellyBounce(drag.fromSlot);
          } else if (drag.sourceType === 'cart') {
            this.cartSlots[drag.cartIdx] = displacedItem;
            this.renderCartUI();
          }
          SFX.swap();
          this.checkMatches();
          return;
        }
      }
    }
    this.cancelDragReturn(drag);
  }

  cancelDragReturn(drag) {
    SFX.cancel();
    this.spawnFlyer(drag.typeId, this.dragPointer.x, this.dragPointer.y, drag.originAppX, drag.originAppY, () => {
      if (drag.sourceType === 'shelf') this.jellyBounce(drag.fromSlot);
      else this.renderCartUI();
    }, 180);
  }

  consumeMove() {
    this.moves = Math.max(0, this.moves - 1);
    document.getElementById('label-moves').innerText = this.moves;
    if (this.moves <= 5 && this.moves > 0) {
      this.setMascotMood('worry', `「店長加油！還剩下最後 ${this.moves} 步唷💦」`);
      document.getElementById('moves-badge').classList.add('animate-pulse');
    } else {
      document.getElementById('moves-badge').classList.remove('animate-pulse');
    }
  }

  renderCartUI() {
    const tray = document.getElementById('cart-tray');
    tray.innerHTML = '';
    for (let idx = 0; idx < this.cartSlots.length; idx++) {
      const slotDiv = document.createElement('div');
      slotDiv.className = 'cart-slot w-[44px] h-[44px] rounded-xl bamboo-slot flex items-center justify-center relative cursor-pointer shrink-0';
      slotDiv.setAttribute('data-cart', idx);
      const typeId = this.cartSlots[idx];
      const isBeingDragged = this.dragging && this.dragging.sourceType === 'cart' && this.dragging.cartIdx === idx;
      if (typeId && !isBeingDragged) {
        const cvs = document.createElement('canvas');
        cvs.width = 40; cvs.height = 40;
        cvs.className = 'w-9 h-9 cursor-grab active:cursor-grabbing';
        const ctx = cvs.getContext('2d');
        CozyFoodRenderer.drawFood(ctx, typeId, 20, 20, 38, 38, { isBack: false });
        cvs.onpointerdown = (e) => { e.stopPropagation(); this.beginCartDrag(idx, e); };
        slotDiv.appendChild(cvs);
      } else {
        slotDiv.innerHTML = `<span class="text-[9px] font-black text-[#8C583A]/70">籃${idx + 1}</span>`;
      }
      tray.appendChild(slotDiv);
    }
  }

  checkMatches() {
    for (const sh of this.shelves) {
      const [s0, s1, s2] = sh.slots;
      const f0 = s0.queue[0], f1 = s1.queue[0], f2 = s2.queue[0];
      if (f0 && f0 === f1 && f1 === f2 && s0.iceHp === 0 && s1.iceHp === 0 && s2.iceHp === 0) {
        this.triggerAnimeMatch(sh, f0);
        return;
      }
    }
    this.updateClearProgress();
    this.checkWinOrLose();
  }

  triggerAnimeMatch(shelf, typeId) {
    const now = performance.now();
    if (now - this.lastMatchTime < 4500) this.combo++;
    else this.combo = 1;
    this.lastMatchTime = now;
    this.customerCheerUntil = now + 1350;
    SFX.bingo(this.combo);

    GameState.totalDishesCleared = (GameState.totalDishesCleared || 0) + 3;
    this.fever = Math.min(100, (this.fever || 0) + 25);
    const feverBar = document.getElementById('fever-progress-bar');
    if (feverBar) feverBar.style.width = `${this.fever}%`;

    const cRect = this.canvas.getBoundingClientRect();
    const appRect = this.appRect || this.appEl.getBoundingClientRect();
    const centerSlot = shelf.slots[1];
    const centerX = (cRect.left - appRect.left) + centerSlot.x + centerSlot.w / 2;
    const centerY = (cRect.top  - appRect.top)  + centerSlot.y + centerSlot.h / 2;

    [shelf.slots[0], shelf.slots[2]].forEach(sl => {
      const sx = (cRect.left - appRect.left) + sl.x + sl.w / 2;
      const sy = (cRect.top  - appRect.top)  + sl.y + sl.h / 2;
      this.spawnFlyer(typeId, sx, sy, centerX, centerY, null, 130);
    });
    shelf.slots.forEach(slot => { slot.queue.shift(); this.jellyBounce(slot); });
    this.damageNearbyIce(shelf.shelfIdx);

    const def = ITEM_DEFS.find(d => d.id === typeId) || ITEM_DEFS[0];
    let feverBonusCoins = 0;
    if (this.fever >= 100) {
      this.fever = 0;
      if (feverBar) setTimeout(() => { feverBar.style.width = '0%'; }, 450);
      feverBonusCoins = 80;
      this.spawnParticles(appRect.width * 0.5, appRect.height * 0.45, '#FFD166', 24);
      this.showTopToast('🔥 大繁盛 FEVER!!', '全店顧客歡呼打賞 +80 金幣!!', `${def.name} ✦`);
    } else {
      const cheers = ['✦ 絕品三連完售!!', '✦ 手作旬味大好評!!', '✦ 商店街大繁盛!!', '✦ 顧客大滿足!!'];
      this.showTopToast(`COMBO ×${this.combo}`, cheers[(this.combo - 1) % cheers.length], `${def.name} ✦`);
    }
    this.setMascotMood('star', `「太棒了店長！『${def.label}』達成 ${this.combo} 連擊完售✦」`);

    setTimeout(() => {
      this.spawnParticles(centerX, centerY, '#FFF3B0', 16);
      const coinBox = document.getElementById('hud-coin-box').getBoundingClientRect();
      const tx = (coinBox.left - appRect.left) + coinBox.width / 2;
      const ty = (coinBox.top  - appRect.top)  + coinBox.height / 2;
      this.spawnFlyer(typeId, centerX, centerY, tx, ty, () => {
        const mult = 1 + this.getTotalCoinBonusPct() / 100;
        const bonusCoin = Math.round(18 * this.combo * mult) + feverBonusCoins;
        GameState.coins += bonusCoin;
        this.renderHUD();
      }, 280);
    }, 120);

    const ord = this.activeOrders.find(o => o.id === typeId);
    if (ord && ord.done < ord.req) { ord.done += 3; this.renderOrders(); }
    if (GameState.quests[1]) GameState.quests[1].cur += 1;
    GameState.save();
    this.updateClearProgress();
    setTimeout(() => this.checkMatches(), 230);
  }

  damageNearbyIce(matchedShelfIdx) {
    const range = 1 + Math.floor((GameState.upgrades.cold - 1) / 1);
    let cracked = false;
    this.shelves.forEach(sh => {
      if (Math.abs(sh.shelfIdx - matchedShelfIdx) <= range) {
        sh.slots.forEach(sl => {
          if (sl.iceHp > 0) {
            sl.iceHp = Math.max(0, sl.iceHp - 1);
            this.jellyBounce(sl);
            cracked = true;
          }
        });
      }
    });
    if (cracked) SFX.iceCrack();
  }

  checkWinOrLose() {
    const remainingItems = this.updateClearProgress();
    if (remainingItems === 0) {
      SFX.win();
      GameState.unlockedLevel = Math.max(GameState.unlockedLevel, this.curLevel + 1);
      const star3Threshold = GameState.direction === 'rush' ? 4 : 7;
      const star2Threshold = GameState.direction === 'rush' ? 1 : 3;
      const stars = this.moves >= star3Threshold ? 3 : (this.moves >= star2Threshold ? 2 : 1);
      GameState.stars[this.curLevel] = Math.max(GameState.stars[this.curLevel] || 0, stars);

      const orderAllDone = this.activeOrders.every(o => o.done >= o.req);
      let baseCoins = 180 + this.curLevel * 20 + (orderAllDone ? 90 : 0);
      baseCoins = Math.round(baseCoins * (1 + this.getTotalCoinBonusPct() / 100));
      const diamReward = GameState.direction === 'tycoon' ? 24 : 12;

      GameState.coins += baseCoins;
      GameState.diamonds += diamReward;
      GameState.stampCount = Math.min(5, (GameState.stampCount || 0) + 1);
      if (GameState.quests[0]) GameState.quests[0].cur += 1;
      GameState.save();

      this.renderHUD();
      this.renderRoadmap();
      this.renderQuests();
      this.showTopToast('✦ 本日完售 ✦', '全店手作料理一掃而空！', '大繁盛達成 🎊');

      setTimeout(() => {
        document.getElementById('settle-badge').innerText = '✦ 本日營業圓滿達成 ✦';
        document.getElementById('settle-mascot').innerHTML = AnimeMascot.renderSVG('star', false);
        document.getElementById('settle-title').innerText = '大繁盛！完美完售！';
        document.getElementById('settle-stars').innerText = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        document.getElementById('settle-desc').innerText = orderAllDone
          ? '全木櫃完售＋顧客指定點單達成！獲得特別營業獎金與自治會印章！'
          : '所有木櫃和食皆已結帳完畢！顧客滿意離開店鋪♪';
        document.getElementById('settle-coin-text').innerText = `🪙 +${baseCoins}`;
        document.getElementById('settle-diam-text').innerText = `💎 +${diamReward}`;
        document.getElementById('btn-settle-action').innerText = '下一營業日 ➔';
        document.getElementById('modal-settle').classList.remove('hidden');
      }, 360);
      return;
    }
    if (this.moves <= 0) {
      SFX.fail();
      document.getElementById('settle-badge').innerText = '本日打烊時間到';
      document.getElementById('settle-mascot').innerHTML = AnimeMascot.renderSVG('worry', false);
      document.getElementById('settle-title').innerText = '營業步數耗盡💦';
      document.getElementById('settle-stars').innerText = '☆☆☆';
      document.getElementById('settle-desc').innerText = '別氣餒店長！無體力限制，善用竹編手提籃與秘技再挑戰一次吧！';
      document.getElementById('settle-coin-text').innerText = '🪙 +30 (出勤津貼)';
      document.getElementById('settle-diam-text').innerText = '💎 +0';
      GameState.coins += 30;
      GameState.save();
      this.renderHUD();
      document.getElementById('btn-settle-action').innerText = '立即重試本關 ↻';
      document.getElementById('modal-settle').classList.remove('hidden');
    }
  }

  useTool(type) {
    if (GameState.boosters[type] <= 0) {
      this.setMascotMood('worry', '「秘技庫存不足！回大廳前往福引轉蛋亭補充吧♪」');
      return;
    }
    if (type === 'shuffle') {
      const openSlots = [];
      this.shelves.forEach(sh => sh.slots.forEach(sl => {
        if (sl.queue.length > 0 && sl.iceHp === 0) openSlots.push(sl);
      }));
      if (openSlots.length < 2) return;
      GameState.boosters.shuffle--;
      const pool = openSlots.map(s => s.queue[0]).sort(() => Math.random() - 0.5);
      openSlots.forEach((s, i) => { s.queue[0] = pool[i]; this.jellyBounce(s); });
      SFX.swap();
      this.showTopToast('🔀 全櫃重整', '所有木櫃前排料理已重新擺盤！', '擺盤煥然一新 ✦');
      this.setMascotMood('happy', '「全木櫃前排料理重新擺盤完畢！」');
    } else if (type === 'hammer') {
      GameState.boosters.hammer--;
      this.shelves.forEach(sh => sh.slots.forEach(sl => {
        if (sl.iceHp > 0) { sl.iceHp = 0; this.jellyBounce(sl); }
      }));
      SFX.iceCrack();
      this.eliminateOneFullTriplet('「暖茶融霜奉上！全店結霜融化＋直接完售一組料理！」');
    } else if (type === 'magnet') {
      GameState.boosters.magnet--;
      this.eliminateOneFullTriplet('「極速盛合發動！瞬間集齊 3 份同款和食完售！」', true);
    }
    if (GameState.quests[2]) GameState.quests[2].cur += 1;
    GameState.save();
    this.renderHUD();
    this.renderQuests();
    this.checkMatches();
  }

  eliminateOneFullTriplet(speechMsg, preferOrder = false) {
    const locations = {};
    this.shelves.forEach(sh => sh.slots.forEach(sl => {
      sl.queue.forEach((item, qIdx) => {
        locations[item] = locations[item] || [];
        locations[item].push({ kind: 'shelf', slot: sl, qIdx });
      });
    }));
    this.cartSlots.forEach((id, idx) => {
      if (id) {
        locations[id] = locations[id] || [];
        locations[id].push({ kind: 'cart', cartIdx: idx });
      }
    });
    const candidates = Object.keys(locations).filter(k => locations[k].length >= 3);
    if (candidates.length === 0) return;
    let chosenType = candidates[0];
    if (preferOrder) {
      const orderMatch = candidates.find(k => this.activeOrders.some(o => o.id === k && o.done < o.req));
      if (orderMatch) chosenType = orderMatch;
    }
    const def = ITEM_DEFS.find(d => d.id === chosenType) || ITEM_DEFS[0];
    const targets = locations[chosenType].slice(0, 3);
    const appRect = this.appRect || this.appEl.getBoundingClientRect();
    const cRect = this.canvas.getBoundingClientRect();
    const coinBox = document.getElementById('hud-coin-box').getBoundingClientRect();
    const targetAppX = (coinBox.left - appRect.left) + coinBox.width / 2;
    const targetAppY = (coinBox.top  - appRect.top)  + coinBox.height / 2;
    targets.sort((a, b) => (b.qIdx || 0) - (a.qIdx || 0)).forEach(loc => {
      let sx = appRect.width / 2, sy = appRect.height / 2;
      if (loc.kind === 'shelf') {
        sx = (cRect.left - appRect.left) + loc.slot.x + loc.slot.w / 2;
        sy = (cRect.top  - appRect.top)  + loc.slot.y + loc.slot.h / 2;
        loc.slot.queue.splice(loc.qIdx, 1);
        loc.slot.iceHp = 0;
        this.jellyBounce(loc.slot);
      } else if (loc.kind === 'cart') {
        this.cartSlots[loc.cartIdx] = null;
        this.renderCartUI();
      }
      this.spawnParticles(sx, sy, '#FFF3B0', 8);
      this.spawnFlyer(chosenType, sx, sy, targetAppX, targetAppY, null, 240);
    });
    GameState.totalDishesCleared = (GameState.totalDishesCleared || 0) + 3;
    this.customerCheerUntil = performance.now() + 1350;
    this.showTopToast('✦ 秘技完售 ✦', '店長秘技瞬間湊齊三連完售！', `${def.name} ✦`);
    setTimeout(() => {
      SFX.bingo(this.combo + 1);
      const ord = this.activeOrders.find(o => o.id === chosenType);
      if (ord) ord.done += 3;
      this.renderOrders();
      this.updateClearProgress();
      this.renderHUD();
      this.checkWinOrLose();
    }, 240);
    this.setMascotMood('star', speechMsg);
  }

  triggerGacha() {
    if (GameState.vouchers <= 0 && GameState.diamonds < 30) { SFX.cancel(); return; }
    if (GameState.vouchers > 0) GameState.vouchers--;
    else GameState.diamonds -= 30;
    SFX.gacha();
    const dial = document.getElementById('gacha-dial');
    dial.style.transform = 'rotate(360deg)';
    document.getElementById('gacha-dome').classList.add('gacha-shaking');
    setTimeout(() => {
      dial.style.transform = 'rotate(0deg)';
      document.getElementById('gacha-dome').classList.remove('gacha-shaking');
      const pool = [
        { special: true,  rarity: '✦ 特賞・超稀有秘寶 ✦', icon: '🥢', name: '極速盛合秘技 × 2', desc: '直接從全店集齊 3 份同款和食瞬間完售！', fn: () => GameState.boosters.magnet += 2 },
        { special: true,  rarity: '✦ 特賞・超稀有秘寶 ✦', icon: '💎', name: '璀璨星鑽禮盒 × 100', desc: '商店街自治會特別頒發的高額星鑽獎勵！', fn: () => GameState.diamonds += 100 },
        { special: false, rarity: '✦ 一番賞・特級秘技 ✦', icon: '🍵', name: '暖茶融霜秘技 × 2', desc: '瞬間融化全場結霜並完售一組料理！', fn: () => GameState.boosters.hammer += 2 },
        { special: false, rarity: '✦ 一番賞・特級秘技 ✦', icon: '🔀', name: '全櫃重整秘技 × 3', desc: '隨時重新調度所有木櫃上的料理位置！', fn: () => GameState.boosters.shuffle += 3 },
        { special: false, rarity: '✦ 二番賞・營業資金 ✦', icon: '🪙', name: '店鋪營業資金 × 600', desc: '可用於職人木工坊升級收銀台與開運擺設！', fn: () => GameState.coins += 600 }
      ];

      let rew;
      if ((GameState.gachaPity || 0) >= 5) {
        const specials = pool.filter(p => p.special);
        rew = specials[Math.floor(Math.random() * specials.length)];
        GameState.gachaPity = 0;
      } else {
        rew = pool[Math.floor(Math.random() * pool.length)];
        GameState.gachaPity = rew.special ? 0 : (GameState.gachaPity || 0) + 1;
      }

      rew.fn();
      GameState.save();
      this.renderHUD();
      document.getElementById('gacha-rarity-badge').innerText = rew.rarity;
      document.getElementById('gacha-reward-icon').innerText  = rew.icon;
      document.getElementById('gacha-reward-name').innerText  = rew.name;
      document.getElementById('gacha-reward-desc').innerText  = rew.desc;
      document.getElementById('modal-gacha-reward').classList.remove('hidden');
    }, 750);
  }

  buyUpgrade(type, baseCost) {
    let finalCost = baseCost * GameState.upgrades[type];
    if (GameState.direction === 'tycoon') finalCost = Math.floor(finalCost * 0.8);
    if (GameState.coins < finalCost) { SFX.cancel(); return; }
    SFX.win();
    GameState.coins -= finalCost;
    GameState.upgrades[type]++;
    GameState.save();
    this.renderHUD();
  }

  renderRoadmap() {
    const container = document.getElementById('roadmap-nodes');
    container.innerHTML = '';
    let totalStars = 0;
    Object.values(GameState.stars || {}).forEach(s => { totalStars += s; });
    const starLabel = document.getElementById('map-total-stars');
    if (starLabel) starLabel.innerText = totalStars;

    const mileBar = document.getElementById('map-milestone-bar');
    if (mileBar) {
      mileBar.innerHTML = '';
      MAP_MILESTONES.forEach(ms => {
        const claimed = !!(GameState.milestonesClaimed && GameState.milestonesClaimed[ms.stars]);
        const canClaim = totalStars >= ms.stars && !claimed;
        const box = document.createElement('button');
        box.className = `pop-btn rounded-xl p-1.5 border-2 border-[#4A3326] flex flex-col items-center text-center ${
          claimed ? 'bg-[#D8F3DC]' : (canClaim ? 'bg-[#FFF3B0] animate-bounce' : 'bg-[#FFF8EC]')
        }`;
        box.innerHTML = `
          <div class="text-base leading-none">${claimed ? '🎊' : (canClaim ? '🎁' : '📦')}</div>
          <div class="text-[9px] font-black text-[#4A3326] mt-0.5">${ms.title}</div>
          <div class="text-[8px] font-bold text-[#D94E67]">${claimed ? '已領取' : `💎${ms.diam} 🎫${ms.voucher}`}</div>
        `;
        if (canClaim) {
          box.onclick = () => {
            SFX.win();
            GameState.milestonesClaimed[ms.stars] = true;
            GameState.coins += ms.coins;
            GameState.diamonds += ms.diam;
            GameState.vouchers += ms.voucher;
            GameState.save();
            this.renderRoadmap();
            this.renderHUD();
          };
        }
        mileBar.appendChild(box);
      });
    }

    for (let lv = 1; lv <= 60; lv++) {
      const unlocked = lv <= GameState.unlockedLevel;
      const isCur = lv === GameState.unlockedLevel;
      const stars = GameState.stars[lv] || 0;
      const node = document.createElement('button');
      node.className = `pop-btn h-14 rounded-2xl flex flex-col items-center justify-center font-black anime-border shadow-sm ${
        isCur ? 'bg-[#FF85A1] text-white scale-105' :
        unlocked ? 'bg-white text-[#4A3326]' :
        'bg-[#EAD7C0]/70 text-[#8C583A]/60 opacity-70'
      }`;
      node.innerHTML = `
        <span class="text-xs leading-none">第 ${lv} 店</span>
        <span class="text-[10px] mt-1 ${isCur ? 'text-[#FFF3B0]' : 'text-[#FF9F1C]'}">
          ${unlocked ? ('★'.repeat(stars) + '☆'.repeat(3 - stars)) : '🔒'}
        </span>
      `;
      if (unlocked) node.onclick = () => { this.startLevel(lv); this.navigateTo('view-game'); };
      container.appendChild(node);
    }
  }

  renderStampCard() {
    const slotBox = document.getElementById('stamp-card-slots');
    if (!slotBox) return;
    slotBox.innerHTML = '';
    const count = Math.min(5, GameState.stampCount || 0);
    for (let i = 1; i <= 5; i++) {
      const stamped = i <= count;
      const cell = document.createElement('div');
      cell.className = `h-11 rounded-xl border-2 border-[#4A3326] flex items-center justify-center ${
        stamped ? 'bg-[#FFE5EC]' : 'bg-white/90'
      }`;
      cell.innerHTML = stamped
        ? `<div class="w-8 h-8 rounded-full border-2 border-[#D94E67] bg-[#FF85A1] text-white font-black text-xs flex items-center justify-center -rotate-12 shadow-xs">濟</div>`
        : `<span class="text-[10px] font-black text-[#8C583A]/50">印${i}</span>`;
      slotBox.appendChild(cell);
    }
    const claimBtn = document.getElementById('btn-claim-stamp-card');
    if (claimBtn) {
      claimBtn.innerText = count >= 5 ? '🎁 立即領 💎50!' : `集章 ${count}/5 (領💎50)`;
      claimBtn.className = `anime-btn px-2.5 py-1 text-[10px] font-black rounded-xl ${
        count >= 5 ? 'bg-[#A8E6CF] text-[#4A3326] animate-bounce' : 'bg-[#FF85A1] text-white'
      }`;
    }
  }

  renderQuests() {
    const box = document.getElementById('quests-container');
    box.innerHTML = '';
    GameState.quests.forEach(q => {
      const can = q.cur >= q.target && !q.claimed;
      const row = document.createElement('div');
      row.className = 'anime-panel p-2.5 rounded-2xl flex items-center justify-between gap-2';
      row.innerHTML = `
        <div>
          <h4 class="font-black text-xs text-[#4A3326]">${q.desc}</h4>
          <p class="text-[10px] text-[#D94E67] font-black mt-0.5">達成度: ${Math.min(q.cur, q.target)}/${q.target} • 獎金 🪙${q.coins} 💎${q.diam}</p>
        </div>
        <button class="anime-btn px-3 py-1.5 rounded-xl font-black text-xs shrink-0 ${
          q.claimed ? 'bg-slate-100 text-slate-400' :
          can ? 'bg-[#A8E6CF] text-[#4A3326]' :
          'bg-[#FFF3D6] text-[#8C583A]'
        }">${q.claimed ? '💮 已核定' : (can ? '蓋章領取!' : '營業中')}</button>
      `;
      const btn = row.querySelector('button');
      if (can) {
        btn.onclick = () => {
          SFX.win();
          q.claimed = true;
          GameState.coins += q.coins;
          GameState.diamonds += q.diam;
          GameState.stampCount = Math.min(5, (GameState.stampCount || 0) + 1);
          GameState.save();
          this.renderHUD();
          this.renderQuests();
        };
      }
      box.appendChild(row);
    });
    this.renderStampCard();
  }

  startLoop() {
    const loop = (now) => {
      const isGameView = this.currentView === 'view-game';
      const hasFX = this.flyers.length > 0 || this.particles.length > 0 || this.dragging;
      if (isGameView || hasFX) {
        if (isGameView) this.drawShelvesCanvas(now);
        this.drawFXCanvas(now);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  drawShelvesCanvas(now = performance.now()) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this.shelfStatic) {
      this.ctx.drawImage(this.shelfStatic, 0, 0, this.width, this.height);
    }
    const ctx = this.ctx;
    this.shelves.forEach(sh => {
      sh.slots.forEach(slot => {
        const depthCount = slot.queue.length;
        for (let d = 0; d < Math.min(depthCount, 4); d++) {
          ctx.fillStyle = d === 0 ? '#6BA368' : '#FF85A1';
          ctx.beginPath();
          ctx.arc(slot.x + slot.w / 2 - 6 + d * 4.2, slot.y + 4, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        if (slot.queue.length > 1) {
          CozyFoodRenderer.drawFood(ctx, slot.queue[1], slot.x + slot.w / 2 + 2, slot.y + slot.h / 2 - 4, slot.w, slot.h, { isBack: true });
        }
        const isDraggingThis = this.dragging && this.dragging.sourceType === 'shelf' && this.dragging.fromSlot === slot;
        if (slot.queue.length > 0 && !isDraggingThis) {
          CozyFoodRenderer.drawFood(ctx, slot.queue[0], slot.x + slot.w / 2, slot.y + slot.h / 2 + 2, slot.w, slot.h, {
            isBack: false,
            scaleX: slot.scaleX || 1,
            scaleY: slot.scaleY || 1,
            iceHp: slot.iceHp || 0
          });
        }
      });
    });

    this.drawBottomCustomers(ctx, now);
    if (this.dragging) this.paintDropIndicator();
  }

  paintDropIndicator() {
    const cRect = this.canvas.getBoundingClientRect();
    const canvasX = this.dragPointer.clientX - cRect.left;
    const canvasY = this.dragPointer.clientY - cRect.top;
    for (const sh of this.shelves) {
      for (const slot of sh.slots) {
        if (canvasX >= slot.x && canvasX <= slot.x + slot.w &&
            canvasY >= slot.y && canvasY <= slot.y + slot.h) {
          const ctx = this.ctx;
          ctx.save();
          if (slot.iceHp > 0) {
            ctx.strokeStyle = 'rgba(220,90,90,0.85)';
            ctx.fillStyle = 'rgba(220,90,90,0.14)';
          } else {
            ctx.strokeStyle = '#FF85A1';
            ctx.fillStyle = 'rgba(255,133,161,0.16)';
          }
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.roundRect(slot.x + 1, slot.y + 1, slot.w - 2, slot.h - 2, 6);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
          return;
        }
      }
    }
  }

  drawFXCanvas(now) {
    const appRect = this.appRect || this.appEl.getBoundingClientRect();
    this.fxCtx.clearRect(0, 0, appRect.width, appRect.height);
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      const t = Math.min(1, (now - f.startTime) / f.duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const curX = f.sx + (f.tx - f.sx) * ease;
      const curY = f.sy + (f.ty - f.sy) * ease - Math.sin(t * Math.PI) * 24;
      const scale = 1 - t * 0.22;
      CozyFoodRenderer.drawFood(this.fxCtx, f.typeId, curX, curY, 64 * scale, 64 * scale, { isBack: false });
      if (t >= 1) {
        if (f.onComplete) f.onComplete();
        this.flyers.splice(i, 1);
      }
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.alpha -= 0.028;
      if (p.alpha <= 0) { this.particles.splice(i, 1); continue; }
      const sp = FoodSpriteAtlas.getSparkle(p.color);
      const sz = (16 / sp.radius) * p.size;
      this.fxCtx.globalAlpha = Math.max(0, p.alpha);
      this.fxCtx.drawImage(sp.cvs, p.x - sz / 2, p.y - sz / 2, sz, sz);
      this.fxCtx.globalAlpha = 1;
    }
    if (this.dragging) {
      const px = this.dragPointer.x;
      const py = this.dragPointer.y;
      this.fxCtx.save();
      CozyFoodRenderer.drawFood(this.fxCtx, this.dragging.typeId, px, py - 12, 74, 74, {
        isBack: false, scaleX: 1.15, scaleY: 1.15, lift: 14
      });
      this.fxCtx.restore();
    }
  }
}

new GameApp();
