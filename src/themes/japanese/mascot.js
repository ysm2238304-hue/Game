// ============================================================
// 🎨 src/themes/japanese/mascot.js — 星野葵立繪
// ============================================================

const MASCOT_IMAGES = {
  happy: './assets/mascot/aoi-happy.png',
  star:  './assets/mascot/aoi-star.png',
  worry: './assets/mascot/aoi-worry.png'
};

export const AnimeMascot = {
  renderSVG(mood = 'happy', headshotOnly = false) {
    const src = MASCOT_IMAGES[mood] || MASCOT_IMAGES.happy;
    const fit = headshotOnly ? 'object-top' : 'object-contain';
    return `<img src="${src}" class="w-full h-full ${fit} select-none" alt="星野葵" draggable="false">`;
  }
};
