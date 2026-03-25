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

// Shared skin tones used by the new characters:
//   Tan:       skin #C8906A  shadow #A86A3A
//   Light tan: skin #DDB882  shadow #BB8E5A

// ── Dylan (tan, near-black hair, blue shirt, navy pants) ──────────────────────
const PAL_DYLAN = [
  null, '#1E1008', '#C8906A', '#A86A3A', '#2980B9', '#1F6595',
  '#2C3E50', '#1A252F', '#FFFFFF', '#2C3E50', '#5C3317', '#3A1E08', '#C8906A',
];

// ── Emily (tan, near-black hair, teal shirt, green skirt) ────────────────────
const PAL_EMILY = [
  null, '#1E1008', '#C8906A', '#A86A3A', '#16A085', '#0E6B5A',
  '#27AE60', '#1E8449', '#FFFFFF', '#2C3E50', '#5C3317', '#3A1E08', '#FFB6C1',
];

// ── Ricki (light tan, near-black hair+pony, orange hoodie, brown pants) ───────
const PAL_RICKI = [
  null, '#1E1008', '#DDB882', '#BB8E5A', '#E67E22', '#BF6210',
  '#7D5A3C', '#5D3D28', '#FFFFFF', '#2C3E50', '#4A2808', '#3A1E08', '#FFB6C1',
];

// ── Foggy (light tan, dark hair, purple shirt, gray pants; idx 9 = glasses) ───
const PAL_FOGGY = [
  null, '#2A1A0A', '#DDB882', '#BB8E5A', '#8E44AD', '#6C3483',
  '#566573', '#3D4A5C', '#FFFFFF', '#2C3E50', '#4A2808', '#3D2010', '#DDB882',
];

// ── Conner (light tan, near-black hair, red shirt, black pants) ──────────────
const PAL_CONNER = [
  null, '#1E1008', '#DDB882', '#BB8E5A', '#C0392B', '#922B21',
  '#1C1C1C', '#0A0A0A', '#FFFFFF', '#2C3E50', '#4A2808', '#3A1E08', '#DDB882',
];

// ── Mason (light tan, near-black hair, yellow shirt, olive pants) ─────────────
const PAL_MASON = [
  null, '#1E1008', '#DDB882', '#BB8E5A', '#F39C12', '#D68910',
  '#4A7C59', '#2E5E3E', '#FFFFFF', '#2C3E50', '#4A2808', '#3A1E08', '#DDB882',
];

// ── Alika (light tan, dark buzz, hot-pink shirt, deep-blue pants) ─────────────
const PAL_ALIKA = [
  null, '#1E1008', '#DDB882', '#BB8E5A', '#E91E8C', '#B5157A',
  '#1A237E', '#0D1257', '#FFFFFF', '#2C3E50', '#4A2808', '#2A1808', '#DDB882',
];

// ── Tai (light tan, dark buzz, cyan shirt, purple pants) ─────────────────────
const PAL_TAI = [
  null, '#1E1008', '#DDB882', '#BB8E5A', '#00ACC1', '#007C91',
  '#6A1B9A', '#4A1272', '#FFFFFF', '#2C3E50', '#4A2808', '#2A1808', '#DDB882',
];

// ── Finlay (tan, medium-brown hair, forest-green shirt, brown skirt) ─────────
const PAL_FINLAY = [
  null, '#6B3A1F', '#C8906A', '#A86A3A', '#388E3C', '#2E7D32',
  '#795548', '#5D4037', '#FFFFFF', '#2C3E50', '#4A2808', '#8B5A2F', '#FFB6C1',
];

// ── Levi (tan, light-brown hair, orange-red shirt, blue jeans) ────────────────
const PAL_LEVI = [
  null, '#8B6030', '#C8906A', '#A86A3A', '#FF5722', '#D84315',
  '#1565C0', '#0D47A1', '#FFFFFF', '#2C3E50', '#4A2808', '#AC8040', '#C8906A',
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

// ── Ponytail sprites (Ricki — gathered top, 2-wide pony hanging right side) ───
// Face is narrowed to cols 1-6 so cols 7 is a gap and cols 8-9 are the pony.
const PONY = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],  // hair sweeps all the way right — pony root
  [ 0, 2, 2, 2, 2, 2, 2, 0, 1, 1],  // face cols 1-6, gap col 7, pony 2-wide
  [ 0, 2, 9, 2,12, 2, 9, 0, 1, 1],  // eyes + blush, gap, pony
  [ 0, 2, 2, 2, 2, 2, 2, 0,11, 1],  // face, gap, pony highlight on near edge
  [ 0, 3, 2, 2, 2, 2, 3, 0, 1, 1],  // chin shadow at col 6, pony continues
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 6, 6, 0, 0, 6, 6, 0, 0, 0],
  [ 0, 7, 6, 0, 0, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [10,10,10, 0, 0,10,10,10, 0, 0],
];

const PONY_BOB2 = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [ 0, 2, 2, 2, 2, 2, 2, 0, 1, 1],
  [ 0, 2, 9, 2,12, 2, 9, 0, 1, 1],
  [ 0, 2, 2, 2, 2, 2, 2, 0,11, 1],
  [ 0, 3, 2, 2, 2, 2, 3, 0, 1, 1],
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 6, 6, 6, 0, 0, 6, 6, 0, 0, 0],  // pants sway
  [ 7, 6, 6, 0, 0, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0,10,10,10, 0, 0],
];

