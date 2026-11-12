// ============================================================
// 📦 src/logic/levelGen.js — 1~300 關每 10 關階梯難度 ＋ 每 5 關 10 大深海 BOSS 戰系統
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

export const BOSS_ROSTER = [
  {
    id: 'octopus',
    name: '章魚海盜船長・歐克托',
    sprite: './assets/boss/boss-octopus.png',
    filter: '',
    atkIntervalMs: 8400,
    atkDamagePct: 18
  },
  {
    id: 'crab',
    name: '重甲帝王蟹將軍・克勞',
    sprite: './assets/boss/boss-crab.png',
    filter: '',
    atkIntervalMs: 8800,
    atkDamagePct: 20
  },
  {
    id: 'shark',
    name: '深海幽靈鯊王・夏克',
    sprite: './assets/boss/boss-shark.png',
    filter: '',
    atkIntervalMs: 7900,
    atkDamagePct: 21
  },
  {
    id: 'angler',
    name: '深海燈籠魚王・安格勒',
    sprite: './assets/boss/boss-angler.png',
    filter: '',
    atkIntervalMs: 8100,
    atkDamagePct: 21
  },
  {
    id: 'eel',
    name: '雷電海鰻將軍・伏特',
    sprite: './assets/boss/boss-eel.png',
    filter: '',
    atkIntervalMs: 7400,
    atkDamagePct: 22
  },
  {
    id: 'jellyfish',
    name: '劇毒水母女王・梅杜莎',
    sprite: './assets/boss/boss-jellyfish.png',
    filter: '',
    atkIntervalMs: 7700,
    atkDamagePct: 22
  },
  {
    id: 'urchin',
    name: '鋼鐵巨海膽・斯派克',
    sprite: './assets/boss/boss-urchin.png',
    filter: '',
    atkIntervalMs: 8200,
    atkDamagePct: 24
  },
  {
    id: 'whale',
    name: '海盜鐵甲鯨・莫比',
    sprite: './assets/boss/boss-whale.png',
    filter: '',
    atkIntervalMs: 8500,
    atkDamagePct: 25
  },
  {
    id: 'seahorse',
    name: '熔岩海龍騎士・伊格納',
    sprite: './assets/boss/boss-seahorse.png',
    filter: '',
    atkIntervalMs: 7200,
    atkDamagePct: 25
  },
  {
    id: 'orca',
    name: '深淵虎鯨霸主・歐卡',
    sprite: './assets/boss/boss-orca.png',
    filter: '',
    atkIntervalMs: 7000,
    atkDamagePct: 26
  }
];

