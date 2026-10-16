// ============================================================
// 📦 src/config/items.js — 料理定義
// ============================================================
//
// 職責：定義所有手作和食的基本資料（名稱、價格、描述）
//
// 對外提供：
//   - ITEM_DEFS     所有料理（共 20 款）
//   - getItemById  依 id 取得料理物件
//   - getItemLabel 依 id 取得料理顯示標籤
//
// 依賴：無
//
// 修改須知：
//   ⚠️ 新增料理時要同步建立對應的繪圖函式（在 main.js 的
//      FoodSpriteAtlas.bakeHandDrawnFood 中加 case）
//   ⚠️ 刪除料理前確認沒有關卡 / 圖鑑 / 存檔引用
//   ✅ 只改 price / name / desc → 直接改，無副作用
//
// 常見修改場景：
//   1. 調價格     → 改 price 欄位（例如 '¥220' → '¥260'）
//   2. 加新料理   → 陣列末端新增物件，id 不能重複
//   3. 改描述     → 改 desc 欄位
// ============================================================

export const ITEM_DEFS = [
  { id: 'onigiri',    name: '雙味海苔御飯糰',     label: '御飯糰',   price: '¥180', desc: '嚴選新潟越光米與脆口有明海苔，人氣No.1招牌！' },
  { id: 'tamagoyaki', name: '笹葉厚燒玉子卷',     label: '玉子燒',   price: '¥220', desc: '使用濃郁地雞蛋與柴魚高湯層層慢火煎製。' },
  { id: 'sushi',      name: '極上雙拼握壽司',     label: '握壽司',   price: '¥360', desc: '豐洲直送黑鮪魚赤身與肥美挪威鮭魚雙重享受。' },
  { id: 'dango',      name: '花見三色賞月糰子',   label: '三色糰子', price: '¥190', desc: '櫻花、白玉、艾草三色交織的春日軟糯甘味。' },
  { id: 'yakitori',   name: '炭火彩蔬燒鳥盛合',   label: '燒鳥串',   price: '¥320', desc: '秘傳焦糖醬汁炭烤雞肉丸與鮮甜大蔥串。' },
  { id: 'takoyaki',   name: '柴魚躍動章魚燒',     label: '章魚燒',   price: '¥260', desc: '外酥內嫩包裹大塊章魚足，柴魚片隨熱氣起舞！' },
  { id: 'futomaki',   name: '彩蔬厚切太卷壽司',   label: '太卷',     price: '¥280', desc: '飽滿醋飯捲入厚燒玉子、小黃瓜與櫻花魚鬆。' },
  { id: 'tempura',    name: '炸蝦天婦羅花卷',     label: '炸蝦卷',   price: '¥340', desc: '金黃酥脆炸蝦搭配爽脆生菜的豪華花卷壽司。' },
  { id: 'ikura',      name: '黃金鮭魚卵軍艦卷',   label: '鮭魚卵',   price: '¥380', desc: '晶瑩剔透的北海道醬漬鮭魚卵，入口爆漿鮮甜！' },
  { id: 'wakame',     name: '翠綠海藻軍艦壽司',   label: '海藻軍艦', price: '¥200', desc: '胡麻香油涼拌爽脆裙帶菜莖，清爽開胃首選。' },
  { id: 'inari',      name: '鮭魚親子彩り花卷',   label: '親子花卷', price: '¥350', desc: '鮮嫩鮭魚包裹醋飯與繽紛配料的華麗盛合。' },
  { id: 'sando',      name: '黃金玉子燒夾心壽司', label: '玉子夾心', price: '¥250', desc: '雙層超厚切甜味玉子燒夾入微酸壽司醋飯。' },
  { id: 'bento',      name: '木製下駄綜合壽司盛', label: '壽司下駄', price: '¥450', desc: '檜木下駄盛裝主廚嚴選握壽司與軍艦卷豪華組。' },
  { id: 'ramen',      name: '濃厚豚骨叉燒拉麵',   label: '豚骨拉麵', price: '¥480', desc: '熬煮12小時濃白豚骨湯頭配炙燒梅花叉燒與溏心蛋。' },
  { id: 'taiyaki',    name: '十勝紅豆脆皮鯛魚燒', label: '鯛魚燒',   price: '¥210', desc: '現烤薄脆餅皮塞滿綿密北海道十勝紅豆餡。' },
  { id: 'daifuku',    name: '宇治抹茶草莓大福',   label: '草莓大福', price: '¥240', desc: '微苦抹茶麻糬包裹鮮紅欲滴的福岡甘王草莓。' },
  { id: 'pudding',    name: '昭和喫茶焦糖布丁',   label: '焦糖布丁', price: '¥230', desc: '微苦大人味焦糖醬淋在紮實蛋香布丁，頂綴鮮奶油。' },
  { id: 'cake',       name: '北海道鮮奶草莓蛋糕', label: '草莓蛋糕', price: '¥310', desc: '如同初雪般輕盈的北海道生乳鮮奶油與酸甜草莓。' },
  { id: 'oden',       name: '關東煮熱湯三味串',   label: '關東煮',   price: '¥240', desc: '吸飽昆布柴魚高湯的白蘿蔔、蒟蒻與竹輪關東煮。' },
  { id: 'boba',       name: '黑糖珍珠抹茶拿鐵',   label: '抹茶珍奶', price: '¥290', desc: '手刷宇治抹茶交融鮮奶與黑糖蜜漬Q彈波霸珍珠。' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}