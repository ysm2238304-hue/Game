// ============================================================
// 💾 src/state/GameState.js — 遊戲狀態管理（進階防損毀與版本遷移版）
// ============================================================
//
// 職責：儲存所有玩家進度，並確保版本更新時舊存檔不會損壞。
// ============================================================

// ⚠️ 只有當你「徹底改變資料結構」且無法合併時，才需要升級這個版號。
// 平常加新功能，只要在 DEFAULT_STATE 加預設值即可，不用改這裡。
import { CloudAuth } from '../auth/firebase.js'; 
const SAVE_KEY = 'HoshinoWashoku_Save_v7'; 

const DEFAULT_STATE = {
  unlockedLevel: 1,
  coins: 1200,
  diamonds: 200,
  vouchers: 8,
  direction: 'rush',
  stars: {},
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
  ]
};

function safeInt(val, fallback, min = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(min, Math.floor(num)) : fallback;
}

function cloneDefaultQuests() {
  return DEFAULT_STATE.quests.map((q) => ({ ...q }));
}

export const GameState = {
  // 初始化為預設值
  ...JSON.parse(JSON.stringify(DEFAULT_STATE)),

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      // 1. 基本數值防呆校驗（防止 NaN 或負數導致畫面異常）
      this.unlockedLevel = safeInt(parsed.unlockedLevel, DEFAULT_STATE.unlockedLevel, 1);
      this.coins = safeInt(parsed.coins, DEFAULT_STATE.coins, 0);
      this.diamonds = safeInt(parsed.diamonds, DEFAULT_STATE.diamonds, 0);
      this.vouchers = safeInt(parsed.vouchers, DEFAULT_STATE.vouchers, 0);
      this.totalDishesCleared = safeInt(parsed.totalDishesCleared, DEFAULT_STATE.totalDishesCleared, 0);
      this.gachaPity = safeInt(parsed.gachaPity, DEFAULT_STATE.gachaPity, 0);
      this.stampCount = safeInt(parsed.stampCount, DEFAULT_STATE.stampCount, 0);

      // 2. 經營方針名稱校驗
      const validDirections = ['rush', 'storage', 'tycoon'];
      this.direction = validDirections.includes(parsed.direction)
        ? parsed.direction
        : DEFAULT_STATE.direction;

      // 3. 巢狀物件深層合併（確保日後新增裝飾、設備或道具時，舊玩家存檔不會缺欄位報錯）
      this.stars = (parsed.stars && typeof parsed.stars === 'object') ? { ...parsed.stars } : {};
      this.milestonesClaimed = (parsed.milestonesClaimed && typeof parsed.milestonesClaimed === 'object') ? { ...parsed.milestonesClaimed } : {};
      this.decorsUnlocked = {
        ...DEFAULT_STATE.decorsUnlocked,
        ...(parsed.decorsUnlocked && typeof parsed.decorsUnlocked === 'object' ? parsed.decorsUnlocked : {})
      };
      this.upgrades = {
        register: safeInt(parsed.upgrades?.register, DEFAULT_STATE.upgrades.register, 1),
        shelf: safeInt(parsed.upgrades?.shelf, DEFAULT_STATE.upgrades.shelf, 1),
        cold: safeInt(parsed.upgrades?.cold, DEFAULT_STATE.upgrades.cold, 1)
      };
      this.boosters = {
        shuffle: safeInt(parsed.boosters?.shuffle, DEFAULT_STATE.boosters.shuffle, 0),
        hammer: safeInt(parsed.boosters?.hammer, DEFAULT_STATE.boosters.hammer, 0),
        magnet: safeInt(parsed.boosters?.magnet, DEFAULT_STATE.boosters.magnet, 0)
      };

      // 4. 委託清單安全合併（保留舊存檔的進度 cur 與 claimed，但同步最新文案與獎勵設定）
      const savedQuests = Array.isArray(parsed.quests) ? parsed.quests : [];
      this.quests = DEFAULT_STATE.quests.map((defQuest) => {
        const found = savedQuests.find((sq) => sq && sq.id === defQuest.id);
        if (!found) return { ...defQuest };
        return {
          ...defQuest,
          cur: safeInt(found.cur, 0, 0),
          claimed: Boolean(found.claimed)
        };
      });

    } catch (err) {
      console.warn('[GameState] 讀取存檔失敗，已自動回退至預設狀態:', err);
    }
  },

  save() {
    try {
      const payload = {
        unlockedLevel: this.unlockedLevel,
        coins: this.coins,
        diamonds: this.diamonds,
        vouchers: this.vouchers,
        direction: this.direction,
        stars: this.stars,
        totalDishesCleared: this.totalDishesCleared,
        gachaPity: this.gachaPity,
        stampCount: this.stampCount,
        milestonesClaimed: this.milestonesClaimed,
        decorsUnlocked: this.decorsUnlocked,
        upgrades: this.upgrades,
        boosters: this.boosters,
        quests: this.quests,
        lastSavedAt: Date.now()
      };
      
      // 1. 存到手機本機 (localStorage)
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));

      // 2. 自動上傳到雲端 (Firebase)
      CloudAuth.saveToCloud(payload); 

    } catch (err) {
      console.warn('[GameState] 寫入存檔略過:', err);
    }
  }
};

// ==========================================
// 🛡️ iOS / 行動端生命週期自動存檔防護
// ==========================================
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      GameState.save();
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    GameState.save();
  });
}
