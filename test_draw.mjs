import fs from "fs";
import { generateLevelConfig } from "./src/logic/levelGen.js";

const drawCalls = [];
const mockCtx = new Proxy({}, {
  get(target, prop) {
    if (prop === "createLinearGradient") {
      return () => ({ addColorStop() {} });
    }
    return (...args) => {
      drawCalls.push({ fn: prop, args });
    };
  }
});

const app = {
  shelves: [],
  width: 390,
  height: 600,
  dpr: 2,
  topSceneH: 4,
  bottomSceneH: 4,
  ctx: mockCtx,
  initShelves(cfg) {
    this.shelves = [];
    for (let s = 0; s < cfg.shelfCount; s++) {
      const slots = [];
      for (let sl = 0; sl < 3; sl++) {
        slots.push({ shelfIdx: s, slotIdx: sl, x: 0, y: 0, w: 50, h: 60, queue: [], iceHp: 0, scaleX: 1, scaleY: 1 });
      }
      this.shelves.push({
        shelfIdx: s, x: 0, y: 0, w: 160, h: 80,
        slots
      });
    }
    const allSlots = [];
    this.shelves.forEach(sh => sh.slots.forEach(sl => allSlots.push(sl)));
    let poolIdx = 0;
    for (let layer = 0; layer < cfg.depthPerSlot; layer++) {
      for (let i = 0; i < allSlots.length; i++) {
        if (layer === 0 && i >= allSlots.length - 2) continue;
        if (poolIdx < cfg.itemPool.length) allSlots[i].queue.push(cfg.itemPool[poolIdx++]);
      }
    }
  },
  recalcShelvesLayout() {
    const cols = 3, rows = 4;
    const padX = 5, gapX = 6, gapY = 12;
    const shelfW = (this.width - padX * 2 - gapX * (cols - 1)) / cols;
    const availH = this.height - this.topSceneH - this.bottomSceneH;
    const shelfH = Math.floor((availH - gapY * (rows - 1)) / rows);
    const totalGridH = rows * shelfH + (rows - 1) * gapY;
    const freeMidH = this.height - this.topSceneH - this.bottomSceneH;
    const startY = this.topSceneH + Math.max(0, Math.floor((freeMidH - totalGridH) / 2));
    this.shelves.forEach((sh, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      sh.x = padX + c * (shelfW + gapX);
      sh.y = startY + r * (shelfH + gapY);
      sh.w = shelfW;
      sh.h = shelfH;
      const innerPadX = 1, headerH = 2, bottomPlankH = 8;
      const slotW = (shelfW - innerPadX * 2) / 3;
      const slotH = shelfH - headerH - bottomPlankH;
      sh.slots.forEach((sl, sIdx) => {
        sl.x = sh.x + innerPadX + sIdx * slotW;
        sl.y = sh.y + headerH;
        sl.w = slotW;
        sl.h = slotH;
      });
    });
  }
};

const mainCode = fs.readFileSync("./src/main.js", "utf-8");
const start = mainCode.indexOf("paintSupermarketShelfUnit(ctx) {");
const end = mainCode.indexOf("paintTopShopEaves(ctx) {");
const fnStr = "app." + mainCode.slice(start, end);
eval(fnStr);

const cfg = generateLevelConfig(4, 1);
app.initShelves(cfg);
app.recalcShelvesLayout();
app.paintSupermarketShelfUnit(app.ctx);

console.log("Total drawCalls in paintSupermarketShelfUnit:", drawCalls.length);
const fills = drawCalls.filter(c => c.fn === "fill" || c.fn === "roundRect");
console.log("Fill and roundRect calls:", fills.length);
