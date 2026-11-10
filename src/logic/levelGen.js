// ============================================================
// 📦 src/logic/levelGen.js — 300 關休閒舒壓難度曲線配置
// ============================================================
//
// 職責：依關卡編號產生關卡配置（充裕時間、舒適層數、少冰霜、多留空位）
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
  const rows = 4;
  const shelfCount = 12;
  const totalSlots = shelfCount * 3; // 36 格

  // 🌿 難度全面調降 1：商品縱深層數大幅放緩
  // 第 1~40 關維持 2 層（輕快好上手），第 41~140 關為 3 層，第 141~300 關才進入 4 層
  const depthPerSlot = safeLevelId >= 141 ? 4 : (safeLevelId >= 41 ? 3 : 2);
  const rawCapacity = totalSlots * depthPerSlot;

  // 🌿 難度全面調降 2：預留充足空位（前排至少空出 6~9 格），移動商品更自由不卡死
  const emptyBuffer = safeLevelId <= 30 ? 9 : 6;
  const totalItems = Math.max(18, Math.floor((rawCapacity - emptyBuffer) / 3) * 3);
  const matchTriplets = totalItems / 3;

  // 洗牌商品定義池
  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 🌿 難度全面調降 3：減少同場商品花色種類，讓相同商品更容易湊成三連
  // 第 1~10 關僅 4~5 種花色，隨關卡緩步增加，滿上限最多 9 種
  const varietyCount = Math.min(pool.length, Math.min(9, 4 + Math.floor(safeLevelId / 12)));
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

  // 🌿 難度全面調降 4：冰封障礙大幅減少
  // 第 1~10 關 0 冰塊；11 關後緩慢增加，最多不超過 4 格冰塊
  const iceCount = safeLevelId <= 10 ? 0 : Math.min(4, Math.floor((safeLevelId - 5) / 15));
  const moves = 999;

  // 🌿 難度全面調降 5：1~300 關超寬裕倒數時間（150 秒 ～ 保底 105 秒）
  // 第 1~5 關高達 150 秒 (2分30秒)，每 5 關僅微減 0.5 秒，第 300 關依然保底 105 秒！
  const tier = Math.floor((safeLevelId - 1) / 5); // 0 ~ 59
  const baseTimer = Math.max(105, 150 - tier * 0.5);
  const shelfBonus = (safeShelfLv - 1) * 3;
  const timeLimit = Math.round(baseTimer + shelfBonus);

  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = Math.min(uniqueTypes.length, safeLevelId >= 15 ? 3 : 2);
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
    timeLimit,
    orders
  };
}
