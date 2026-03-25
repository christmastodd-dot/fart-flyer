// sprites.js — pixel art palettes, sprite frames, character registry, draw function

// ── Ruby's palette (golden-blonde hair, red outfit) ───────────────────────────
const PAL = [
  null,        // 0 = transparent
  '#F4C430',   // 1 = golden hair
  '#FAD7A0',   // 2 = skin
  '#E8A87C',   // 3 = skin shadow
  '#4A90D9',   // 4 = blue shirt
  '#2C6EAB',   // 5 = shirt shadow
  '#E74C3C',   // 6 = red skirt
  '#C0392B',   // 7 = skirt shadow / hem
  '#FFFFFF',   // 8 = white
  '#2C3E50',   // 9 = dark (eyes, outline)
  '#8B4513',   // 10 = shoe brown
  '#F9E4B7',   // 11 = hair highlight
  '#FFB6C1',   // 12 = cheek blush
];

// ── Max's palette (dark brown hair, green shirt, blue jeans) ──────────────────
const PAL_MAX = [
  null,        // 0 = transparent
  '#5C3317',   // 1 = dark brown hair
  '#FAD7A0',   // 2 = skin
  '#E8A87C',   // 3 = skin shadow
  '#3A7D44',   // 4 = forest green shirt
  '#2A5E33',   // 5 = shirt shadow
  '#3B5998',   // 6 = blue jeans
  '#2C4378',   // 7 = jeans shadow
  '#FFFFFF',   // 8 = white
  '#2C3E50',   // 9 = dark (eyes, outline)
  '#5C3317',   // 10 = dark brown shoes
  '#7A4A25',   // 11 = hair lighter shade
  '#FAD7A0',   // 12 = (no blush — same as skin so it's invisible)
];

// ── Kawai's palette (warm light-brown hair, pink top, purple skirt) ───────────
const PAL_KAWAI = [
  null,        // 0 = transparent
  '#C68642',   // 1 = warm light-brown hair
  '#FAD7A0',   // 2 = skin
  '#E8A87C',   // 3 = skin shadow
  '#E91E8C',   // 4 = hot-pink top
  '#B5157A',   // 5 = pink shadow
  '#9B59B6',   // 6 = purple skirt
  '#7D3C98',   // 7 = skirt shadow
  '#FFFFFF',   // 8 = white
  '#2C3E50',   // 9 = dark (eyes, outline)
  '#8B4513',   // 10 = shoe brown
  '#DBA56E',   // 11 = hair highlight
  '#FFB6C1',   // 12 = cheek blush
];

// ── Girl sprites (shared by Ruby + Kawai — long flowing hair via side strands) ─

// Normal idle — 10 cols × 14 rows, drawn at pixel-size 2 → 20×28 px
const GIRL = [
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],  // top of hair
  [ 1, 1,11, 1, 1, 1,11, 1, 1, 0],  // hair highlights, extends left
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],  // full hair width
  [ 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],  // long side hair flanks face
  [ 1, 2, 9, 2,12, 2, 9, 2, 1, 0],  // eyes + blush + side hair
  [11, 2, 2, 2, 2, 2, 2, 2,11, 0],  // highlight strands at sides
  [ 1, 3, 2, 2, 2, 2, 2, 3, 1, 0],  // chin + side hair
  [ 1, 4, 4, 4, 4, 4, 4, 4, 1, 0],  // shirt + hair still flanking
  [ 0, 5, 4, 4, 4, 4, 4, 5, 1, 0],  // shirt shadow + right hair strand
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],  // shirt bottom
  [ 0, 6, 6, 6, 6, 6, 6, 6, 0, 0],  // skirt
  [ 0, 7, 6, 6, 6, 6, 6, 7, 0, 0],  // skirt hem
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],  // shoes
  [10,10,10, 0, 0,10,10,10, 0, 0],  // shoes wide
];

// Idle frame 2 — skirt sways left, feet slightly apart
const GIRL_BOB2 = [
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [ 1, 1,11, 1, 1, 1,11, 1, 1, 0],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [ 1, 2, 2, 2, 2, 2, 2, 2, 1, 0],
  [ 1, 2, 9, 2,12, 2, 9, 2, 1, 0],
  [11, 2, 2, 2, 2, 2, 2, 2,11, 0],
  [ 1, 3, 2, 2, 2, 2, 2, 3, 1, 0],
  [ 1, 4, 4, 4, 4, 4, 4, 4, 1, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 1, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 6, 6, 6, 6, 6, 6, 6, 0, 0, 0],  // skirt sways left
  [ 7, 6, 6, 6, 6, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0,10,10,10, 0, 0],  // feet slightly apart
];

