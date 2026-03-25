// game.js — canvas setup, constants, game state, physics, input, main loop

// ─── CANVAS ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

const LOGICAL_W = 320;
const LOGICAL_H = 480;

canvas.width  = LOGICAL_W;
canvas.height = LOGICAL_H;

function resizeCanvas() {
  const availW = document.body.clientWidth  || window.innerWidth;
  const availH = document.body.clientHeight || window.innerHeight;
  const scale  = Math.min(availW / LOGICAL_W, availH / LOGICAL_H);
  canvas.style.width  = Math.floor(LOGICAL_W * scale) + 'px';
  canvas.style.height = Math.floor(LOGICAL_H * scale) + 'px';
}
resizeCanvas();
window.addEventListener('resize',            resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);

function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return [
    (clientX - rect.left) * (LOGICAL_W / rect.width),
    (clientY - rect.top)  * (LOGICAL_H / rect.height),
  ];
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const GRAVITY         = 0.38;
const THRUST          = -4.68;
const PIPE_SPEED_BASE = 2.2;
const PIPE_GAP        = 144;
const PIPE_INTERVAL   = 95;
const PIPE_W          = 44;
const GROUND_H        = 40;
const PLAYER_X        = 68;
const PLAYER_W        = 20;
const PLAYER_H        = 28;
const HIT_SHRINK      = 3;

const FART_COLORS      = ['#B8E86A','#D4ED6A','#C5E860','#9FD45A','#CCDD77','#E8F5A3'];
const FLAME_COLORS     = ['#FF4500','#FF6B35','#FF8C00','#FFA500','#FFD700','#FFFF44'];
const FLAME_DURATION   = 300;
const POWERUP_INTERVAL = 380;

// ─── STATE ───────────────────────────────────────────────────────────────────
let state;

function makeClouds() {
  const far = [], near = [], count = 4;
  for (let i = 0; i < count; i++) {
    far.push({
      x:     (LOGICAL_W / count) * i + Math.random() * (LOGICAL_W / count),
      y:     18 + Math.random() * 60,
      speed: 0.16 + Math.random() * 0.08,
    });
    near.push({
      x:     (LOGICAL_W / count) * i + Math.random() * (LOGICAL_W / count),
      y:     30 + Math.random() * 55,
      speed: 0.38 + Math.random() * 0.14,
    });
  }
  return { far, near };
}

function resetState() {
  const best         = state ? state.best : parseInt(localStorage.getItem('fartflyer_best') || '0', 10);
  const selectedChar = state ? state.selectedChar : 1;  // default Ruby

  state = {
    phase:        'SELECT',
    selectedChar,
    score:        0,
    best,
    frame:        0,
    animTick:     0,
    fartFrame:    0,
    flameMode:    0,
    player:       { x: PLAYER_X, y: LOGICAL_H / 2 - PLAYER_H / 2, vy: 0 },
    pipes:        [],
    powerups:     [],
    particles:    [],
    clouds:       makeClouds(),
    shake:        0,
    flashFrames:  0,
    deathAngle:   0,
    deathY:       0,
  };
}
resetState();

// ─── SPAWNING ────────────────────────────────────────────────────────────────
function spawnPipe() {
  const minTop = 50;
  const maxTop = LOGICAL_H - GROUND_H - PIPE_GAP - 50;
  state.pipes.push({
    x:      LOGICAL_W + 4,
    gapTop: minTop + Math.floor(Math.random() * (maxTop - minTop)),
    scored: false,
  });
}

function spawnPowerup() {
  state.powerups.push({
    x: LOGICAL_W + 4,
    y: 70 + Math.random() * (LOGICAL_H - GROUND_H - 140),
  });
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function emitFartParticles() {
  const px      = state.player.x;
  const py      = state.player.y + PLAYER_H / 2;
  const isFlame = state.flameMode > 0;
  const colors  = isFlame ? FLAME_COLORS : FART_COLORS;

  for (let i = 0; i < 9; i++) {
    const life = 16 + Math.floor(Math.random() * 12);
    state.particles.push({
      x:       px + (Math.random() - 0.5) * 4,
      y:       py + (Math.random() - 0.5) * (isFlame ? 5 : 10),
      vx:      -(1 + Math.random() * 3),
      vy:      isFlame ? -(0.4 + Math.random() * 2.2) : (Math.random() - 0.5) * 2.5,
      life,
      maxLife: life,
      color:   colors[Math.floor(Math.random() * colors.length)],
      size:    isFlame ? 2 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 3),
      h:       isFlame ? 5 + Math.floor(Math.random() * 5) : undefined,
      flame:   isFlame,
    });
  }
}

// ─── COLLISION ───────────────────────────────────────────────────────────────
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx &&
         ay < by + bh && ay + ah > by;
}

function checkCollision() {
  const { x, y } = state.player;
  const hx = x  + HIT_SHRINK,  hy = y  + HIT_SHRINK;
  const hw  = PLAYER_W - HIT_SHRINK * 2, hh = PLAYER_H - HIT_SHRINK * 2;

  if (y + PLAYER_H >= LOGICAL_H - GROUND_H) return true;
  if (y <= 0) return true;

  for (const p of state.pipes) {
    if (rectsOverlap(hx, hy, hw, hh, p.x, 0, PIPE_W, p.gapTop)) return true;
    const botY = p.gapTop + PIPE_GAP;
    if (rectsOverlap(hx, hy, hw, hh, p.x, botY, PIPE_W, LOGICAL_H - GROUND_H - botY)) return true;
  }
  return false;
}

