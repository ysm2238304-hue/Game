// ============================================================
// 🎨 src/themes/taiwan/spriteAtlas.js — 台灣小吃精靈圖
// ============================================================
//
// 目前暫時沿用日式料理的圖，透過 SPRITE_REMAP 對照表映射。
// 之後有台灣小吃專屬圖時，把對照表刪掉，改成獨立烘焙即可。
// ============================================================

import { FoodSpriteAtlas as JapaneseAtlas } from '../japanese/spriteAtlas.js';
import { ITEM_DEFS } from './items.js';

const SPRITE_REMAP = {
  'lu-rou-fan':         'onigiri',
  'oyster-omelette':    'tamagoyaki',
  'chicken-cutlet':     'yakitori',
  'boba-milk-tea':      'boba',
  'stinky-tofu':        'tempura',
  'sausage-rice':       'futomaki',
  'popcorn-chicken':    'takoyaki',
  'sweet-potato-ball':  'dango',
  'wheel-pie':          'taiyaki',
  'scallion-pancake':   'sando',
  'ba-wan':             'daifuku',
  'gua-bao':            'inari',
  'beef-noodle':        'ramen',
  'dan-zai-noodle':     'ramen',
  'tofu-pudding':       'pudding',
  'mango-shave':        'cake',
  'pineapple-cake':     'taiyaki',
  'sun-cake':           'sando',
  'taro-ball':          'dango',
  'roasted-corn':       'yakitori'
};

export const FoodSpriteAtlas = {
  cache: {},
  initialized: false,
  init() {
    if (this.initialized) return;
    JapaneseAtlas.init();
    for (const def of ITEM_DEFS) {
      const spriteId = SPRITE_REMAP[def.id] || def.id;
      this.cache[def.id] = JapaneseAtlas.cache[spriteId] || JapaneseAtlas.cache['onigiri'];
    }
    this.initialized = true;
  },
  getSparkle(color) {
    return JapaneseAtlas.getSparkle(color);
  }
};
