// ============================================================
// 💾 src/state/GameState.js — 遊戲狀態管理（含深層合併與防損毀保護）
// ============================================================
//
// 職責：儲存所有玩家進度（金幣、關卡、升級、庫存、委託與集章）
//
// 對外提供：
//   - GameState  狀態物件（含 load / save / reset 方法）
// ============================================================

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
  ],
  lastCheckIn: null,
  checkInStreak: 0,
  hasCheckedInToday: false
};

function safeInt(val, fallback, min = 0) {
  const num = Number(val);
  return Number.isFinite(num) ? Math.max(min, Math.floor(num)) : fallback;
}

function cloneDefaultQuests() {
  return DEFAULT_STATE.quests.map((q) => ({ ...q }));
}

export const GameState = {
  unlockedLevel: DEFAULT_STATE.unlockedLevel,
  coins: DEFAULT_STATE.coins,
  diamonds: DEFAULT_STATE.diamonds,
  vouchers: DEFAULT_STATE.vouchers,
  direction: DEFAULT_STATE.direction,
  stars: {},
  totalDishesCleared: DEFAULT_STATE.totalDishesCleared,
  gachaPity: DEFAULT_STATE.gachaPity,
  stampCount: DEFAULT_STATE.stampCount,
  milestonesClaimed: {},
  decorsUnlocked: { ...DEFAULT_STATE.decorsUnlocked },
  upgrades: { ...DEFAULT_STATE.upgrades },
  boosters: { ...DEFAULT_STATE.boosters },
  quests: cloneDefaultQuests(),

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
      this.milestonesClaimed = (parsed.milestonesClaimed && typeof parsed.milestonesClaimed === 'object')
        ? { ...parsed.milestonesClaimed }
        : {};
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
      this.lastCheckIn = parsed.lastCheckIn || null;
      this.checkInStreak = safeInt(parsed.checkInStreak, 0);
      this.hasCheckedInToday = Boolean(parsed.hasCheckedInToday);
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
        lastCheckIn: this.lastCheckIn,
        checkInStreak: this.checkInStreak,
        hasCheckedInToday: this.hasCheckedInToday,
        
        lastSavedAt: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (err) {
      // iOS 無痕模式或儲存空間滿時靜默略過，不中斷遊戲運行
      console.warn('[GameState] 寫入存檔略過:', err);
    }
  },

  reset() {
    this.unlockedLevel = DEFAULT_STATE.unlockedLevel;
    this.coins = DEFAULT_STATE.coins;
    this.diamonds = DEFAULT_STATE.diamonds;
    this.vouchers = DEFAULT_STATE.vouchers;
    this.direction = DEFAULT_STATE.direction;
    this.stars = {};
    this.totalDishesCleared = DEFAULT_STATE.totalDishesCleared;
    this.gachaPity = DEFAULT_STATE.gachaPity;
    this.stampCount = DEFAULT_STATE.stampCount;
    this.milestonesClaimed = {};
    this.decorsUnlocked = { ...DEFAULT_STATE.decorsUnlocked };
    this.upgrades = { ...DEFAULT_STATE.upgrades };
    this.boosters = { ...DEFAULT_STATE.boosters };
    this.quests = cloneDefaultQuests();
    this.save();
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