// Fart frame — whole body shifted one column right (nose up), skirt trails left
const GIRL_TILTED = [
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [ 0, 1, 1,11, 1, 1, 1,11, 1, 1],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [ 0, 1, 2, 2, 2, 2, 2, 2, 2, 1],
  [ 0, 1, 2, 9, 2,12, 2, 9, 2, 1],
  [ 0,11, 2, 2, 2, 2, 2, 2, 2,11],
  [ 0, 1, 3, 2, 2, 2, 2, 2, 3, 1],
  [ 0, 1, 4, 4, 4, 4, 4, 4, 4, 1],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 1],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 6, 6, 6, 6, 6, 6, 6, 0, 0],  // skirt trails left
  [ 6, 6, 7, 6, 6, 6, 6, 7, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0, 0,10,10, 0, 0],
];

// ── Max sprites (short hair, pants — unique silhouette) ───────────────────────

const MAX = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],  // short hair top — narrower than girls
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],  // hair with highlights
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],  // hair bottom
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],  // forehead (no side hair)
  [ 0, 2, 9, 2, 2, 2, 9, 2, 0, 0],  // eyes (no blush — PAL_MAX[12]=skin)
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],  // face
  [ 0, 3, 2, 2, 2, 2, 2, 3, 0, 0],  // chin
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],  // shirt
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],  // shirt shadow
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],  // shirt bottom
  [ 0, 6, 6, 0, 0, 6, 6, 0, 0, 0],  // two pant legs
  [ 0, 7, 6, 0, 0, 6, 7, 0, 0, 0],  // pants crease/shadow
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],  // shoes
  [10,10,10, 0, 0,10,10,10, 0, 0],  // shoes wide
];

const MAX_BOB2 = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 2, 9, 2, 2, 2, 9, 2, 0, 0],
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 3, 2, 2, 2, 2, 2, 3, 0, 0],
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 6, 6, 6, 0, 0, 6, 6, 0, 0, 0],  // pants sway slightly
  [ 7, 6, 6, 0, 0, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0,10,10,10, 0, 0],  // feet apart
];

const MAX_TILTED = [
  [ 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],  // short hair shifted right
  [ 0, 0, 1, 1,11, 1,11, 1, 1, 0],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [ 0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 0, 2, 9, 2, 2, 2, 9, 2, 0],
  [ 0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 0, 3, 2, 2, 2, 2, 2, 3, 0],
  [ 0, 0, 4, 4, 4, 4, 4, 4, 4, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 6, 6, 6, 0, 0, 6, 6, 0, 0],  // pants shifted
  [ 0, 7, 6, 6, 0, 0, 6, 7, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0, 0,10,10, 0, 0],
];

// ── Character registry ────────────────────────────────────────────────────────
// color = highlight / border colour shown on the select screen
const CHARS = [
  { name: 'Max',   pal: PAL_MAX,   idle: MAX,  bob2: MAX_BOB2,  tilt: MAX_TILTED,  color: '#3A7D44' },
  { name: 'Ruby',  pal: PAL,       idle: GIRL, bob2: GIRL_BOB2, tilt: GIRL_TILTED, color: '#E74C3C' },
  { name: 'Kawai', pal: PAL_KAWAI, idle: GIRL, bob2: GIRL_BOB2, tilt: GIRL_TILTED, color: '#9B59B6' },
];

// ── Sprite renderer ───────────────────────────────────────────────────────────
// pal is optional; defaults to PAL (Ruby/girl palette).
function drawSprite(sprite, x, y, ps, pal) {
  const palette = pal || PAL;
  for (let r = 0; r < sprite.length; r++) {
    for (let c = 0; c < sprite[r].length; c++) {
      const idx = sprite[r][c];
      if (!idx || !palette[idx]) continue;
      ctx.fillStyle = palette[idx];
      ctx.fillRect(Math.floor(x + c * ps), Math.floor(y + r * ps), ps, ps);
    }
  }
}
