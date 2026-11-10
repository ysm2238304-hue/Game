// ============================================================
// 📦 src/logic/levelGen.js — 1~300 關六大階梯式難度平衡系統
// ============================================================
//
// 六大難度階梯：
//   - 1~50 關   : 新手 (Beginner)
//   - 51~100 關 : 簡單 (Easy)
//   - 101~150 關: 普通 (Normal)
//   - 151~200 關: 困難 (Hard)
//   - 201~250 關: 更困難 (Very Hard)
//   - 251~300 關: 地獄 (Hell)
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
  if (lv <= 50) {
    return {
      key: 'beginner',
      label: '新手',
      badgeText: '✦ 新手理貨區',
      colorClass: 'bg-[#A8E6CF] text-[#1B4332] border-[#1B4332]',
      rewardMult: 1.0,
      baseBonusSec: 4,
      comboBonusSec: 5
    };
  }
  if (lv <= 100) {
    return {
      key: 'easy',
      label: '簡單',
      badgeText: '✦ 簡單理貨區',
      colorClass: 'bg-[#90E0EF] text-[#03045E] border-[#03045E]',
      rewardMult: 1.15,
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (lv <= 150) {
    return {
      key: 'normal',
      label: '普通',
      badgeText: '✦ 普通理貨區',
      colorClass: 'bg-[#FFE082] text-[#251408] border-[#251408]',
      rewardMult: 1.3,
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (lv <= 200) {
    return {
      key: 'hard',
      label: '困難',
      badgeText: '✦ 困難挑戰區',
      colorClass: 'bg-[#FFB703] text-[#251408] border-[#251408]',
      rewardMult: 1.5,
      baseBonusSec: 2,
      comboBonusSec: 3
    };
  }
  if (lv <= 250) {
    return {
      key: 'very_hard',
      label: '更困難',
      badgeText: '✦ 更困難深水區',
      colorClass: 'bg-[#FB8500] text-white border-[#251408]',
      rewardMult: 1.8,
      baseBonusSec: 2,
      comboBonusSec: 3
    };
  }
  return {
    key: 'hell',
    label: '地獄',
    badgeText: '✦ 地獄殿堂區',
    colorClass: 'bg-[#E63946] text-white border-[#FFE082]',
    rewardMult: 2.2,
    baseBonusSec: 2,
    comboBonusSec: 3
  };
}

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const safeLevelId = Math.max(1, Math.floor(Number(levelId) || 1));
  const safeShelfLv = Math.max(1, Math.floor(Number(shelfUpgradeLevel) || 1));
  const tierInfo = getDifficultyTierInfo(safeLevelId);

  const activeTheme = getActiveTheme();
  const ITEM_DEFS = Array.isArray(activeTheme?.items) && activeTheme.items.length > 0
    ? activeTheme.items
    : [{ id: 'onigiri' }];

  const rng = mulberry32(safeLevelId * 9137 + 101);
  const cols = 3;
  const rows = 4;
  const shelfCount = 12;
  const totalSlots = shelfCount * 3; // 36 格

  let depthPerSlot = 2;
  let emptyBuffer = 9;
  let frontEmptySlots = 5;
  let varietyCount = 4;
  let iceCount = 0;
  let iceHp = 1;
  let baseTimer = 150;

  if (safeLevelId <= 50) {
    // 🌱 1-50 關：新手 (Beginner)
    const p = (safeLevelId - 1) / 49; // 0 ~ 1
    depthPerSlot = 2;
    emptyBuffer = 9;
    frontEmptySlots = 5;
    varietyCount = safeLevelId <= 20 ? 4 : 5;
    iceCount = 0;
    iceHp = 1;
    baseTimer = Math.round(150 - p * 10); // 150s -> 140s
  } else if (safeLevelId <= 100) {
    // 🍀 51-100 關：簡單 (Easy)
    const p = (safeLevelId - 51) / 49;
    depthPerSlot = safeLevelId <= 75 ? 2 : 3;
    emptyBuffer = 9;
    frontEmptySlots = 4;
    varietyCount = safeLevelId <= 75 ? 5 : 6;
    iceCount = safeLevelId <= 70 ? 1 : 2;
    iceHp = 1;
    baseTimer = Math.round(135 - p * 10); // 135s -> 125s
  } else if (safeLevelId <= 150) {
    // ⚓ 101-150 關：普通 (Normal)
    const p = (safeLevelId - 101) / 49;
    depthPerSlot = 3;
    emptyBuffer = 6;
    frontEmptySlots = 3;
    varietyCount = safeLevelId <= 125 ? 7 : 8;
    iceCount = Math.min(4, 2 + Math.floor(p * 2.5)); // 2 ~ 4 格
    iceHp = 1;
    baseTimer = Math.round(120 - p * 10); // 120s -> 110s
  } else if (safeLevelId <= 200) {
    // 🔥 151-200 關：困難 (Hard)
    const p = (safeLevelId - 151) / 49;
    depthPerSlot = safeLevelId <= 175 ? 3 : 4;
    emptyBuffer = 6;
    frontEmptySlots = 3;
    varietyCount = safeLevelId <= 175 ? 8 : 9;
    iceCount = safeLevelId <= 175 ? 4 : 5;
    iceHp = safeLevelId <= 175 ? 1 : 2;
    baseTimer = Math.round(105 - p * 10); // 105s -> 95s
  } else if (safeLevelId <= 250) {
    // ⚡ 201-250 關：更困難 (Very Hard)
    const p = (safeLevelId - 201) / 49;
    depthPerSlot = 4;
    emptyBuffer = safeLevelId <= 225 ? 6 : 3;
    frontEmptySlots = safeLevelId <= 225 ? 3 : 2;
    varietyCount = safeLevelId <= 220 ? 9 : 10;
    iceCount = Math.min(7, 5 + Math.floor(p * 2.5)); // 5 ~ 7 格
    iceHp = 2;
    baseTimer = Math.round(90 - p * 8); // 90s -> 82s
  } else {
    // 🏴‍☠️ 251-300 關：地獄 (Hell)
    const p = Math.min(1, (safeLevelId - 251) / 49);
    depthPerSlot = 4;
    emptyBuffer = 3;
    frontEmptySlots = 2;
    varietyCount = 10;
    iceCount = Math.min(9, 7 + Math.floor(p * 2.5)); // 7 ~ 9 格
    iceHp = 2;
    baseTimer = Math.round(80 - p * 10); // 80s -> 70s
  }

  varietyCount = Math.min(ITEM_DEFS.length, varietyCount);
  const rawCapacity = totalSlots * depthPerSlot;
  const totalItems = Math.max(18, Math.floor((rawCapacity - emptyBuffer) / 3) * 3);
  const matchTriplets = totalItems / 3;

  // 洗牌商品定義池
  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const chosenTypes = [];
  for (let i = 0; i < matchTriplets; i++) {
    chosenTypes.push(pool[i % varietyCount].id);
  }

  // 每組商品必然以 3 個為倍數放入池中，保證 100% 可完售不卡關
  const itemPool = [];
  chosenTypes.forEach((t) => itemPool.push(t, t, t));
  for (let i = itemPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [itemPool[i], itemPool[j]] = [itemPool[j], itemPool[i]];
  }

  const moves = 999;
  const shelfBonus = (safeShelfLv - 1) * 3;
  const timeLimit = Math.round(baseTimer + shelfBonus);
  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = Math.min(uniqueTypes.length, safeLevelId >= 15 ? 3 : 2);
  const orders = uniqueTypes.slice(0, orderCount).map((id) => ({ id, req: 3, done: 0 }));

  return {
    levelId: safeLevelId,
    tierInfo,
    rows,
    cols,
    shelfCount,
    depthPerSlot,
    frontEmptySlots,
    itemPool,
    totalItems,
    iceCount,
    iceHp,
    moves,
    timeLimit,
    orders
  };
}
