// ============================================================
// 📦 喵喵超商場景主題 (Tuxedo Cat Edition)
// ============================================================

export const SCENE_THEMES = {
  'view-lobby': {
    bgClass: 'scene-bg-lobby', tag: 'CAT MART • 歡迎光臨喵喵超商',
    title: '喵喵超商 • 迎賓大廳', tip: '點擊中央的賓士貓店長，可以聽取今日理貨推薦喵♪',
    icon: '🐾', accent: 'from-[#FFB703] to-[#FB8500]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8E7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full h-4 bg-gradient-to-r from-[#FFB703] to-[#FB8500] rounded border border-[#251408]"></div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🐱</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#FB8500]">MEOW MART!</div>
            <div class="text-lg font-black text-[#251408]">歡迎光臨貓咪超商</div>
          </div>
        </div>
        <div class="text-[9px] font-black text-[#FB8500] text-center">TUXEDO CAT CONVENIENCE STORE</div>
      </div>`
  },
  'view-game': {
    bgClass: 'scene-bg-game', tag: 'SHELF SORT • 貓咪理貨開工',
    title: '4 層滿版超商大貨架', tip: '將 3 份相同美食拖曳到同一層即可消除，連續消除還能增加秒數！',
    icon: '🛒', accent: 'from-[#0096C7] to-[#0077B6]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8E7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full py-1 bg-[#FFE082] text-[#251408] font-black text-[10px] text-center rounded-lg border border-[#251408]">✦ 4層超商貨架 • 整理開始 ✦</div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🐾</span>
          <div class="text-left">
            <div class="text-xs font-black text-[#D84315]">FRESH GOODS SORT</div>
            <div class="text-lg font-black text-[#251408]">零食理貨大作戰！</div>
          </div>
        </div>
        <div class="h-2 w-full bg-gradient-to-r from-[#00B4D8] via-[#FFD166] to-[#FF85A1] rounded-full border border-[#251408]"></div>
      </div>`
  },
  'view-gacha': {
    bgClass: 'scene-bg-gacha', tag: 'PIRATE CHEST • 沉船古董寶箱',
    title: '沉船神秘古董寶箱', tip: '轉動深海航海鐵舵，隨機獲得撤銷、洗牌、提示神級秘寶！',
    icon: '🏴‍☠️', accent: 'from-[#7B1FA2] to-[#9C27B0]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#F3E5F5] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🏴‍☠️</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#7B1FA2]">PIRATE TREASURE</div>
            <div class="text-lg font-black text-[#251408]">沉船寶藏開啟！</div>
          </div>
        </div>
      </div>`
  }
};