// ─── INPUT ───────────────────────────────────────────────────────────────────
function startGame() {
  state.phase     = 'PLAYING';
  state.player.vy = THRUST;
  state.fartFrame = 12;
  emitFartParticles();
  SFX.fart();
}

function onTap(tapX, tapY) {
  SFX.init();

  if (state.phase === 'SELECT') {
    // Tap below the panels → start with current selection
    const panelBottom = 164;
    if (tapY !== undefined && tapY > panelBottom) {
      startGame();
      return;
    }
    const third  = LOGICAL_W / 3;
    const tapped = tapX < third ? 0 : tapX < third * 2 ? 1 : 2;
    if (tapped === state.selectedChar) {
      startGame();
    } else {
      state.selectedChar = tapped;
    }
    return;
  }

  if (state.phase === 'PLAYING') {
    state.player.vy = THRUST;
    state.fartFrame = 12;
    emitFartParticles();
    SFX.fart();
    return;
  }

  if (state.phase === 'DEAD') {
    resetState();
  }
}

canvas.addEventListener('click', e => {
  onTap(...toLogical(e.clientX, e.clientY));
});
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  onTap(...toLogical(e.touches[0].clientX, e.touches[0].clientY));
}, { passive: false });
document.addEventListener('keydown', e => {
  if (state.phase === 'SELECT') {
    if (e.code === 'ArrowLeft')  { e.preventDefault(); state.selectedChar = (state.selectedChar + 2) % CHARS.length; return; }
    if (e.code === 'ArrowRight') { e.preventDefault(); state.selectedChar = (state.selectedChar + 1) % CHARS.length; return; }
    if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); SFX.init(); startGame(); return; }
  }
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    onTap(LOGICAL_W / 2, 0);
  }
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────
function update() {
  for (const c of state.clouds.far)  { c.x -= c.speed; if (c.x < -24) c.x = LOGICAL_W + 4; }
  for (const c of state.clouds.near) { c.x -= c.speed; if (c.x < -28) c.x = LOGICAL_W + 4; }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += p.flame ? -0.04 : 0.07;
    p.life--;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  if (state.phase === 'DEAD') {
    state.deathY     += 3.5;
    state.deathAngle += 0.17;
    if (state.flashFrames > 0) state.flashFrames--;
    if (state.shake > 0)       state.shake--;
    return;
  }

  if (state.phase === 'SELECT') return;

  // ── PLAYING ──
  state.frame++;
  state.animTick++;
  if (state.fartFrame > 0) state.fartFrame--;
  if (state.flameMode > 0) state.flameMode--;

  state.player.vy += GRAVITY;
  state.player.y  += state.player.vy;

  if (state.frame % PIPE_INTERVAL    === 0)  spawnPipe();
  if (state.frame % POWERUP_INTERVAL === 48) spawnPowerup();

  const speed = PIPE_SPEED_BASE + Math.floor(state.score / 5) * 0.12;
  for (const p of state.pipes) {
    p.x -= speed;
    if (!p.scored && p.x + PIPE_W < state.player.x) {
      p.scored = true;
      state.score++;
      SFX.ping();
    }
  }
  state.pipes = state.pipes.filter(p => p.x + PIPE_W > -4);

  for (let i = state.powerups.length - 1; i >= 0; i--) {
    const pu = state.powerups[i];
    pu.x -= speed;
    if (rectsOverlap(state.player.x, state.player.y, PLAYER_W, PLAYER_H,
                     pu.x, pu.y, 16, 20)) {
      state.flameMode = FLAME_DURATION;
      state.powerups.splice(i, 1);
      SFX.powerup();
      continue;
    }
    if (pu.x + 16 < 0) state.powerups.splice(i, 1);
  }

  if (checkCollision()) {
    state.phase       = 'DEAD';
    state.deathY      = state.player.y;
    state.deathAngle  = 0;
    state.flashFrames = 10;
    state.shake       = 16;
    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem('fartflyer_best', state.best);
    }
    SFX.death();
  }

  if (state.shake > 0) state.shake--;
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  ctx.save();

  if (state.shake > 0) {
    const mag = state.shake * 0.55;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
  }

  Renderer.background();
  Renderer.clouds();
  for (const p  of state.pipes)    Renderer.pipe(p);
  for (const pu of state.powerups) Renderer.powerup(pu);
  Renderer.ground();
  Renderer.particles();

  if (state.phase === 'DEAD') {
    Renderer.deadPlayer();
  } else if (state.phase !== 'SELECT') {
    Renderer.player();
  }

  Renderer.flash();

  if (state.phase === 'PLAYING' || state.phase === 'DEAD') {
    Renderer.score();
    Renderer.flameIndicator();
  }

  if (state.phase === 'SELECT') Renderer.selectScreen();
  if (state.phase === 'DEAD')   Renderer.gameOverScreen();

  ctx.restore();
}

// ─── MAIN LOOP ───────────────────────────────────────────────────────────────
function loop() {
  try {
    update();
    render();
  } catch (e) {
    console.error('[FartFlyer]', e);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
