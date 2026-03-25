// audio.js — procedural sound effects via Web Audio API (no external files)

const SFX = {
  _ctx: null,

  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    if (!this._ctx) {
      try { this._ctx = new AC(); } catch (e) { return; }
      // Kick a silent 1-sample buffer synchronously — iOS needs an audio node
      // started inside the gesture handler to fully activate the pipeline.
      const b = this._ctx.createBuffer(1, 1, this._ctx.sampleRate);
      const s = this._ctx.createBufferSource();
      s.buffer = b;
      s.connect(this._ctx.destination);
      s.start(0);
    }

    // resume() is always async; call it on every gesture so the context
    // recovers after phone lock / app-switch suspensions.
    if (this._ctx.state !== 'running') this._ctx.resume();
  },

  // Run fn() as soon as the context is confirmed running.
  // If already running: immediate. If suspended/interrupted: after resume resolves.
  _play(fn) {
    if (!this._ctx) return;
    if (this._ctx.state === 'running') {
      fn();
    } else {
      this._ctx.resume().then(fn).catch(() => {});
    }
  },

  // Randomly pick one of three fart variations each tap
  fart() {
    this._play(() => {
      const pick = Math.floor(Math.random() * 3);
      if      (pick === 0) this._fart1();
      else if (pick === 1) this._fart2();
      else                 this._fart3();
    });
  },

  // ── Variation 1: mid-pitch sawtooth + brown noise (the classic) ────────────
  _fart1() {
    const ac  = this._ctx;
    const t   = ac.currentTime;
    const dur = 0.22 + Math.random() * 0.2;
    const hz  = 55 + Math.random() * 50;

    const osc     = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.42, t + dur);
    oscGain.gain.setValueAtTime(0.18, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(oscGain);

    const bufLen = Math.ceil(ac.sampleRate * dur);
    const buf    = ac.createBuffer(1, bufLen, ac.sampleRate);
    const d      = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const w = Math.random() * 2 - 1;
      last    = (last + 0.05 * w) / 1.05;
      d[i]    = last * 2.5;
    }
    const nSrc  = ac.createBufferSource();
    nSrc.buffer = buf;

    const bpf = ac.createBiquadFilter();
    bpf.type  = 'bandpass';
    bpf.frequency.setValueAtTime(hz * 4.5, t);
    bpf.frequency.exponentialRampToValueAtTime(hz, t + dur);
    bpf.Q.value = 1.2;

    const nGain = ac.createGain();
    nGain.gain.setValueAtTime(0.48, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    nSrc.connect(bpf);
    bpf.connect(nGain);

    const master = ac.createGain();
    master.gain.value = 0.975;
    oscGain.connect(master);
    nGain.connect(master);
    master.connect(ac.destination);

    osc.start(t);  osc.stop(t + dur);
    nSrc.start(t); nSrc.stop(t + dur);
  },

  // ── Variation 2: high-pitched squeaky fart (short, square wave) ───────────
  _fart2() {
    const ac  = this._ctx;
    const t   = ac.currentTime;
    const dur = 0.1 + Math.random() * 0.1;
    const hz  = 160 + Math.random() * 100;

    const osc  = ac.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 1.3, t + dur * 0.2);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.5, t + dur);

    const bpf = ac.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(hz * 2, t);
    bpf.Q.value = 3;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    const master = ac.createGain();
    master.gain.value = 0.975;

    osc.connect(bpf);
    bpf.connect(gain);
    gain.connect(master);
    master.connect(ac.destination);

    osc.start(t);
    osc.stop(t + dur);
  },

  // ── Variation 3: deep wet rumbling fart (long, low, heavy noise) ──────────
  _fart3() {
    const ac  = this._ctx;
    const t   = ac.currentTime;
    const dur = 0.45 + Math.random() * 0.2;
    const hz  = 28 + Math.random() * 22;

    const osc     = ac.createOscillator();
    const oscGain = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz, t);
    osc.frequency.exponentialRampToValueAtTime(hz * 0.35, t + dur);
    oscGain.gain.setValueAtTime(0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(oscGain);

    const bufLen = Math.ceil(ac.sampleRate * dur);
    const buf    = ac.createBuffer(1, bufLen, ac.sampleRate);
    const d      = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufLen; i++) {
      const w = Math.random() * 2 - 1;
      last    = (last + 0.02 * w) / 1.02;
      d[i]    = last * 3;
    }
    const nSrc  = ac.createBufferSource();
    nSrc.buffer = buf;

    const lpf = ac.createBiquadFilter();
    lpf.type  = 'lowpass';
    lpf.frequency.setValueAtTime(250, t);
    lpf.frequency.exponentialRampToValueAtTime(60, t + dur);

    const nGain = ac.createGain();
    nGain.gain.setValueAtTime(0.6, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    nSrc.connect(lpf);
    lpf.connect(nGain);

    const master = ac.createGain();
    master.gain.value = 0.975;
    oscGain.connect(master);
    nGain.connect(master);
    master.connect(ac.destination);

    osc.start(t);  osc.stop(t + dur);
    nSrc.start(t); nSrc.stop(t + dur);
  },

  // Score ping: rising sine tone
  ping() {
    this._play(() => {
      const ac   = this._ctx;
      const t    = ac.currentTime;
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.12);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    });
  },

  // Power-up collect: cheerful ascending arpeggio (C5 E5 G5 C6)
  powerup() {
    this._play(() => {
      const ac    = this._ctx;
      const notes = [523, 659, 784, 1047];
      notes.forEach((hz, i) => {
        const t    = ac.currentTime + i * 0.075;
        const osc  = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = hz;
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t);
        osc.stop(t + 0.14);
      });
    });
  },

  // Death thud: descending sawtooth crash
  death() {
    this._play(() => {
      const ac   = this._ctx;
      const t    = ac.currentTime;
      const osc  = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(38, t + 0.48);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.48);
    });
  },
};
