// ============================================================
// 📦 src/logic/levelGen.js — 關卡生成
// ============================================================
//
// 職責：依關卡編號產生關卡配置（步數、層數、冰霜數、訂單）
//
// 對外提供：
//   - generateLevelConfig(levelId, shelfUpgradeLevel)
//
// 依賴：
//   - ../config/items.js（ITEM_DEFS）
//
// 修改須知：
//   ⚠️ 改 shelfCount 會影響九宮格版面（目前固定 3×3 = 9）
//   ⚠️ 改 depthPerSlot 會影響難度曲線
//   ✅ 調步數     → 改 moves 計算式
//   ✅ 調冰霜量   → 改 iceCount
//   ✅ 調關卡變化 → 改 varietyCount / orderCount
//
// 常見修改場景：
//   1. 太難        → moves 加常數
//   2. 太簡單      → depthPerSlot 門檻提高
//   3. 加訂單      → orderCount 從 3 改 4
// ============================================================

import { ITEM_DEFS } from '../config/items.js';

function mulberry32(a) {
  return function () {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateLevelConfig(levelId, shelfUpgradeLevel = 1) {
  const rng = mulberry32(levelId * 9137 + 101);
  const cols = 3;
  const rows = 3;
  const shelfCount = 9;
  const totalSlots = shelfCount * 3;
  const depthPerSlot = levelId >= 21 ? 4 : (levelId >= 8 ? 3 : 2);
  const rawCapacity = totalSlots * depthPerSlot;
  const totalItems = Math.floor((rawCapacity - 3) / 3) * 3;
  const matchTriplets = totalItems / 3;

  const pool = [...ITEM_DEFS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const varietyCount = Math.min(pool.length, 6 + Math.floor(levelId / 2));
  const chosenTypes = [];
  for (let i = 0; i < matchTriplets; i++) chosenTypes.push(pool[i % varietyCount].id);

  const itemPool = [];
  chosenTypes.forEach(t => itemPool.push(t, t, t));
  for (let i = itemPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [itemPool[i], itemPool[j]] = [itemPool[j], itemPool[i]];
  }

  const iceCount = Math.min(shelfCount - 2, Math.floor((levelId + 1) / 2));
  const moves = 24 + matchTriplets * 2 + (shelfUpgradeLevel - 1) * 2;
  const uniqueTypes = [...new Set(chosenTypes)];
  const orderCount = levelId >= 10 ? 3 : 2;
  const orders = uniqueTypes.slice(0, orderCount).map(id => ({ id, req: 3, done: 0 }));

  return { levelId, rows, cols, shelfCount, depthPerSlot, itemPool, totalItems, iceCount, moves, orders };
}
