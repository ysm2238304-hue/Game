const BGM_KEY = 'hoshino_bgm_enabled';
const SFX_KEY = 'hoshino_sfx_enabled';

function loadInitialBgmState() {
  try {
    const sfxSaved = localStorage.getItem(SFX_KEY);
    if (sfxSaved !== null) return sfxSaved === 'true';
    const bgmSaved = localStorage.getItem(BGM_KEY);
    return bgmSaved === null ? true : bgmSaved === 'true';
  } catch (_) {
    return true;
  }
}

export const BGM = {
  audio: null,
  enabled: loadInitialBgmState(),

  init() {
    if (this.audio) return;
    this.audio = new Audio('./assets/bgm.mp3?v=20261108_hawaiian');
    this.audio.loop = true;
    this.audio.volume = 0.35; // 音量 35%
  },

  play() {
    this.init();
    if (!this.enabled) return;
    this.audio.play().catch((e) => {
      console.log('BGM 播放被阻擋:', e);
    });
  },

  pause() {
    if (this.audio) {
      try {
        this.audio.pause();
      } catch (_) {}
    }
  },

  setEnabled(val) {
    this.enabled = Boolean(val);
    try {
      localStorage.setItem(BGM_KEY, String(this.enabled));
      localStorage.setItem(SFX_KEY, String(this.enabled));
    } catch (_) {}
    this.init();
    if (this.enabled) {
      this.audio.play().catch(() => {});
    } else {
      this.pause();
    }
    return this.enabled;
  },

  toggle() {
    return this.setEnabled(!this.enabled);
  }
};
