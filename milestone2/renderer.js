// renderer.js — all canvas draw calls
// Globals from game.js:  ctx, LOGICAL_W, LOGICAL_H, GROUND_H,
//                        PIPE_W, PIPE_GAP, PLAYER_W, PLAYER_H, state
// Globals from sprites.js: PAL, CHARS, drawSprite

const Renderer = {

  background() {
    const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    grad.addColorStop(0, '#4A90C4');
    grad.addColorStop(1, '#A8D8F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  },

  clouds() {
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = 0.5;
    for (const c of state.clouds.far)  this._cloudSmall(c.x, c.y);
    ctx.globalAlpha = 0.82;
    for (const c of state.clouds.near) this._cloud(c.x, c.y);
    ctx.globalAlpha = 1;
  },

  _cloud(x, y) {
    ctx.fillRect(x + 4, y + 4, 12, 7);
    ctx.fillRect(x,     y + 6, 22, 5);
    ctx.fillRect(x + 2, y + 1,  8, 4);
    ctx.fillRect(x + 10, y,     6, 4);
  },

  _cloudSmall(x, y) {
    ctx.fillRect(x + 3, y + 3,  8, 5);
    ctx.fillRect(x,     y + 4, 14, 4);
    ctx.fillRect(x + 1, y + 1,  5, 3);
    ctx.fillRect(x + 7, y,      4, 3);
  },

  ground() {
    const y = LOGICAL_H - GROUND_H;
    ctx.fillStyle = '#5DBB63';
    ctx.fillRect(0, y, LOGICAL_W, 8);
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(0, y + 8, LOGICAL_W, GROUND_H - 8);
    ctx.fillStyle = '#4CAF50';
    const offset = state.phase === 'PLAYING' ? (state.frame * 2) % 16 : 0;
    for (let gx = -offset; gx < LOGICAL_W; gx += 16) {
      ctx.fillRect(gx, y, 8, 3);
    }
  },

  pipe(p) {
    const capH   = 10;
    const capW   = PIPE_W + 6;
    const capOff = -3;

    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(p.x, 0, PIPE_W, p.gapTop - capH);
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(p.x + 2, 0, 5, p.gapTop - capH);

    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(p.x + capOff, p.gapTop - capH, capW, capH);
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(p.x + capOff + 2, p.gapTop - capH, 5, capH);

    const botY = p.gapTop + PIPE_GAP;
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(p.x + capOff, botY, capW, capH);
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(p.x + capOff + 2, botY, 5, capH);

    const shaftH = LOGICAL_H - GROUND_H - botY - capH;
    ctx.fillStyle = '#2ECC40';
    ctx.fillRect(p.x, botY + capH, PIPE_W, shaftH);
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(p.x + 2, botY + capH, 5, shaftH);
  },

  particles() {
    for (const p of state.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      const ph = p.h || p.size;
      if (p.flame) {
        ctx.globalAlpha = alpha * 0.28;
        ctx.fillStyle   = p.color;
        ctx.fillRect(Math.floor(p.x) - 1, Math.floor(p.y) - 1, p.size + 2, ph + 2);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, ph);
    }
    ctx.globalAlpha = 1;
  },

  // ── Match power-up icon (collect to ignite flame farts) ───────────────────
  powerup(p) {
    const px = Math.floor(p.x);
    const py = Math.floor(p.y + Math.sin(Date.now() / 380) * 4);
    const ps = 2;
    // 1=match head red  2=head dark  3=lit tip orange  4=stick wood  5=stick shadow
    const matchPal = [null, '#CC2200', '#8B0000', '#FF6633', '#EAC67A', '#B8924A'];
    const icon = [
      [0, 0, 0, 3, 3, 0, 0, 0],  // glowing tip
      [0, 0, 1, 1, 1, 1, 0, 0],  // head top
      [0, 0, 2, 1, 1, 2, 0, 0],  // head with shadow
      [0, 0, 2, 2, 2, 0, 0, 0],  // head bottom narrowing
      [0, 0, 0, 4, 5, 0, 0, 0],  // stick
      [0, 0, 0, 4, 5, 0, 0, 0],
      [0, 0, 0, 4, 5, 0, 0, 0],
      [0, 0, 0, 4, 5, 0, 0, 0],
      [0, 0, 0, 4, 5, 0, 0, 0],
      [0, 0, 0, 4, 4, 0, 0, 0],  // stick end
    ];
    // Pulsing reddish glow behind the match head
    ctx.globalAlpha = 0.20 + 0.14 * Math.sin(Date.now() / 200);
    ctx.fillStyle   = '#FF3300';
    ctx.fillRect(px - 2, py - 2, 20, 24);
    ctx.globalAlpha = 1;
    for (let r = 0; r < icon.length; r++) {
      for (let c = 0; c < icon[r].length; c++) {
        const idx = icon[r][c];
        if (!idx) continue;
        ctx.fillStyle = matchPal[idx];
        ctx.fillRect(px + c * ps, py + r * ps, ps, ps);
      }
    }
  },

  // ── Flame mode duration bar ────────────────────────────────────────────────
  flameIndicator() {
    if (!state.flameMode) return;
    const pct  = state.flameMode / FLAME_DURATION;
    const glow = 0.65 + 0.35 * Math.sin(Date.now() / 120);

    ctx.textAlign = 'left';
    ctx.font      = '11px monospace';
    ctx.fillStyle = `rgba(255,140,0,${glow})`;
    ctx.fillText('FLAME', 6, 17);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(6, 20, 52, 5);
    ctx.fillStyle = `hsl(${Math.floor(pct * 40 + 5)}, 100%, 50%)`;
    ctx.fillRect(6, 20, Math.floor(52 * pct), 5);
  },

  player() {
    const { x, y, vy } = state.player;
    const ch = CHARS[state.selectedChar];
    const sprite = state.fartFrame > 0
      ? ch.tilt
      : Math.floor(state.animTick / 16) % 2 === 0 ? ch.idle : ch.bob2;

    const tilt = state.fartFrame > 0
      ? -0.22
      : Math.max(-0.34, Math.min(0.54, vy * 0.055));

    ctx.save();
    ctx.translate(x + PLAYER_W / 2, y + PLAYER_H / 2);
    ctx.rotate(tilt);
    drawSprite(sprite, -PLAYER_W / 2, -PLAYER_H / 2, 2, ch.pal);
    ctx.restore();
  },

  deadPlayer() {
    const ch = CHARS[state.selectedChar];
    ctx.save();
    ctx.translate(state.player.x + PLAYER_W / 2, state.deathY + PLAYER_H / 2);
    ctx.rotate(state.deathAngle);
    drawSprite(ch.idle, -PLAYER_W / 2, -PLAYER_H / 2, 2, ch.pal);
    ctx.restore();
  },

  score() {
    ctx.textAlign   = 'center';
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth   = 3;
    ctx.font        = 'bold 22px monospace';
    ctx.strokeText(state.score, LOGICAL_W / 2, 38);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(state.score, LOGICAL_W / 2, 38);
  },

  flash() {
    if (state.flashFrames > 0) {
      ctx.fillStyle = 'rgba(255,70,70,0.38)';
      ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    }
  },

  // ── Character select / title screen ───────────────────────────────────────
  selectScreen() {
    const cx = LOGICAL_W / 2;

    // Dim overlay over the scrolling background
    ctx.fillStyle = 'rgba(0,0,0,0.30)';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // "FART FLYER" title
    const pulse = 0.85 + 0.15 * Math.sin(Date.now() / 450);
    ctx.globalAlpha = pulse;
    ctx.textAlign   = 'center';
    ctx.font        = 'bold 28px monospace';
    ctx.strokeStyle = '#333';
    ctx.lineWidth   = 3;
    ctx.strokeText('FART FLYER', cx, 52);
    ctx.fillStyle = '#FFD700';
    ctx.fillText('FART FLYER', cx, 52);
    ctx.globalAlpha = 1;

    ctx.font      = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.80)';
    ctx.fillText('Choose your flyer!', cx, 70);

    // Three character panels — 88 px wide, 12 px gap
    const panelW = 88, panelH = 82;
    const panelY = 82;
    const panelXs = [12, 116, 220];
    const sel = state.selectedChar;

    for (let i = 0; i < CHARS.length; i++) {
      const ch  = CHARS[i];
      const px  = panelXs[i];
      const isSel = (i === sel);

      // Panel background
      ctx.fillStyle = isSel ? 'rgba(255,255,200,0.16)' : 'rgba(0,0,0,0.40)';
      ctx.fillRect(px, panelY, panelW, panelH);

      // Border
      ctx.strokeStyle = isSel ? ch.color : 'rgba(255,255,255,0.22)';
      ctx.lineWidth   = isSel ? 2.5 : 1;
      ctx.strokeRect(px + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

      // Portrait centred in panel, drawn at pixel-size 3 (30×42 px)
      const sprX = px + Math.floor((panelW - 30) / 2);
      const sprY = panelY + 6;
      drawSprite(ch.idle, sprX, sprY, 3, ch.pal);

      // Character name
      ctx.textAlign = 'center';
      ctx.font      = isSel ? 'bold 11px monospace' : '11px monospace';
      ctx.fillStyle = isSel ? ch.color : 'rgba(255,255,255,0.70)';
      ctx.fillText(ch.name, px + panelW / 2, panelY + panelH - 6);
    }

    // "Play as X!" pulsing call-to-action
    const btn = 0.55 + 0.45 * Math.sin(Date.now() / 280);
    ctx.globalAlpha = btn;
    ctx.font        = 'bold 14px monospace';
    ctx.fillStyle   = '#FFD700';
    ctx.textAlign   = 'center';
    ctx.fillText(`\u25B6  Play as ${CHARS[sel].name}!  \u25C0`, cx, panelY + panelH + 26);
    ctx.globalAlpha = 1;

    // ← → hint
    ctx.font      = '10px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText('\u2190\u2192 keys to switch  \u2022  tap to pick & play', cx, panelY + panelH + 44);

    // Best score
    if (state.best > 0) {
      ctx.font      = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.60)';
      ctx.fillText(`Best: ${state.best}`, cx, LOGICAL_H - 12);
    }
  },

  // ── Game over screen ────────────────────────────────────────────────────────
  gameOverScreen() {
    const cx = LOGICAL_W / 2;
    const cy = LOGICAL_H / 2;
    const isNewBest = state.score > 0 && state.score >= state.best;

    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(cx - 98, cy - 72, 196, 148);

    ctx.textAlign   = 'center';
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth   = 3;

    ctx.font      = 'bold 26px monospace';
    ctx.fillStyle = '#FF6B6B';
    ctx.strokeText('GAME OVER', cx, cy - 34);
    ctx.fillText('GAME OVER',   cx, cy - 34);

    ctx.lineWidth = 2;
    ctx.font      = '15px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`Score: ${state.score}`, cx, cy + 2);

    ctx.fillStyle = isNewBest ? '#FFD700' : '#FFFFFF';
    ctx.fillText(`Best:  ${state.best}`, cx, cy + 22);

    if (isNewBest) {
      ctx.font      = '11px monospace';
      ctx.fillStyle = '#FFD700';
      ctx.fillText('\u2605 NEW BEST! \u2605', cx, cy + 40);
    }

    const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 250);
    ctx.globalAlpha = pulse;
    ctx.font        = '13px monospace';
    ctx.fillStyle   = '#FFD700';
    ctx.fillText('Tap to play again', cx, isNewBest ? cy + 58 : cy + 50);
    ctx.globalAlpha = 1;
  },
};
