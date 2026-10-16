// ============================================================
// 📦 src/config/sceneThemes.js — 場景主題
// ============================================================
//
// 職責：定義各畫面的轉場動畫與說明文字
//
// 對外提供：
//   - SCENE_THEMES  以 view id 為 key 的主題資料
//
// 依賴：
//   - ../render/mascot.js（AnimeMascot，用於轉場中的頭像）
//
// 修改須知：
//   ⚠️ key 必須對應 index.html 中 <section id="view-xxx">
//   ⚠️ bgClass 必須對應 main.css 的 .scene-bg-xxx
//   ✅ 只改 title / tip → 直接改
//   ✅ 只改 tag / icon  → 直接改
//
// 常見修改場景：
//   1. 改轉場文案   → 改 title / tip / tag
//   2. 改轉場 icon  → 改 icon（emoji）
//   3. 改背景樣式   → 改 bgClass（同時要改 CSS）
// ============================================================

import { AnimeMascot } from '../render/mascot.js';

export const SCENE_THEMES = {
  'view-lobby': {
    bgClass: 'scene-bg-lobby', tag: 'NOREN CURTAIN • 歡迎光臨星野和風マルシェ',
    title: '星野總店 • 迎賓大廳', tip: '點擊中央的星野葵或下方人氣旬味櫥窗，可聽取今日手作料理介紹喔♪',
    icon: '🏮', accent: 'from-[#FF85A1] to-[#FFAE6B]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFFDF7] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full h-4 noren-stripes rounded border border-[#4A3326]"></div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-bounce">🌸</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#D94E67]">いらっしゃいませ！</div>
            <div class="text-lg font-black text-[#4A3326]">和風暖簾掀開中</div>
          </div>
        </div>
        <div class="text-[9px] font-black text-[#8C583A] text-center">HOSHINO WASHOKU MARCHÉ</div>
      </div>`
  },
  'view-game': {
    bgClass: 'scene-bg-game', tag: 'OPEN FOR BUSINESS • 本日旬味上架',
    title: '檜木和食陳列專區', tip: '將 3 份相同手繪料理擺入同一木櫃即可完售，集滿繁盛熱度還可觸發 FEVER 獎勵！',
    icon: '🍱', accent: 'from-[#FF9E7D] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="w-full py-1 bg-[#FFF3B0] text-[#4A3326] font-black text-[10px] text-center rounded-lg border border-[#4A3326]">✦ 檜木專櫃開啟 • 營業開始 ✦</div>
        <div class="flex items-center justify-center gap-3 my-auto">
          <span class="text-4xl animate-pulse">🍣</span>
          <div class="text-left">
            <div class="text-xs font-black text-[#D94E67]">FRESH HANDMADE</div>
            <div class="text-lg font-black text-[#4A3326]">手作旬味上架！</div>
          </div>
        </div>
        <div class="h-2 w-full bg-gradient-to-r from-[#FF85A1] via-[#FFD166] to-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-map': {
    bgClass: 'scene-bg-map', tag: 'SHOTENGAI LINE • 商店街路面電車',
    title: '夕陽提燈商店街巡禮', tip: '累積營業星數可開啟上方三階段里程碑寶箱，領取大量星鑽與福引券！',
    icon: '🚃', accent: 'from-[#FFAE6B] to-[#FFD166]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF3D6] anime-border p-3 flex flex-col justify-between relative overflow-hidden shadow-md">
        <div class="flex justify-between items-center text-[10px] font-black text-[#8C583A]">
          <span>🏮 夕陽商店街線</span><span>NEXT ➔ 和風本町</span>
        </div>
        <div class="w-full py-2 px-3 bg-[#A8E6CF] rounded-2xl anime-border flex items-center justify-around my-auto">
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <div class="w-8 h-6 bg-[#FFFDF7] rounded border border-[#4A3326]"></div>
          <span class="text-xl">🚃</span>
        </div>
        <div class="text-[10px] font-black text-[#4A3326] text-center">叮叮電車進站中 • 請留意月台步伐</div>
      </div>`
  },
  'view-gacha': {
    bgClass: 'scene-bg-gacha', tag: 'FUKUBIKI SHRINE • 商店街福引抽獎亭',
    title: '春日櫻花福引轉蛋亭', tip: '每回祈願皆可累積 20% 開運值，集滿 5 次下次祈願必中「特賞」超稀有秘寶！',
    icon: '🎐', accent: 'from-[#FF85A1] to-[#FFB3C6]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF0F5] anime-border p-3 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
        <div class="text-4xl spin-slow mb-1">🌸</div>
        <div class="text-base font-black text-[#4A3326]">福引祈願鈴搖響！</div>
        <div class="text-[10px] font-bold text-[#D94E67] mt-0.5">特賞秘寶大放送中 ✦</div>
      </div>`
  },
  'view-shop': {
    bgClass: 'scene-bg-shop', tag: 'CRAFT CARPENTRY • 職人木工研發室',
    title: '檜木專櫃與設備工坊', tip: '除了改造收銀機與檜木架，還可解鎖店內開運擺設，永久提升全店營收加成！',
    icon: '🪚', accent: 'from-[#6BA368] to-[#A8E6CF]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#F4F9F4] anime-border overflow-hidden flex flex-col justify-between p-3 shadow-md">
        <div class="text-[10px] font-black text-[#3B6E4C] text-center border-b border-[#4A3326]/20 pb-1">✦ 職人木工設計圖 ✦</div>
        <div class="flex items-center justify-center gap-3 px-3 my-auto">
          <span class="text-4xl">🪚</span>
          <div class="text-left">
            <div class="text-[10px] font-black text-[#3B6E4C]">HINOKI CRAFTSMAN</div>
            <div class="text-base font-black text-[#4A3326]">設備工坊修繕中</div>
          </div>
        </div>
        <div class="h-2 w-full bg-[#A8E6CF] rounded-full border border-[#4A3326]"></div>
      </div>`
  },
  'view-quests': {
    bgClass: 'scene-bg-quests', tag: 'MANAGER ROOM • 店長和室業務核定',
    title: '店長室日常委託帳', tip: '蓋滿自治會五格集章卡可領取特別大獎，下方還能鑑賞全 20 款手繪和食圖鑑！',
    icon: '📋', accent: 'from-[#8C583A] to-[#D4A373]',
    renderVisual: () => `
      <div class="w-64 h-36 rounded-3xl bg-[#FFF8EC] anime-border p-3 flex flex-col items-center justify-center relative shadow-md">
        <div class="px-4 py-1.5 rounded-xl border-2 border-[#D94E67] bg-[#FFE5EC] text-[#D94E67] font-black text-base rotate-[-6deg] shadow-sm">💮 店務確認濟</div>
        <div class="text-sm font-black text-[#4A3326] mt-2">正在翻閱今日營業委託帳...</div>
      </div>`
  }
};
