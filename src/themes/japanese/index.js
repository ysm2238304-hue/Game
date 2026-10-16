// ============================================================
// 🏮 src/themes/japanese/index.js — 日式主題入口
// ============================================================

import { ITEM_DEFS } from './items.js';
import { SHELF_THEMES } from './shelfThemes.js';
import { SCENE_THEMES } from './scenes.js';
import { GUIDE_DATA } from './guides.js';
import { SHOP_DECORS } from './decors.js';
import { MAP_MILESTONES } from './milestones.js';
import { AnimeMascot } from './mascot.js';
import { FoodSpriteAtlas } from './spriteAtlas.js';
import { TEXT } from './text.js';
import { COLORS } from './colors.js';

export const japanese = {
  id: 'japanese',
  name: '和風食堂',
  description: '手作和食與療癒商店街物語',
  items: ITEM_DEFS,
  shelfThemes: SHELF_THEMES,
  scenes: SCENE_THEMES,
  guides: GUIDE_DATA,
  decors: SHOP_DECORS,
  milestones: MAP_MILESTONES,
  mascot: AnimeMascot,
  spriteAtlas: FoodSpriteAtlas,
  text: TEXT,
  colors: COLORS
};
