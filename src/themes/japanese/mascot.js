// ============================================================
// 🎨 深海萌系實習店長・賓士貓立繪管理器 (Tuxedo Cat Edition)
// ============================================================

const ASSET_VER = 'v=20261109_tuxedocat_v1';

const MASCOT_IMAGES = {
  happy: `./assets/mascot/tuxedocat-happy.png?${ASSET_VER}`,
  star:  `./assets/mascot/tuxedocat-star.png?${ASSET_VER}`,
  worry: `./assets/mascot/tuxedocat-worry.png?${ASSET_VER}`
};

export const AnimeMascot = {
  renderSVG(mood = 'happy', headshotOnly = false) {
    const src = MASCOT_IMAGES[mood] || MASCOT_IMAGES.happy;
    const fit = headshotOnly ? 'object-top' : 'object-contain';
    return `<img src="${src}" class="w-full h-full ${fit} select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" alt="賓士貓店長" draggable="false">`;
  }
};
