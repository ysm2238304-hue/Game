// ============================================================
// 📦 src/logic/levelGen.js — 關卡生成（含參數防呆與主題相容保護）
// ============================================================
//
// 職責：依關卡編號產生關卡配置（步數、層數、冰霜數、訂單）
//
// 對外提供：
//   - generateLevelConfig(levelId, shelfUpgradeLevel)
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

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const safeLevelId = Math.max(1, Math.floor(Number(levelId) || 1));
  const safeShelfLv = Math.max(1, Math.floor(Number(shelfUpgradeLevel) || 1));

  const activeTheme = getActiveTheme();
  const ITEM_DEFS = Array.isArray(activeTheme?.items) && activeTheme.items.length > 0
    ? activeTheme.items
    : [{ id: 'onigiri' }];

  const rng = mulberry32(safeLevelId * 9137 + 101);
  const cols = 3;
  const rows = 3;
  const shelfCount = 9;
  const totalSlots = shelfCount * 3;
  const depthPerSlot = safeLevelId >= 21 ? 4 : (safeLevelId >= 8 ? 3 : 2);
  const rawCapacity = totalSlots * depthPerSlot;
  const totalItems = Math.floor((rawCapacity - 3) / 3) * 3;
  const matchTriplets = totalItems / 3;

  // 洗牌商品定義池
  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const varietyCount = Math.min(pool.length, 6 + Math.floor(safeLevelId / 2));
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

  const iceCount = Math.min(shelfCount - 2, Math.floor((safeLevelId + 1) / 2));
  const moves = 24 + matchTriplets * 2 + (safeShelfLv - 1) * 2;
  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = Math.min(uniqueTypes.length, safeLevelId >= 10 ? 3 : 2);
  const orders = uniqueTypes.slice(0, orderCount).map((id) => ({ id, req: 3, done: 0 }));

  return {
    levelId: safeLevelId,
    rows,
    cols,
    shelfCount,
    depthPerSlot,
    itemPool,
    totalItems,
    iceCount,
    moves,
    orders
  };
}
