// ============================================================
// 🎵 src/audio/sfx.js — 比奇堡海綿寶寶高多巴胺音效系統
// ============================================================
//
// 職責：
//   - 使用 Web Audio API 原生合成 Q 彈水滴氣泡聲、木質貨架碰撞聲、
//     蟹老闆金幣收銀機聲 (Ka-ching!)、航海勝負號角
//   - 免外掛大音檔，零延遲，iOS/Android 背景喚醒與自動斷開防洩漏
// ============================================================

const SFX_STORAGE_KEY = 'hoshino_sfx_enabled';
const BGM_STORAGE_KEY = 'hoshino_bgm_enabled';

function loadInitialSfxState() {
  try {
    const saved = localStorage.getItem(SFX_STORAGE_KEY);
    if (saved !== null) return saved === 'true';
    const bgmSaved = localStorage.getItem(BGM_STORAGE_KEY);
    return bgmSaved === null ? true : bgmSaved === 'true';
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

  setEnabled(val) {
    this.enabled = Boolean(val);
    try {
      localStorage.setItem(SFX_STORAGE_KEY, String(this.enabled));
      localStorage.setItem(BGM_STORAGE_KEY, String(this.enabled));
    } catch (_) {}
    if (this.enabled) {
      this.resume();
    } else if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
    return this.enabled;
  },

  toggle() {
    return this.setEnabled(!this.enabled);
  },

  // 基礎音調合成器（具平滑包絡線與自動斷開節點）
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

      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + safeDur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

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

  // 🧼 專屬合成 1：Q 彈深海水滴氣泡聲 (Bubble Pop / Suction Plop)
  pop(startFreq = 380, endFreq = 1150, dur = 0.06, vol = 0.14, delay = 0) {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t0 = this.ctx.currentTime + Math.max(0, delay);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t0);
      // 快速上滑音打造水滴爆破感
      osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch (_) {}
      };
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (_) {}
  },

  // 🪵 專屬合成 2：深海木質貨架物理碰撞聲 (Wooden Shelf Clack / Thud)
  woodThud(pitch = 300, dur = 0.07, vol = 0.15, delay = 0) {
    if (!this.enabled) return;
    this.resume();
    if (!this.ctx || this.ctx.state !== 'running') return;

    try {
      const t0 = this.ctx.currentTime + Math.max(0, delay);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // 三角波 + 快速向下衰減模擬木頭共鳴
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, t0);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.35, t0 + dur);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(vol, t0 + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.onended = () => {
        try { osc.disconnect(); gain.disconnect(); } catch (_) {}
      };
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);

      // 附加一個清脆木塊高頻敲擊 transient
      this.tone(pitch * 2.2, dur * 0.6, 'sine', vol * 0.45, delay, pitch * 0.8);
    } catch (_) {}
  },

  // 🪙 專屬合成 3：蟹老闆收銀機叮噹金幣聲 (Krabs Cash Register Ka-Ching!)
  kaChing(vol = 0.14, delay = 0) {
    if (!this.enabled) return;
    // 兩組清脆金屬高頻泛音 (B6 1975Hz & E7 2637Hz)
    this.tone(1975.5, 0.22, 'sine', vol * 0.8, delay);
    this.tone(2637.0, 0.28, 'sine', vol * 0.9, delay + 0.02);
    this.tone(3135.9, 0.32, 'triangle', vol * 0.5, delay + 0.04);
  },

  // --- 遊戲情境具體呼叫介面 ---

  // 1. 點擊按鈕：清脆小氣泡
  tap() {
    this.pop(620, 1350, 0.04, 0.11);
  },

  // 2. 拿起商品：Q 彈吸盤拔出聲 (Suction Pop)
  pick() {
    this.pop(340, 1080, 0.055, 0.16);
  },

  // 3. 放下到貨架：沉穩木質就位聲 (Shelf Thud)
  drop() {
    this.woodThud(280, 0.065, 0.16);
  },

  // 4. 操作取消 / 步數無效：輕微滑稽彈簧悶響
  cancel() {
    this.tone(320, 0.09, 'sine', 0.1, 0, 190);
  },

  // 5. 貨架商品對調：雙重水泡滾動 (Double Bubble Swoosh)
  swap() {
    this.pop(460, 920, 0.04, 0.12, 0);
    this.pop(620, 1220, 0.045, 0.13, 0.035);
  },

  // 6. 截圖快門 / 航海日誌紀念拍照
  shutter() {
    this.tone(480, 0.08, 'triangle', 0.09, 0, 820);
    this.tone(960, 0.12, 'sine', 0.11, 0.06);
  },

  // 7. 蚌殼開合 / 冰封解凍碎裂聲
  iceCrack() {
    this.tone(1350, 0.05, 'triangle', 0.09, 0, 750);
    this.pop(780, 1600, 0.06, 0.12, 0.02);
    this.woodThud(420, 0.05, 0.11, 0.04);
  },

  // 8. 🎯 三連消除 (BINGO)：水母爆漿氣泡 + 蟹老闆收銀金幣 Ka-Ching! + 連擊音階攀升
  bingo(combo = 1) {
    const boost = Math.min(Math.max(0, combo - 1), 7) * 75; // 連擊越高音調越亢奮
    
    // 氣泡爆破
    this.pop(420 + boost, 1450 + boost, 0.07, 0.15, 0);

    // 歡樂大三和弦琶音 (C - E - G - C)
    const chord = [523.25, 659.25, 783.99, 1046.50];
    chord.forEach((freq, i) => {
      this.tone(freq + boost, 0.18, 'triangle', 0.12, i * 0.045);
    });

    // 蟹老闆金幣收銀機碰撞 (高多巴胺反饋)
    this.kaChing(0.14, 0.08);
  },

  // 9. 🏆 勝利通關：航海大水手號角勝利歡呼 (Sailor Brass Fanfare)
  win() {
    const fanfare = [
      { f: 523.25, d: 0.10, t: 0.00 }, // C5
      { f: 659.25, d: 0.10, t: 0.10 }, // E5
      { f: 783.99, d: 0.12, t: 0.20 }, // G5
      { f: 1046.50, d: 0.28, t: 0.32 }, // C6
      { f: 880.00, d: 0.14, t: 0.55 }, // A5
      { f: 1046.50, d: 0.42, t: 0.70 }, // C6 (長音)
    ];
    fanfare.forEach(n => {
      this.tone(n.f, n.d, 'triangle', 0.14, n.t);
      this.tone(n.f * 1.5, n.d * 0.8, 'sine', 0.06, n.t); // 泛音豐滿度
    });
    // 伴隨收銀金幣齊鳴
    this.kaChing(0.18, 0.75);
  },

  // 10. 🥀 時間用盡超時失敗：滑稽哭腔悲鳴 (Sad Trombone Waa-Waa-Waa)
  fail() {
    const sadNotes = [
      { f: 370.0, endF: 355.0, d: 0.22, t: 0.00 },
      { f: 349.2, endF: 335.0, d: 0.22, t: 0.24 },
      { f: 329.6, endF: 315.0, d: 0.22, t: 0.48 },
      { f: 293.7, endF: 240.0, d: 0.45, t: 0.72 } // 最後滑落
    ];
    sadNotes.forEach(n => {
      this.tone(n.f, n.d, 'sawtooth', 0.07, n.t, n.endF);
    });
    // 結尾破泡泡
    this.pop(400, 180, 0.12, 0.09, 1.15);
  },

  // 11. ⚓ 沉船寶箱抽獎 (Gacha Roll)：舵輪旋轉咔咔聲 + 開寶箱璀璨音
  gacha() {
    // 輪盤連續咔噠聲
    for (let i = 0; i < 6; i++) {
      this.woodThud(480 + i * 40, 0.04, 0.10, i * 0.06);
    }
    // 璀璨寶藏琶音
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((f, i) => {
      this.tone(f, 0.16, 'sine', 0.12, 0.38 + i * 0.045);
    });
    this.kaChing(0.16, 0.65);
  },

  // 12. ⏱️ 最後 10 秒倒數計時急促航海鐘 (Urgent Ship Bell Tick)
  tick() {
    this.woodThud(920, 0.035, 0.09);
    this.tone(1480, 0.04, 'sine', 0.06);
  }
};

// iOS Safari / Android 觸控喚醒解鎖 AudioContext
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
