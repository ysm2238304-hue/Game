// ============================================================
// 📦 src/themes/taiwan/items.js — 台灣小吃
// ============================================================

export const ITEM_DEFS = [
  { id: 'lu-rou-fan',      name: '古早味滷肉飯',     label: '滷肉飯',   price: '$60',  desc: '肥瘦均勻的手切滷肉澆淋在熱騰騰白飯上，香氣四溢。' },
  { id: 'oyster-omelette', name: '鮮蚵仔煎',         label: '蚵仔煎',   price: '$80',  desc: '肥美鮮蚵裹上地瓜粉漿，搭配小白菜與甜辣醬。' },
  { id: 'chicken-cutlet',  name: '豪大炸雞排',       label: '雞排',     price: '$90',  desc: '比臉還大的酥脆炸雞排，灑上椒鹽與蒜粉。' },
  { id: 'boba-milk-tea',   name: '波霸珍珠奶茶',     label: '珍珠奶茶', price: '$55',  desc: '手搖經典！濃郁奶香加上Q彈波霸珍珠。' },
  { id: 'stinky-tofu',     name: '脆皮臭豆腐',       label: '臭豆腐',   price: '$70',  desc: '外酥內嫩的發酵臭豆腐，配上台式泡菜。' },
  { id: 'sausage-rice',    name: '大腸包小腸',       label: '大腸包小腸', price: '$65', desc: '糯米腸夾入香腸，淋上蒜泥醬油的經典組合。' },
  { id: 'popcorn-chicken', name: '鹹酥雞',           label: '鹹酥雞',   price: '$100', desc: '九層塔爆香、胡椒鹽調味，配啤酒最對味。' },
  { id: 'sweet-potato-ball', name: 'QQ地瓜球',       label: '地瓜球',   price: '$50',  desc: '金黃圓滾的炸地瓜球，外酥內Q超涮嘴。' },
  { id: 'wheel-pie',       name: '車輪餅',           label: '車輪餅',   price: '$45',  desc: '奶油/紅豆雙餡車輪餅，下午茶必備。' },
  { id: 'scallion-pancake', name: '蔥油餅加蛋',      label: '蔥油餅',   price: '$40',  desc: '層層酥脆的青蔥餅皮，加顆半熟蛋更滿足。' },
  { id: 'ba-wan',          name: '彰化肉圓',         label: '肉圓',     price: '$55',  desc: 'Q彈外皮包裹筍丁與豬後腿肉，淋上甜醬。' },
  { id: 'gua-bao',         name: '刈包',             label: '刈包',     price: '$60',  desc: '蓬鬆麵皮夾入滷三層肉、酸菜與花生粉。' },
  { id: 'beef-noodle',     name: '紅燒牛肉麵',       label: '牛肉麵',   price: '$150', desc: '熬煮8小時的濃郁紅燒湯頭與軟嫩牛腱。' },
  { id: 'dan-zai-noodle',  name: '台南擔仔麵',       label: '擔仔麵',   price: '$60',  desc: '肉燥香氣十足的府城經典小碗麵。' },
  { id: 'tofu-pudding',    name: '傳統豆花',         label: '豆花',     price: '$45',  desc: '綿密滑嫩的豆花配上花生與黑糖水。' },
  { id: 'mango-shave',     name: '芒果雪花冰',       label: '芒果冰',   price: '$120', desc: '夏季限定！愛文芒果鋪滿牛奶雪花冰。' },
  { id: 'pineapple-cake',  name: '土鳳梨酥',         label: '鳳梨酥',   price: '$35',  desc: '微酸土鳳梨餡，酥鬆外皮，台灣之光伴手禮。' },
  { id: 'sun-cake',        name: '太陽餅',           label: '太陽餅',   price: '$40',  desc: '台中名產，酥皮包覆麥芽糖餡的甜蜜滋味。' },
  { id: 'taro-ball',       name: '九份芋圓',         label: '芋圓',     price: '$55',  desc: '大甲芋頭製成的Q彈芋圓，配紅豆湯。' },
  { id: 'roasted-corn',    name: '碳烤玉米',         label: '烤玉米',   price: '$60',  desc: '整支玉米刷上特調醬汁，炭火直烤香氣逼人。' }
];

export function getItemById(id) {
  return ITEM_DEFS.find(d => d.id === id) || ITEM_DEFS[0];
}

export function getItemLabel(id) {
  return getItemById(id).label;
}
