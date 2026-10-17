// ============================================================
// 💾 src/state/GameState.js — 遊戲狀態
// ============================================================
//
// 職責：儲存所有玩家進度（金幣、關卡、升級、庫存）
//
// 對外提供：
//   - GameState  狀態物件（含 load / save 方法）
//
// 依賴：無
//
// 修改須知：
//   ⚠️ 改欄位結構時，storage.js 的 SAVE_KEY 版本要 +1
//   ⚠️ 新增欄位 → 記得在 storage.js 的 load 加預設值
//   ✅ 只改初始數值 → 直接改（例如 coins: 1200 → 2000）
//
// 常見修改場景：
//   1. 改初始金幣     → 改 coins
//   2. 改初始星鑽     → 改 diamonds
//   3. 改初始秘技庫存 → 改 boosters
//   4. 改每日步數基準 → 改 upgrades.shelf
// ============================================================

export const GameState = {
  unlockedLevel: 1,
  coins: 1200, diamonds: 200, vouchers: 8,
  direction: 'rush', stars: {},
  totalDishesCleared: 12,
  gachaPity: 0,
  stampCount: 2,
  milestonesClaimed: {},
  decorsUnlocked: { maneki: false, matcha: false, sakura: false },
  upgrades: { register: 1, shelf: 1, cold: 1 },
  boosters: { shuffle: 3, hammer: 2, magnet: 2 },
  quests: [
    { id: 'q1', desc: '完成 2 次木櫃和食全數完售', cur: 0, target: 2, claimed: false, coins: 200, diam: 20 },
    { id: 'q2', desc: '累計達成 6 次料理三連完售', cur: 0, target: 6, claimed: false, coins: 250, diam: 25 },
    { id: 'q3', desc: '在營業中施展 1 次店長秘技', cur: 0, target: 1, claimed: false, coins: 150, diam: 15 }
  ],
  load() {
    try {
      const data = localStorage.getItem('HoshinoWashoku_Save_v7');
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(this, parsed);
        this.milestonesClaimed = parsed.milestonesClaimed || {};
        this.decorsUnlocked = parsed.decorsUnlocked || { maneki: false, matcha: false, sakura: false };
      }
    } catch (e) {}
  },
  save() {
    try {
      localStorage.setItem('HoshinoWashoku_Save_v7', JSON.stringify({
        unlockedLevel: this.unlockedLevel,
        coins: this.coins, diamonds: this.diamonds, vouchers: this.vouchers,
        direction: this.direction, stars: this.stars,
        totalDishesCleared: this.totalDishesCleared,
        gachaPity: this.gachaPity,
        stampCount: this.stampCount,
        milestonesClaimed: this.milestonesClaimed,
        decorsUnlocked: this.decorsUnlocked,
        upgrades: this.upgrades, boosters: this.boosters, quests: this.quests
      }));
    } catch (e) {}
  }
}; // 👈 GameState 物件到這裡結束

// ==========================================
// 🛡️ iOS 可靠自動存檔機制 (直接貼在 GameState 結尾下方)
// ==========================================

// 當玩家切換 App、鎖定螢幕或上滑關閉時，立刻觸發存檔
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    GameState.save();
    console.log('[存檔] 玩家切換背景，已自動儲存進度');
  }
});

// 針對 iOS Safari 的 pagehide 補充防護
window.addEventListener('pagehide', () => {
  GameState.save();
});

// (選用) 避免玩家不小心按到上一頁離開遊戲
// window.addEventListener('beforeunload', (e) => {
//   e.preventDefault();
//   e.returnValue = '';
// });
