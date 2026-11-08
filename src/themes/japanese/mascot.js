// ============================================================
// 🎨 比奇堡金牌店長・海綿寶寶立繪管理器
// ============================================================

const ASSET_VER = 'v=20261108_spongebob_mascot_final_v4';

const MASCOT_IMAGES = {
  happy: `./assets/mascot/spongebob-happy.png?${ASSET_VER}`,
  star:  `./assets/mascot/spongebob-star.png?${ASSET_VER}`,
  worry: `./assets/mascot/spongebob-worry.png?${ASSET_VER}`
};

export const AnimeMascot = {
  renderSVG(mood = 'happy', headshotOnly = false) {
    const src = MASCOT_IMAGES[mood] || MASCOT_IMAGES.happy;
    const fit = headshotOnly ? 'object-top' : 'object-contain';
    return `<img src="${src}" class="w-full h-full ${fit} select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" alt="海綿寶寶" draggable="false">`;
  }
};