// Tilted: body shifts 1 col right; pony at col 9 (1 wide — body occupies col 8)
const PONY_TILTED = [
  [ 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [ 0, 0, 1, 1,11, 1,11, 1, 1, 0],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],  // hair + pony root at col 9
  [ 0, 0, 2, 2, 2, 2, 2, 0, 1, 1],  // face cols 2-6, gap col 7, pony cols 8-9
  [ 0, 0, 2, 9, 2,12, 2, 9, 1, 1],  // eyes + pony 2 wide
  [ 0, 0, 2, 2, 2, 2, 2, 0,11, 1],  // face, gap, pony
  [ 0, 0, 3, 2, 2, 2, 2, 3, 0, 0],
  [ 0, 0, 4, 4, 4, 4, 4, 4, 4, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 6, 6, 6, 0, 0, 6, 6, 0, 0],
  [ 0, 7, 6, 6, 0, 0, 6, 7, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0, 0,10,10, 0, 0],
];

// ── Glasses sprites (Foggy — short hair, round glasses via idx 9 frames) ──────
const FOGGY = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 9, 9, 9, 2, 9, 9, 9, 0, 0],  // glasses upper: frame-eye-frame / nose / frame-eye-frame
  [ 0, 9, 2, 9, 2, 9, 2, 9, 0, 0],  // glasses lower: frame-open-frame / nose / frame-open-frame
  [ 0, 3, 2, 2, 2, 2, 2, 3, 0, 0],
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 6, 6, 0, 0, 6, 6, 0, 0, 0],
  [ 0, 7, 6, 0, 0, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [10,10,10, 0, 0,10,10,10, 0, 0],
];

const FOGGY_BOB2 = [
  [ 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
  [ 0, 1, 1,11, 1,11, 1, 1, 0, 0],
  [ 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [ 0, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 9, 9, 9, 2, 9, 9, 9, 0, 0],
  [ 0, 9, 2, 9, 2, 9, 2, 9, 0, 0],
  [ 0, 3, 2, 2, 2, 2, 2, 3, 0, 0],
  [ 0, 4, 4, 4, 4, 4, 4, 4, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 0, 5, 4, 4, 4, 4, 4, 5, 0, 0],
  [ 6, 6, 6, 0, 0, 6, 6, 0, 0, 0],
  [ 7, 6, 6, 0, 0, 6, 7, 0, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0,10,10,10, 0, 0],
];

const FOGGY_TILTED = [
  [ 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
  [ 0, 0, 1, 1,11, 1,11, 1, 1, 0],
  [ 0, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [ 0, 0, 2, 2, 2, 2, 2, 2, 0, 0],
  [ 0, 0, 9, 9, 9, 2, 9, 9, 9, 0],  // glasses shifted right
  [ 0, 0, 9, 2, 9, 2, 9, 2, 9, 0],
  [ 0, 0, 3, 2, 2, 2, 2, 2, 3, 0],
  [ 0, 0, 4, 4, 4, 4, 4, 4, 4, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 0, 5, 4, 4, 4, 4, 4, 5, 0],
  [ 0, 6, 6, 6, 0, 0, 6, 6, 0, 0],
  [ 0, 7, 6, 6, 0, 0, 6, 7, 0, 0],
  [ 0,10,10, 0, 0,10,10, 0, 0, 0],
  [ 0,10,10,10, 0, 0,10,10, 0, 0],
];

// ── Character registry ────────────────────────────────────────────────────────
// color = highlight / border colour shown on the select screen
// Alphabetical order
const CHARS = [
  { name: 'Alika',  pal: PAL_ALIKA,  idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#E91E8C' },
  { name: 'Conner', pal: PAL_CONNER, idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#C0392B' },
  { name: 'Dylan',  pal: PAL_DYLAN,  idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#2980B9' },
  { name: 'Emily',  pal: PAL_EMILY,  idle: GIRL,  bob2: GIRL_BOB2,  tilt: GIRL_TILTED,  color: '#16A085' },
  { name: 'Finlay', pal: PAL_FINLAY, idle: GIRL,  bob2: GIRL_BOB2,  tilt: GIRL_TILTED,  color: '#388E3C' },
  { name: 'Foggy',  pal: PAL_FOGGY,  idle: FOGGY, bob2: FOGGY_BOB2, tilt: FOGGY_TILTED, color: '#8E44AD' },
  { name: 'Kawai',  pal: PAL_KAWAI,  idle: GIRL,  bob2: GIRL_BOB2,  tilt: GIRL_TILTED,  color: '#9B59B6' },
  { name: 'Levi',   pal: PAL_LEVI,   idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#FF5722' },
  { name: 'Mason',  pal: PAL_MASON,  idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#F39C12' },
  { name: 'Max',    pal: PAL_MAX,    idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#3A7D44' },
  { name: 'Ricki',  pal: PAL_RICKI,  idle: PONY,  bob2: PONY_BOB2,  tilt: PONY_TILTED,  color: '#E67E22' },
  { name: 'Ruby',   pal: PAL,        idle: GIRL,  bob2: GIRL_BOB2,  tilt: GIRL_TILTED,  color: '#E74C3C' },
  { name: 'Tai',    pal: PAL_TAI,    idle: MAX,   bob2: MAX_BOB2,   tilt: MAX_TILTED,   color: '#00ACC1' },
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
