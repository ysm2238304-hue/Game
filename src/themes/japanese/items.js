// ============================================================
// 📦 src/themes/japanese/items.js — 日式料理定義（10 款）
// ============================================================

export const ITEM_DEFS = [
  { id: 'onigiri',    name: '雙味海苔御飯糰',     label: '御飯糰',   price: '¥180', desc: '嚴選新潟越光米與脆口有明海苔，人氣No.1招牌！' },
  { id: 'sushi',      name: '極上雙拼握壽司',     label: '握壽司',   price: '¥360', desc: '豐洲直送黑鮪魚赤身與肥美挪威鮭魚雙重享受。' },
  { id: 'ramen',      name: '濃厚豚骨叉燒拉麵',   label: '豚骨拉麵', price: '¥480', desc: '熬煮12小時濃白豚骨湯頭配炙燒梅花叉燒與溏心蛋。' },
  { id: 'tamagoyaki', name: '笹葉厚燒玉子卷',     label: '玉子燒',   price: '¥220', desc: '使用濃郁地雞蛋與柴魚高湯層層慢火煎製。' },
  { id: 'takoyaki',   name: '柴魚躍動章魚燒',     label: '章魚燒',   price: '¥260', desc: '外酥內嫩包裹大塊章魚足，柴魚片隨熱氣起舞！' },
  { id: 'yakitori',   name: '炭火彩蔬燒鳥盛合',   label: '燒鳥串',   price: '¥320', desc: '秘傳焦糖醬汁炭烤雞肉丸與鮮甜大蔥串。' },
  { id: 'inari',      name: '鮭魚親子彩り花卷',   label: '親子花卷', price: '¥350', desc: '鮮嫩鮭魚包裹醋飯與繽紛配料的華麗盛合。' },
  { id: 'ikura',      name: '黃金鮭魚卵軍艦卷',   label: '鮭魚卵',   price: '¥380', desc: '晶瑩剔透的北海道醬漬鮭魚卵，入口爆漿鮮甜！' },
  { id: 'daifuku',    name: '宇治抹茶草莓大福',   label: '草莓大福', price: '¥240', desc: '微苦抹茶麻糬包裹鮮紅欲滴的福岡甘王草莓。' },
  { id: 'pudding',    name: '昭和喫茶焦糖布丁',   label: '焦糖布丁', price: '¥230', desc: '微苦大人味焦糖醬淋在紮實蛋香布丁，頂綴鮮奶油。' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}
