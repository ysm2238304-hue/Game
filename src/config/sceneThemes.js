// ============================================================
// 📦 src/themes/japanese/scenes.js — 比奇堡場景主題 (Bikini Bottom Edition)
// ============================================================

export const SCENE_THEMES = {
  'view-lobby': {
    bgClass: 'scene-bg-lobby', tag: 'KRUSTY KRAB • 歡迎光臨比奇堡蟹堡王',
    title: '蟹堡王總店 • 迎賓大廳', tip: '點擊中央的海綿寶寶或下方熱銷吧台，可聽取今日美味蟹堡介紹喔♪',
    icon: '⚓', accent: 'from-[#00B4D8] to-[#0077B6]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#E0F7FA] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full h-4 bg-gradient-to-r from-[#00B4D8] to-[#0077B6] rounded border border-[#251408]"></div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🍍</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#0077B6]">I\'M READY!</div>
            <div class="text-lg font-black text-[#251408]">歡迎光臨蟹堡王</div>
          </div>
        </div>
        <div class="text-[9px] font-black text-[#0077B6] text-center">BIKINI BOTTOM KRUSTY KRAB</div>
      </div>`
  },
  'view-game': {
    bgClass: 'scene-bg-game', tag: 'OPEN FOR BUSINESS • 蟹堡開工',
    title: '深海漂流木陳列專區', tip: '將 3 份相同美食拖曳到同一根漂流木上即可完售，連續消除還能增加秒數！',
    icon: '🍔', accent: 'from-[#FF9E7D] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8E7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full py-1 bg-[#FFE082] text-[#251408] font-black text-[10px] text-center rounded-lg border border-[#251408]">✦ 漂流木貨架開啟 • 營業開始 ✦</div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🍔</span>
          <div class="text-left">
            <div class="text-xs font-black text-[#D84315]">FRESH KRABBY PATTY</div>
            <div class="text-lg font-black text-[#251408]">美味蟹堡出爐！</div>
          </div>
        </div>
        <div class="h-2 w-full bg-gradient-to-r from-[#00B4D8] via-[#FFD166] to-[#FF85A1] rounded-full border border-[#251408]"></div>
      </div>`
  },
  'view-map': {
    bgClass: 'scene-bg-map', tag: 'BIKINI BOTTOM LINE • 比奇堡全島地圖',
    title: '比奇堡全島巡禮', tip: '累積營業星數可開啟三階段神秘沉船寶箱，領取大量金幣與抽卡券！',
    icon: '🗺️', accent: 'from-[#FFAE6B] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF3D6] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🗺️</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#D84315]">TREASURE HUNT</div>
            <div class="text-lg font-black text-[#251408]">比奇堡全島尋寶</div>
          </div>
        </div>
      </div>`
  },
  'view-gacha': {
    bgClass: 'scene-bg-gacha', tag: 'TREASURE CHEST • 沉船神秘寶箱',
    title: '沉船神秘藏寶箱', tip: '使用深海抽卡券轉動鐵舵，隨機獲得稀有深海飾品與增益秘寶！',
    icon: '🎰', accent: 'from-[#E1BEE7] to-[#CE93D8]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#F3E5F5] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🏴‍☠️</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#7B1FA2]">SECRET TREASURE</div>
            <div class="text-lg font-black text-[#251408]">沉船寶藏開啟！</div>
          </div>
        </div>
      </div>`
  },
  'view-shop': {
    bgClass: 'scene-bg-shop', tag: 'KITCHEN UPGRADE • 蟹堡廚房設備改造',
    title: '蟹堡廚房設備改造', tip: '升級超大煎板與深海冷藏水箱，能提升出餐獎勵金幣與技能效率！',
    icon: '⚙️', accent: 'from-[#B2DFDB] to-[#80CBC4]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#E0F2F1] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🍳</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#00695C]">GRILL UPGRADE</div>
            <div class="text-lg font-black text-[#251408]">廚房設備大升級</div>
          </div>
        </div>
      </div>`
  },
  'view-quests': {
    bgClass: 'scene-bg-quests', tag: 'KRAB CONTRACT • 蟹老闆每日契約',
    title: '蟹老闆每日契約委託', tip: '完成打卡集章與委託挑戰，領取滿滿金幣與深海珍珠獎勵！',
    icon: '📋', accent: 'from-[#B3E5FC] to-[#81D4FA]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#E1F5FE] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">📜</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#0277BD]">DAILY CONTRACT</div>
            <div class="text-lg font-black text-[#251408]">簽訂每日合約</div>
          </div>
        </div>
      </div>`
  }
};
