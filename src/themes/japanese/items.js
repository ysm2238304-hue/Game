// ============================================================
// 📦 src/config/items.js — 比奇堡深海美食定義 (Bikini Bottom Edition)
// ============================================================

export const ITEM_DEFS = [
  { id: 'onigiri',    name: '比奇堡經典美味蟹堡',   label: '美味蟹堡',   price: '¥280', desc: '秘傳配方！烘烤芝麻麵包夾入多汁蟹肉排、融化起司與爽脆生菜。' },
  { id: 'sushi',      name: '野生水母果醬玻璃罐',   label: '水母果醬',   price: '¥320', desc: '在水母田親手採集！透亮霓虹粉紫色的深海天然果醬，甜而不膩。' },
  { id: 'ramen',      name: '熱騰騰海藻脆脆薯條',   label: '海藻薯條',   price: '¥180', desc: '經典紅色梯形包裝！現炸酥脆的深海綠海甘藍薯條，唰嘴停不下來。' },
  { id: 'tamagoyaki', name: '小蝸專用蝸牛飼料罐',   label: '小蝸飼料',   price: '¥150', desc: '青綠色金屬圓柱罐頭！小蝸的最愛，富含礦物質與深海鈣質。' },
  { id: 'takoyaki',   name: '海泡發光能量蘇打水',   label: '海泡蘇打',   price: '¥200', desc: '咕嚕嚕冒著氣泡！亮青綠色氣泡蘇打杯，插著紅白條紋吸管。' },
  { id: 'yakitori',   name: '粉紅海星旋轉棒棒糖',   label: '海星棒棒糖', price: '¥160', desc: '派大星推薦！五角海星形狀的粉紅與金黃雙色旋轉硬糖。' },
  { id: 'pudding',    name: '復古錨牌海盜沙士罐',   label: '錨牌沙士',   price: '¥170', desc: '深海老水手最愛！印著生鏽航海鐵錨標誌的復古橘紅碳酸汽水。' },
  { id: 'ikura',      name: '發光粉紅珍珠巨蚌盒',   label: '珍珠大蚌',   price: '¥360', desc: '紫藍色貝殼微張，裡面夾著一顆璀璨發光的粉紅糖果大珍珠。' },
  { id: 'daifuku',    name: '電鰻高壓電能量飲料',   label: '電鰻能量',   price: '¥220', desc: '消光黑金屬罐印著亮黃閃電！喝一口瞬間精力充沛的深海能量飲。' },
  { id: 'inari',      name: '海綿方塊起司蛋糕',     label: '海綿蛋糕',   price: '¥250', desc: '金黃多孔的海綿蛋糕切塊，頂部綴著一顆鮮紅晶亮的糖漬櫻桃。' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}