export function getDifficultyTierInfo(levelId) {
  const lv = Math.max(1, Math.floor(Number(levelId) || 1));
  const tierStep = Math.min(30, Math.ceil(lv / 10));
  const isBoss = lv % 5 === 0;

  if (tierStep <= 3) {
    const sub = tierStep; // 1~3
    return {
      key: 'beginner',
      tierStep,
      isBoss,
      label: isBoss ? `BOSS・新手${sub}階` : `新手 ${sub}階`,
      badgeText: isBoss ? `✦ BOSS 決戰・新手 ${sub} 階` : `✦ 新手 ${sub} 階`,
      colorClass: 'bg-[#A8E6CF] text-[#1B4332] border-[#1B4332]',
      rewardMult: Number((1.0 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 3.5,
      comboBonusSec: 4.5
    };
  }
  if (tierStep <= 6) {
    const sub = tierStep - 3; // 1~3
    return {
      key: 'easy',
      tierStep,
      isBoss,
      label: isBoss ? `BOSS・簡單${sub}階` : `簡單 ${sub}階`,
      badgeText: isBoss ? `✦ BOSS 決戰・簡單 ${sub} 階` : `✦ 簡單 ${sub} 階`,
      colorClass: 'bg-[#90E0EF] text-[#03045E] border-[#03045E]',
      rewardMult: Number((1.15 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 3,
      comboBonusSec: 4
    };
  }
  if (tierStep <= 10) {
    const sub = tierStep - 6; // 1~4
    return {
      key: 'normal',
      tierStep,
      isBoss,
      label: isBoss ? `BOSS・普通${sub}階` : `普通 ${sub}階`,
      badgeText: isBoss ? `✦ BOSS 決戰・普通 ${sub} 階` : `✦ 普通 ${sub} 階`,
      colorClass: 'bg-[#FFE082] text-[#251408] border-[#251408]',
      rewardMult: Number((1.3 + (sub - 1) * 0.05).toFixed(2)),
      baseBonusSec: 2.5,
      comboBonusSec: 3.5
    };
  }
  if (tierStep <= 15) {
    const sub = tierStep - 10; // 1~5
    return {
      key: 'hard',
      tierStep,
      isBoss,
      label: isBoss ? `BOSS・困難${sub}階` : `困難 ${sub}階`,
      badgeText: isBoss ? `✦ BOSS 決戰・困難 ${sub} 階` : `✦ 困難 ${sub} 階`,
      colorClass: 'bg-[#FFB703] text-[#251408] border-[#251408]',
      rewardMult: Number((1.5 + (sub - 1) * 0.06).toFixed(2)),
      baseBonusSec: 2.5,
      comboBonusSec: 3.5
    };
  }
  if (tierStep <= 22) {
    const sub = tierStep - 15; // 1~7
    return {
      key: 'very_hard',
      tierStep,
      isBoss,
      label: isBoss ? `BOSS・更困難${sub}階` : `更困難 ${sub}階`,
      badgeText: isBoss ? `✦ BOSS 決戰・更困難 ${sub} 階` : `✦ 更困難 ${sub} 階`,
      colorClass: 'bg-[#FB8500] text-white border-[#251408]',
      rewardMult: Number((1.8 + (sub - 1) * 0.06).toFixed(2)),
      baseBonusSec: 2,
      comboBonusSec: 3
    };
  }
  const sub = tierStep - 22; // 1~8
  return {
    key: 'hell',
    tierStep,
    isBoss,
    label: isBoss ? `BOSS・地獄${sub}階` : `地獄 ${sub}階`,
    badgeText: isBoss ? `✦ BOSS 決戰・地獄 ${sub} 階` : `✦ 地獄 ${sub} 階`,
    colorClass: 'bg-[#E63946] text-white border-[#FFE082]',
    rewardMult: Number((2.2 + (sub - 1) * 0.08).toFixed(2)),
    baseBonusSec: 1.5,
    comboBonusSec: 2.5
  };
}

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const safeLevelId = Math.max(1, Math.floor(Number(levelId) || 1));
  const safeShelfLv = Math.max(1, Math.floor(Number(shelfUpgradeLevel) || 1));
  const tierStep = Math.min(30, Math.ceil(safeLevelId / 10));
  const isBossLevel = (safeLevelId % 5 === 0);
  const tierInfo = getDifficultyTierInfo(safeLevelId);

  const activeTheme = getActiveTheme();
  const ITEM_DEFS = Array.isArray(activeTheme?.items) && activeTheme.items.length > 0
    ? activeTheme.items
    : [{ id: 'onigiri' }];

  const rng = mulberry32(safeLevelId * 9137 + 101);
  const cols = 3;
  const rows = isBossLevel ? 3 : 4;
  const shelfCount = isBossLevel ? 9 : 12;
  const totalSlots = shelfCount * 3;

  let depthPerSlot = 2;
  let emptyBuffer = 8;
  let frontEmptySlots = 4;
  let varietyCount = 5;
  let iceCount = 0;
  let iceHp = 1;
  let baseTimer = 135;

  if (tierStep <= 3) {
    // 🌱 Steps 1~3 (Lv.1-30)：新手 1~3 階（適度收緊，Lv.21 起出現結霜）
    const p = (tierStep - 1) / 2;
    depthPerSlot = tierStep === 3 ? 3 : 2;
    emptyBuffer = 8;
    frontEmptySlots = tierStep === 1 ? 4 : 3;
    varietyCount = tierStep === 1 ? 5 : 6;
    iceCount = safeLevelId >= 21 ? 1 : 0;
    iceHp = 1;
    baseTimer = Math.round(135 - p * 13);
  } else if (tierStep <= 6) {
    // 🍀 Steps 4~6 (Lv.31-60)：簡單 1~3 階
    const p = (tierStep - 4) / 2;
    depthPerSlot = 3;
    emptyBuffer = 7;
    frontEmptySlots = 3;
    varietyCount = tierStep <= 5 ? 6 : 7;
    iceCount = tierStep === 4 ? 2 : 3;
    iceHp = 1;
    baseTimer = Math.round(118 - p * 10);
  } else if (tierStep <= 10) {
    // ⚓ Steps 7~10 (Lv.61-100)：普通 1~4 階
    const p = (tierStep - 7) / 3;
    depthPerSlot = tierStep >= 9 ? 4 : 3;
    emptyBuffer = 6;
    frontEmptySlots = tierStep >= 9 ? 2 : 3;
    varietyCount = tierStep <= 8 ? 7 : 8;
    iceCount = tierStep <= 8 ? 3 : 4;
    iceHp = 1;
    baseTimer = Math.round(104 - p * 12);
  } else if (tierStep <= 15) {
    // 🔥 Steps 11~15 (Lv.101-150)：困難 1~5 階
    const p = (tierStep - 11) / 4;
    depthPerSlot = 4;
    emptyBuffer = 5;
    frontEmptySlots = tierStep >= 13 ? 2 : 3;
    varietyCount = tierStep <= 12 ? 8 : 9;
    iceCount = tierStep <= 12 ? 4 : 5;
    iceHp = tierStep >= 13 ? 2 : 1;
    baseTimer = Math.round(90 - p * 10);
  } else if (tierStep <= 22) {
    // ⚡ Steps 16~22 (Lv.151-220)：更困難 1~7 階
    const p = (tierStep - 16) / 6;
    depthPerSlot = tierStep >= 19 ? 5 : 4;
    emptyBuffer = 4;
    frontEmptySlots = 2;
    varietyCount = tierStep <= 18 ? 9 : 10;
    iceCount = 5 + Math.round(p);
    iceHp = 2;
    baseTimer = Math.round(78 - p * 10);
  } else {
    // 🏴‍☠️ Steps 23~30 (Lv.221-300)：地獄 1~8 階
    const p = Math.min(1, (tierStep - 23) / 7);
    depthPerSlot = 5;
    emptyBuffer = 3;
    frontEmptySlots = 2;
    varietyCount = 10;
    iceCount = 6 + Math.round(p * 2);
    iceHp = 2;
    baseTimer = Math.round(68 - p * 10);
  }

  let bossInfo = null;
  if (isBossLevel) {
    // 🔥 BOSS 戰 300 關階梯強化：解除過度保護，血量、攻速、傷害與結霜壓力隨關卡同步成長
    const bossProgress = Math.min(1, Math.max(0, (safeLevelId - 5) / 295));
    depthPerSlot = Math.max(3, depthPerSlot);
    emptyBuffer = safeLevelId >= 150 ? 3 : 5;
    frontEmptySlots = safeLevelId >= 200 ? 2 : (safeLevelId >= 100 ? 3 : 4);
    iceCount = Math.min(5, Math.max(1, Math.ceil(tierStep / 5)));
    iceHp = safeLevelId >= 120 ? 2 : 1;

    const bossIdx = Math.floor(safeLevelId / 5 - 1) % BOSS_ROSTER.length;
    const baseBoss = BOSS_ROSTER[bossIdx];
    const matchesNeeded = Math.round(14 + bossProgress * 28); // 1,400 HP -> 4,200 HP
    const bossMaxHp = matchesNeeded * 100;
    const atkIntervalMs = Math.max(4600, Math.round(baseBoss.atkIntervalMs * (1 - bossProgress * 0.42)));
    const atkDamagePct = Math.min(38, Math.round(baseBoss.atkDamagePct * (1 + bossProgress * 0.55)));
    bossInfo = {
      ...baseBoss,
      maxHp: bossMaxHp,
      matchesNeeded,
      atkIntervalMs,
      atkDamagePct,
      freezeOnAttack: safeLevelId >= 50
    };
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
    isBoss: isBossLevel,
    bossInfo,
    tierInfo,
    rows,
    cols,
    shelfCount,
    depthPerSlot,
    frontEmptySlots,
    varietyCount,
    itemPool,
    totalItems,
    iceCount,
    iceHp,
    moves,
    timeLimit,
    orders
  };
}
