// ============================================================
// 📦 src/logic/levelGen.js — 1~300 關「每 10 關一階」微階梯難度引擎 (v96)
// ============================================================

import { getActiveTheme } from '../themes/index.js';

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getDifficultyTierInfo(levelId) {
  const lv = Math.max(1, Math.floor(Number(levelId) || 1));
  const tierStep = Math.min(30, Math.ceil(lv / 10)); // 1 ~ 30 階

  if (tierStep <= 3) {
    return {
      tierStep,
      label: `新手 ${tierStep} 階`,
      badgeText: `新手探索 (第 ${tierStep} 階)`,
      colorClass: 'bg-[#A8E6CF] text-[#1B4332] border-[#1B4332]',
      rewardMult: 1.0 + (tierStep - 1) * 0.05,
      baseBonusSec: 4,
      comboBonusSec: 5
    };
  }
  if (tierStep <= 6) {
    return {
      tierStep,
      label: `簡單 ${tierStep - 3} 階`,
      badgeText: `初階上手 (第 ${tierStep} 階)`,
      colorClass: 'bg-[#90E0EF] text-[#03045E] border-[#03045E]',
      rewardMult: 1.15 + (tierStep - 4) * 0.05,
      baseBonusSec: 3.5,
      comboBonusSec: 4.5
    };
  }
  if (tierStep <= 10) {
    return {
      tierStep,
      label: `普通 ${tierStep - 6} 階`,
      badgeText: `熟練店長 (第 ${tierStep} 階)`,
      colorClass: 'bg-[#FFE082] text-[#251408] border-[#251408]',
      rewardMult: 1.3 + (tierStep - 7) * 0.05,
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (tierStep <= 15) {
    return {
      tierStep,
      label: `困難 ${tierStep - 10} 階`,
      badgeText: `進階挑戰 (第 ${tierStep} 階)`,
      colorClass: 'bg-[#FFB703] text-[#251408] border-[#251408]',
      rewardMult: 1.5 + (tierStep - 11) * 0.06,
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (tierStep <= 22) {
    return {
      tierStep,
      label: `更困難 ${tierStep - 15} 階`,
      badgeText: `高手專區 (第 ${tierStep} 階)`,
      colorClass: 'bg-[#FB8500] text-white border-[#251408]',
      rewardMult: 1.8 + (tierStep - 16) * 0.06,
      baseBonusSec: 2.5,
      comboBonusSec: 3.5
    };
  }
  return {
    tierStep,
    label: `地獄 ${tierStep - 22} 階`,
    badgeText: `大師殿堂 (第 ${tierStep} 階)`,
    colorClass: 'bg-[#E63946] text-white border-[#FFE082]',
    rewardMult: 2.2 + (tierStep - 23) * 0.08,
    baseBonusSec: 2,
    comboBonusSec: 3.5
  };
}

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const safeLevelId = Math.max(1, Math.floor(Number(levelId) || 1));
  const safeShelfLv = Math.max(1, Math.floor(Number(shelfUpgradeLevel) || 1));
  const tierInfo = getDifficultyTierInfo(safeLevelId);
  const tierStep = tierInfo.tierStep; // 1 ~ 30

  const activeTheme = getActiveTheme();
  const ITEM_DEFS = Array.isArray(activeTheme?.items) && activeTheme.items.length > 0
    ? activeTheme.items
    : [{ id: 'onigiri' }];

  const rng = mulberry32(safeLevelId * 9137 + 101);
  const cols = 3;
  const rows = 4;
  const shelfCount = 12;
  const totalSlots = shelfCount * 3; // 36 格

  // 1. 每 10 關層數平滑遞增
  const depthPerSlot = tierStep >= 14 ? 4 : (tierStep >= 5 ? 3 : 2);

  // 2. 前排預留騰挪空位
  const frontEmptySlots = tierStep <= 3 ? 5 : (tierStep <= 10 ? 4 : (tierStep <= 22 ? 3 : 2));
  const emptyBuffer = frontEmptySlots * depthPerSlot;

  // 3. 商品花色種類（隨階梯穩步增加，最大 10 種）
  const varietyCount = Math.min(ITEM_DEFS.length, Math.min(10, 4 + Math.floor((tierStep - 1) / 3.2)));

  // 4. 冰塊數量與血量
  let iceCount = 0;
  let iceHp = 1;
  if (tierStep >= 4) {
    iceCount = Math.min(8, Math.floor(1 + (tierStep - 4) * 0.28));
    iceHp = tierStep >= 16 ? 2 : 1;
  }

  // 5. 倒數秒數（150s 平緩遞減至 70s）
  const baseTimer = Math.round(150 - (tierStep - 1) * 2.75);
  const shelfBonus = (safeShelfLv - 1) * 3;
  const timeLimit = Math.max(70, baseTimer + shelfBonus);

  const rawCapacity = totalSlots * depthPerSlot;
  const totalItems = Math.max(18, Math.floor((rawCapacity - emptyBuffer) / 3) * 3);
  const matchTriplets = totalItems / 3;

  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const chosenTypes = [];
  for (let i = 0; i < matchTriplets; i++) {
    chosenTypes.push(pool[i % varietyCount].id);
  }

  const itemPool = [];
  chosenTypes.forEach((t) => itemPool.push(t, t, t));
  for (let i = itemPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [itemPool[i], itemPool[j]] = [itemPool[j], itemPool[i]];
  }

  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = Math.min(uniqueTypes.length, tierStep >= 4 ? 3 : 2);
  const orders = uniqueTypes.slice(0, orderCount).map((id) => ({ id, req: 3, done: 0 }));

  return {
    levelId: safeLevelId,
    tierInfo,
    tierStep,
    rows,
    cols,
    shelfCount,
    depthPerSlot,
    frontEmptySlots,
    itemPool,
    totalItems,
    iceCount,
    iceHp,
    moves: 999,
    timeLimit,
    orders
  };
}
