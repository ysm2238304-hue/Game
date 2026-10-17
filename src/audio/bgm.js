const BGM_KEY = 'hoshino_bgm_enabled';

export const BGM = {
  audio: null,
  enabled: localStorage.getItem(BGM_KEY) !== 'false',

  init() {
    if (this.audio) return;
    this.audio = new Audio('./assets/bgm.mp3');
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

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(BGM_KEY, String(this.enabled));
    this.init();
    if (this.enabled) this.audio.play().catch(() => {});
    else this.audio.pause();
    return this.enabled;
  }
};
