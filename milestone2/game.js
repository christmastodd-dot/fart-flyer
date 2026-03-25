// game.js — M3: LEVELS, LEVELUP phase, per-pipe gap, haptic feedback, flame power-ups

// ─── AUDIO UNLOCK ────────────────────────────────────────────────────────────
// Fires on the very first touch anywhere on the page — capture phase so it
// runs before any other handler. This is the earliest possible user-gesture
// moment and guarantees SFX.unlock() is always called synchronously.
(function () {
  function onFirstTouch() {
    SFX.unlock();
    document.removeEventListener('touchstart', onFirstTouch, true);
    document.removeEventListener('mousedown',  onFirstTouch, true);
  }
  document.addEventListener('touchstart', onFirstTouch, { capture: true, passive: true });
  document.addEventListener('mousedown',  onFirstTouch, { capture: true, passive: true });

  // Resume after phone lock / tab switch / app interruption
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && SFX._ctx) SFX._ctx.resume();
  });
})();

// ─── CANVAS ──────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

const LOGICAL_W = 320;
const LOGICAL_H = 480;

// Canvas pixel buffer is always the logical size.
// CSS (via resizeCanvas) scales it to fill the viewport — this way
// getBoundingClientRect always reflects the true display size and
// touch / click coordinates are always correct.
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

// Convert a pointer's client coordinates to logical canvas coordinates.
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

// ─── DIFFICULTY LEVELS ───────────────────────────────────────────────────────
// Levels advance every 10 pipes. speedBonus drives pipe speed; points per pipe = levelIdx+1.
const LEVELS = [
  { speedBonus: 0,   label: ''                 },  // lv1  pipes  0–9
  { speedBonus: 0.5, label: 'Faster!'          },  // lv2  pipes 10–19
  { speedBonus: 1.1, label: 'Much faster!'     },  // lv3  pipes 20–29
  { speedBonus: 1.8, label: 'Getting wild!'    },  // lv4  pipes 30–39
  { speedBonus: 2.6, label: 'Maximum chaos!'   },  // lv5  pipes 40–49
  { speedBonus: 3.5, label: 'Ludicrous speed!' },  // lv6  pipes 50–59
  { speedBonus: 4.5, label: 'Hyperdrive!'      },  // lv7  pipes 60–69
  { speedBonus: 5.6, label: 'Warp zone!'       },  // lv8  pipes 70–79
  { speedBonus: 6.8, label: 'Pure madness!'    },  // lv9  pipes 80–89
  { speedBonus: 8.2, label: 'LEGENDARY!'       },  // lv10 pipes 90+
];

// ─── STATE ───────────────────────────────────────────────────────────────────
let state;

function makeClouds() {
  const far = [], near = [], n = 4;
  for (let i = 0; i < n; i++) {
    far.push({
      x:     (LOGICAL_W / n) * i + Math.random() * (LOGICAL_W / n),
      y:     18 + Math.random() * 60,
      speed: 0.16 + Math.random() * 0.08,
    });
    near.push({
      x:     (LOGICAL_W / n) * i + Math.random() * (LOGICAL_W / n),
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
    phase:         'SELECT',
    selectedChar,
    score:         0,
    best,
    pipesTotal:    0,
    frame:         0,
    animTick:      0,
    fartFrame:     0,
    flameMode:     0,
    levelIdx:      0,
    levelUpFrames: 0,
    levelUpLabel:  '',
    player:        { x: PLAYER_X, y: LOGICAL_H / 2 - PLAYER_H / 2, vy: 0 },
    pipes:         [],
    powerups:      [],
    particles:     [],
    clouds:        makeClouds(),
    shake:         0,
    flashFrames:   0,
    deathAngle:    0,
    deathY:        0,
  };
}
resetState();

// ─── SPAWNING ────────────────────────────────────────────────────────────────
function spawnPipe() {
  const gap    = 144;
  const minTop = 50;
  const maxTop = LOGICAL_H - GROUND_H - gap - 50;
  state.pipes.push({
    x:      LOGICAL_W + 4,
    gapTop: minTop + Math.floor(Math.random() * (maxTop - minTop)),
    gap,
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
    const botY = p.gapTop + p.gap;
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
  Haptics.medium();
}

function onTap(tapX, tapY) {
  SFX.init();

  if (state.phase === 'SELECT') {
    const panelBottom = 164;
    if (tapY !== undefined && tapY > panelBottom) {
      startGame();
      return;
    }
    // Carousel: left third = prev, center = play, right third = next
    const third  = LOGICAL_W / 3;
    const region = tapX < third ? -1 : tapX < third * 2 ? 0 : 1;
    if (region === 0) {
      startGame();
    } else {
      state.selectedChar = ((state.selectedChar + region) % CHARS.length + CHARS.length) % CHARS.length;
    }
    return;
  }

  if (state.phase === 'PLAYING') {
    state.player.vy = THRUST;
    state.fartFrame = 12;
    emitFartParticles();
    SFX.fart();
    Haptics.medium();
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
    if (e.code === 'ArrowLeft')  { e.preventDefault(); state.selectedChar = (state.selectedChar - 1 + CHARS.length) % CHARS.length; return; }
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
    p.x += p.vx; p.y += p.vy;
    p.vy += p.flame ? -0.04 : 0.07;
    p.life--;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  if (state.phase === 'LEVELUP') {
    state.levelUpFrames--;
    if (state.levelUpFrames <= 0) state.phase = 'PLAYING';
    return;
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

  const speed = PIPE_SPEED_BASE + LEVELS[state.levelIdx].speedBonus;
  for (const p of state.pipes) {
    p.x -= speed;
    if (!p.scored && p.x + PIPE_W < state.player.x) {
      p.scored = true;
      state.pipesTotal++;

      // Points = level multiplier (1–10), doubled during flame mode
      const pts = (state.levelIdx + 1) * (state.flameMode > 0 ? 2 : 1);
      state.score += pts;
      SFX.ping();
      Haptics.light();

      // Advance level every 10 pipes
      const newIdx = Math.min(Math.floor(state.pipesTotal / 10), LEVELS.length - 1);
      if (newIdx > state.levelIdx) {
        state.levelIdx      = newIdx;
        state.levelUpFrames = 90;
        state.levelUpLabel  = LEVELS[newIdx].label;
        state.phase         = 'LEVELUP';
      }
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
      Haptics.medium();
      continue;
    }
    if (pu.x + 16 < 0) state.powerups.splice(i, 1);
  }

  if (state.phase === 'PLAYING' && checkCollision()) {
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
    Haptics.heavy();
  }

  if (state.shake > 0) state.shake--;
}

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
  ctx.save();

  if (state.shake > 0) {
    const m = state.shake * 0.55;
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
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

  if (state.phase === 'PLAYING' || state.phase === 'DEAD' || state.phase === 'LEVELUP') {
    Renderer.score();
    Renderer.levelIndicator();
    Renderer.flameIndicator();
  }

  if (state.phase === 'SELECT')  Renderer.selectScreen();
  if (state.phase === 'LEVELUP') Renderer.levelUpScreen();
  if (state.phase === 'DEAD')    Renderer.gameOverScreen();

  ctx.restore();
}

// ─── LOOP ────────────────────────────────────────────────────────────────────
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
