// ============================================================
// 📦 src/config/items.js — 日式超商商品定義 (Convenience Store Edition)
// ============================================================

export const ITEM_DEFS = [
  { id: 'onigiri',    name: '星野海苔三角御飯糰',   label: '三角飯糰',   price: '¥160', desc: '嚴選越光米與脆口海苔，經典超商紅線易撕包裝！' },
  { id: 'sushi',      name: '富士草莓牛乳利樂盒',   label: '草莓牛乳',   price: '¥180', desc: '香甜濃郁的生乳交融草莓香氣，超商必買人氣紙盒飲料。' },
  { id: 'ramen',      name: '大紅碗裝即食豚骨杯麵', label: '豚骨杯麵',   price: '¥240', desc: '宵夜首選！熬煮濃白豚骨湯頭與溏心蛋的經典紅碗即食麵。' },
  { id: 'tamagoyaki', name: '日式薄鹽洋芋片零食袋', label: '洋芋片袋',   price: '¥150', desc: '金黃酥脆的薄切洋芋片，兩端鋸齒膨脹波浪鋁箔包裝。' },
  { id: 'takoyaki',   name: '極上無糖黑咖啡金屬罐', label: '黑咖啡罐',   price: '¥130', desc: '嚴選深焙咖啡豆萃取，消光黑金屬直立圓柱易開罐。' },
  { id: 'yakitori',   name: '宇治無糖綠茶寶特瓶',   label: '綠茶瓶',     price: '¥140', desc: '一番茶萃取冷冽甘甜，帶有細緻凹凸紋理的綠蓋長頸寶特瓶。' },
  { id: 'pudding',    name: '特濃焦糖烤布丁透明杯', label: '焦糖布丁',   price: '¥190', desc: '鵝黃滑嫩布丁淋上深黑琥珀焦糖醬，透明梯形甜點杯。' },
  { id: 'ikura',      name: '蜜柑果汁碳酸易開罐',   label: '蜜柑汽水',   price: '¥160', desc: '和歌山蜜柑果汁微氣泡碳酸飲，鮮豔亮橘圓柱鋁罐。' },
  { id: 'daifuku',    name: '宇治抹茶大福透明盒',   label: '抹茶大福',   price: '¥220', desc: '宇治抹茶麻糬包覆濃醇抹茶餡，透明圓弧吸塑甜點盒。' },
  { id: 'inari',      name: '能量電解質運動補給罐', label: '運動補給罐', price: '¥170', desc: '迅速補充水分與電解質，亮寶藍金屬機能運動飲料。' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}
