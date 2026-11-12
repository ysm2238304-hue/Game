// ============================================================
// 📦 src/logic/levelGen.js — 1~300 關每 10 關階梯式平滑難度平衡系統 (30 階)
// ============================================================
//
// 六大難度區間（每 10 關升 1 階，共 30 階）：
//   - Steps 1~3   (Lv.1-30)   : 新手 1~3 階 (Beginner)
//   - Steps 4~6   (Lv.31-60)  : 簡單 1~3 階 (Easy)
//   - Steps 7~10  (Lv.61-100) : 普通 1~4 階 (Normal)
//   - Steps 11~15 (Lv.101-150): 困難 1~5 階 (Hard)
//   - Steps 16~22 (Lv.151-220): 更困難 1~7 階 (Very Hard)
//   - Steps 23~30 (Lv.221-300): 地獄 1~8 階 (Hell)
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
  const tierStep = Math.min(30, Math.ceil(lv / 10));

  if (tierStep <= 3) {
    const sub = tierStep; // 1~3
    return {
      key: 'beginner',
      tierStep,
      label: `新手 ${sub}階`,
      badgeText: `✦ 新手 ${sub} 階`,
      colorClass: 'bg-[#A8E6CF] text-[#1B4332] border-[#1B4332]',
      rewardMult: Number((1.0 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 4,
      comboBonusSec: 5
    };
  }
  if (tierStep <= 6) {
    const sub = tierStep - 3; // 1~3
    return {
      key: 'easy',
      tierStep,
      label: `簡單 ${sub}階`,
      badgeText: `✦ 簡單 ${sub} 階`,
      colorClass: 'bg-[#90E0EF] text-[#03045E] border-[#03045E]',
      rewardMult: Number((1.15 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 3.5,
      comboBonusSec: 4.5
    };
  }
  if (tierStep <= 10) {
    const sub = tierStep - 6; // 1~4
    return {
      key: 'normal',
      tierStep,
      label: `普通 ${sub}階`,
      badgeText: `✦ 普通 ${sub} 階`,
      colorClass: 'bg-[#FFE082] text-[#251408] border-[#251408]',
      rewardMult: Number((1.3 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (tierStep <= 15) {
    const sub = tierStep - 10; // 1~5
    return {
      key: 'hard',
      tierStep,
      label: `困難 ${sub}階`,
      badgeText: `✦ 困難 ${sub} 階`,
      colorClass: 'bg-[#FFB703] text-[#251408] border-[#251408]',
      rewardMult: Number((1.5 + (sub - 1) * 0.06).toFixed(2)),
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (tierStep <= 22) {
    const sub = tierStep - 15; // 1~7
    return {
      key: 'very_hard',
      tierStep,
      label: `更困難 ${sub}階`,
      badgeText: `✦ 更困難 ${sub} 階`,
      colorClass: 'bg-[#FB8500] text-white border-[#251408]',
      rewardMult: Number((1.8 + (sub - 1) * 0.06).toFixed(2)),
      baseBonusSec: 2.5,
      comboBonusSec: 3.5
    };
  }
  const sub = tierStep - 22; // 1~8
  return {
    key: 'hell',
    tierStep,
    label: `地獄 ${sub}階`,
    badgeText: `✦ 地獄 ${sub} 階`,
    colorClass: 'bg-[#E63946] text-white border-[#FFE082]',
    rewardMult: Number((2.2 + (sub - 1) * 0.08).toFixed(2)),
    baseBonusSec: 2,
    comboBonusSec: 3.5
  };
}

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const safeLevelId = Math.max(1, Math.floor(Number(levelId) || 1));
  const safeShelfLv = Math.max(1, Math.floor(Number(shelfUpgradeLevel) || 1));
  const tierStep = Math.min(30, Math.ceil(safeLevelId / 10));
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

  if (tierStep <= 3) {
    // 🌱 Steps 1~3 (Lv.1-30)：新手 1~3 階
    const p = (tierStep - 1) / 2; // 0, 0.5, 1
    depthPerSlot = 2;
    emptyBuffer = 9;
    frontEmptySlots = 5;
    varietyCount = tierStep === 1 ? 4 : 5;
    iceCount = 0;
    iceHp = 1;
    baseTimer = Math.round(150 - p * 14); // 150s -> 136s
  } else if (tierStep <= 6) {
    // 🍀 Steps 4~6 (Lv.31-60)：簡單 1~3 階
    const p = (tierStep - 4) / 2; // 0, 0.5, 1
    depthPerSlot = tierStep === 4 ? 2 : 3; // Lv.31-40 為 2 層，Lv.41-60 為 3 層
    emptyBuffer = 9;
    frontEmptySlots = 4;
    varietyCount = tierStep <= 5 ? 5 : 6;
    iceCount = tierStep === 4 ? 1 : 2;
    iceHp = 1;
    baseTimer = Math.round(132 - p * 10); // 132s -> 122s
  } else if (tierStep <= 10) {
    // ⚓ Steps 7~10 (Lv.61-100)：普通 1~4 階
    const p = (tierStep - 7) / 3; // 0 ~ 1
    depthPerSlot = 3;
    emptyBuffer = 6;
    frontEmptySlots = tierStep <= 8 ? 4 : 3;
    varietyCount = tierStep <= 8 ? 6 : 7;
    iceCount = tierStep <= 8 ? 2 : 3;
    iceHp = 1;
    baseTimer = Math.round(120 - p * 12); // 120s -> 108s
  } else if (tierStep <= 15) {
    // 🔥 Steps 11~15 (Lv.101-150)：困難 1~5 階
    const p = (tierStep - 11) / 4; // 0 ~ 1
    depthPerSlot = tierStep <= 13 ? 3 : 4; // Lv.101-130 為 3 層，Lv.131-150 為 4 層
    emptyBuffer = 6;
    frontEmptySlots = 3;
    varietyCount = tierStep <= 12 ? 7 : 8;
    iceCount = tierStep <= 12 ? 3 : 4;
    iceHp = 1;
    baseTimer = Math.round(105 - p * 10); // 105s -> 95s
  } else if (tierStep <= 22) {
    // ⚡ Steps 16~22 (Lv.151-220)：更困難 1~7 階
    const p = (tierStep - 16) / 6; // 0 ~ 1
    depthPerSlot = 4;
    emptyBuffer = 6;
    frontEmptySlots = 3;
    varietyCount = tierStep <= 18 ? 8 : 9;
    iceCount = 4 + Math.round(p * 2); // 4 ~ 6 格
    iceHp = 2;
    baseTimer = Math.round(94 - p * 10); // 94s -> 84s
  } else {
    // 🏴‍☠️ Steps 23~30 (Lv.221-300)：地獄 1~8 階
    const p = Math.min(1, (tierStep - 23) / 7); // 0 ~ 1
    depthPerSlot = 4;
    emptyBuffer = 3;
    frontEmptySlots = 2;
    varietyCount = tierStep <= 25 ? 9 : 10;
    iceCount = 6 + Math.round(p * 2); // 6 ~ 8 格
    iceHp = 2;
    baseTimer = Math.round(82 - p * 12); // 82s -> 70s
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
    tierStep,
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
