// ============================================================
// 🎵 src/audio/sfx.js — 音效系統（含 iOS 背景喚醒與防記憶體洩漏優化）
// ============================================================
//
// 職責：用 oscillator 合成遊戲音效，不用外部音檔
//
// 對外提供：
//   - SFX  音效物件（tap / pick / drop / swap / bingo / win ...）
// ============================================================

const SFX_STORAGE_KEY = 'hoshino_sfx_enabled';

function loadInitialSfxState() {
  try {
    const saved = localStorage.getItem(SFX_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch (_) {
    return true;
  }
}

export const SFX = {
  ctx: null,
  enabled: loadInitialSfxState(),
  unlocked: false,

  init() {
    if (!this.enabled || this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) {}
  },

  resume() {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.unlocked && this.ctx.state === 'running') {
      try {
        const buf = this.ctx.createBuffer(1, 1, 22050);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.connect(this.ctx.destination);
        src.start(0);
        src.onended = () => src.disconnect();
        this.unlocked = true;
      } catch (_) {}
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem(SFX_STORAGE_KEY, String(this.enabled));
    } catch (_) {}
    if (this.enabled) this.resume();
    return this.enabled;
  },

  tone(freq, dur, type = 'sine', vol = 0.11, delay = 0, slideFreq = null) {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t0 = this.ctx.currentTime + Math.max(0, delay);
      const safeDur = Math.max(0.02, dur);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), t0);
      if (slideFreq && slideFreq > 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), t0 + safeDur);
      }

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + safeDur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      // 播放完畢後自動斷開音訊節點，防止長時間遊玩在 iOS WebKit 產生破音或記憶體洩漏
      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      };

      osc.start(t0);
      osc.stop(t0 + safeDur + 0.04);
    } catch (_) {}
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
    const boost = Math.min(Math.max(0, combo - 1), 6) * 65;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      this.tone(f + boost, 0.16, 'triangle', 0.13, i * 0.045);
    });
    this.tone(1318.51 + boost, 0.26, 'sine', 0.14, 0.18);
  },
  win()   { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.12, i * 0.07)); },
  fail()  { [400, 350, 300, 250].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.08, i * 0.09)); },
  gacha() { [523, 659, 784, 987, 1174, 1568].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.11, i * 0.05)); }
};

// iOS Safari 需要在使用者手勢中解鎖或從背景返回時恢復 AudioContext
if (typeof window !== 'undefined') {
  window.addEventListener('touchstart', () => SFX.resume(), { passive: true });
  window.addEventListener('pointerdown', () => SFX.resume(), { passive: true });
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      SFX.resume();
    }
  });
}
