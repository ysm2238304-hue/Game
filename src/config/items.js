// ============================================================
// 📦 src/config/items.js — 比奇堡高糖分美味甜點快餐 (Dopamine Edition)
// ============================================================

export const ITEM_DEFS = [
  { id: 'onigiri',    name: '巨無霸熔岩起司美味蟹堡', label: '美味蟹堡',   price: '¥280', desc: '金黃蓬鬆芝麻包夾入爆汁厚切肉排、流淌起司與鮮脆生菜！' },
  { id: 'sushi',      name: '發光霓虹水母果醬罐',     label: '水母果醬',   price: '¥320', desc: '晶瑩剔透如果凍般的水母果醬，表面帶著閃閃發光的星星高光！' },
  { id: 'ramen',      name: '微笑金黃波浪脆薯條',     label: '微笑薯條',   price: '¥180', desc: '鮮紅微笑快餐盒裝滿金黃現炸粗切波浪薯條，香脆無比！' },
  { id: 'tamagoyaki', name: '草莓彩虹糖霜甜甜圈',     label: '草莓甜甜圈', price: '¥150', desc: '圓滾滾金黃烤甜甜圈，淋滿發光泡泡糖粉紅草莓淋醬與彩虹糖針！' },
  { id: 'takoyaki',   name: '櫻桃聖代浮樂朵可樂杯',   label: '漂浮可樂',   price: '¥200', desc: '亮天藍杯裝滿清涼氣泡蘇打，頂部擠著高高的香草冰淇淋與鮮紅櫻桃！' },
  { id: 'yakitori',   name: '雙色水母螺旋冰淇淋',     label: '雙色甜筒',   price: '¥160', desc: '香脆華夫甜筒頂著粉紅水母與棉花糖藍的雙色夢幻螺旋冰淇淋！' },
  { id: 'pudding',    name: '陽光熱帶柳橙果汁盒',     label: '柳橙果汁',   price: '¥170', desc: '亮橘黃色利樂果汁盒，帶著可愛笑臉圖案與紅白條紋吸管！' },
  { id: 'ikura',      name: '深海牽絲熔岩起司披薩',   label: '起司披薩',   price: '¥360', desc: '黃金三角脆皮披薩切片，滿滿的牽絲熔岩起司與鮮美肉丁！' },
  { id: 'daifuku',    name: '黑糖波霸爆珠奶茶杯',     label: '波霸奶茶',   price: '¥220', desc: '胖胖透明杯裝著濃醇焦糖奶茶，底層堆滿Q彈黑糖爆汁珍珠！' },
  { id: 'inari',      name: '鳳梨千層海綿起司蛋糕',   label: '海綿蛋糕',   price: '¥250', desc: '鳳梨亮黃色多孔海綿蛋糕切片，夾著厚厚鮮奶油與頂級櫻桃！' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}
