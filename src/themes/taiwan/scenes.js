// ============================================================
// 📦 src/themes/taiwan/scenes.js — 場景主題（夜市風）
// ============================================================

export const SCENE_THEMES = {
  'view-lobby': {
    bgClass: 'scene-bg-lobby', tag: 'NIGHT MARKET • 歡迎光臨台灣夜市',
    title: '阿嬤的夜市攤 • 迎賓大廳', tip: '點擊中央的看板娘或下方人氣小吃櫥窗，可聽取今日料理介紹喔！',
    icon: '🏮', accent: 'from-[#FF6B35] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFFDF7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full h-4 noren-stripes rounded border border-[#4A3326]"></div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🏮</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#D94E67]">來喔～來喔！</div>
            <div class="text-lg font-black text-[#4A3326]">夜市燈火通明</div>
          </div>
        </div>
        <div class="text-[9px] font-black text-[#8C583A] text-center">TAIWAN NIGHT MARKET</div>
      </div>`
  },
  'view-game': {
    bgClass: 'scene-bg-game', tag: 'OPEN FOR BUSINESS • 開市啦！',
    title: '夜市攤位陳列區', tip: '將 3 份相同小吃擺入同一攤位即可完售，集滿繁盛熱度還可觸發 FEVER 獎勵！',
    icon: '🍜', accent: 'from-[#FF6B35] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full py-1 bg-[#FFD166] text-[#4A3326] font-black text-[10px] text-center rounded-lg border border-[#4A3326]">✦ 夜市開張 • 人潮湧入 ✦</div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🥟</span>
          <div class="text-left">
            <div class="text-xs font-black text-[#D94E67]">FRESH HANDMADE</div>
            <div class="text-lg font-black text-[#4A3326]">小吃新鮮上架！</div>
          </div>
        </div>
        <div class="h-2 w-full bg-gradient-to-r from-[#FF6B35] via-[#FFD166] to-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-map': {
    bgClass: 'scene-bg-map', tag: 'NIGHT MARKET LINE • 夜市路線',
    title: '台灣夜市巡禮', tip: '累積營業星數可開啟上方三階段里程碑寶箱，領取大量星鑽與福引券！',
    icon: '🛵', accent: 'from-[#FF6B35] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF3D6] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex justify-between items-center text-[10px] font-black text-[#8C583A]">
          <span>🏮 士林夜市</span><span>NEXT ➔ 逢甲夜市</span>
        </div>
        <div class="w-full py-2 px-3 bg-[#FFD166] rounded-2xl anime-border flex items-center justify-around my-auto">
          <span class="text-lg">🍢</span>
          <span class="text-lg">🧋</span>
          <span class="text-lg">🍗</span>
          <span class="text-lg">🛵</span>
        </div>
        <div class="text-[10px] font-black text-[#4A3326] text-center">夜市燈火通明 • 熱鬧滾滾</div>
      </div>`
  },
  'view-gacha': {
    bgClass: 'scene-bg-gacha', tag: 'LUCKY DRAW • 夜市抽獎攤',
    title: '夜市抽抽樂', tip: '每回祈願皆可累積 20% 開運值，集滿 5 次下次祈願必中「特賞」超稀有秘寶！',
    icon: '🎰', accent: 'from-[#FF6B35] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF0F5] anime-border p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
        <div class="text-4xl spin-slow mb-1">🎰</div>
        <div class="text-base font-black text-[#4A3326]">抽抽樂開獎啦！</div>
        <div class="text-[10px] font-bold text-[#D94E67] mt-0.5">大獎等你來拿 ✦</div>
      </div>`
  },
  'view-shop': {
    bgClass: 'scene-bg-shop', tag: 'CRAFT • 夜市攤位改造',
    title: '攤位設備升級', tip: '改造攤車、瓦斯爐與冰箱，永久提升全店營收加成！',
    icon: '🔧', accent: 'from-[#06A77D] to-[#A8E6CF]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#F4F9F4] anime-border overflow-hidden flex flex-col justify-between p-3 shadow-md">
        <div class="text-[10px] font-black text-[#06A77D] text-center border-b border-[#4A3326]/20 pb-1">✦ 攤位改造設計圖 ✦</div>
        <div class="flex items-center justify-center gap-3 px-3 my-auto">
          <span class="text-4xl">🔧</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#06A77D]">STALL UPGRADE</div>
            <div class="text-base font-black text-[#4A3326]">攤車改裝中</div>
          </div>
        </div>
        <div class="h-2 w-full bg-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-quests': {
    bgClass: 'scene-bg-quests', tag: 'BOSS ROOM • 攤商公會業務',
    title: '攤商公會委託帳', tip: '蓋滿公會五格集章卡可領取特別大獎，下方還能鑑賞全 20 款台灣小吃圖鑑！',
    icon: '📋', accent: 'from-[#8C583A] to-[#D4A373]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col items-center justify-center relative shadow-md">
        <div class="px-4 py-1.5 rounded-xl border-2 border-[#D94E67] bg-[#FFE5EC] text-[#D94E67] font-black text-base rotate-[-6deg] shadow-sm">💮 攤商認證</div>
        <div class="text-sm font-black text-[#4A3326] mt-2">正在翻閱今日攤位業績...</div>
      </div>`
  }
};
