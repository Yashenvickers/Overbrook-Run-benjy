// AudioManager.js
//
// 100% procedural WebAudio sound design — no external audio files are shipped,
// so the game has zero binary asset dependencies and works offline once loaded.
// Every sound (gunfire, footsteps, reload, ambience, and the background
// instrumental) is synthesized at runtime from oscillators / noise buffers.
//
// >>> To swap in real recorded audio later: replace the body of any `play*`
// method with `this._playFile('assets/audio/xyz.mp3')` (helper included below)
// and drop files into game/assets/audio/. See README "Asset Insertion Points".

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicVolume = 0.55;
    this.sfxVolume = 0.75;
    this._musicPlaying = false;
    this._musicTimer = null;
    this._ambienceNodes = [];
    this._noiseBufferCache = null;
  }

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.master);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMusicVolume(pct) {
    this.musicVolume = pct / 100;
    if (this.musicGain) this.musicGain.gain.value = this.musicVolume;
  }

  setSfxVolume(pct) {
    this.sfxVolume = pct / 100;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  // Helper for real audio files later:
  async _playFile(url, dest) {
    if (!this.ctx) return;
    const res = await fetch(url);
    const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(dest || this.sfxGain);
    src.start();
  }

  _noiseBuffer(seconds = 1) {
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * seconds, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  _env(gainNode, t0, attack, decay, peak = 1) {
    gainNode.gain.cancelScheduledValues(t0);
    gainNode.gain.setValueAtTime(0.0001, t0);
    gainNode.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  }

  // ---------------- SFX ----------------

  playGunshot(kind = 'blaster') {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(0.25);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = kind === 'pump' ? 900 : kind === 'rapid' ? 1500 : 1200;
    filter.Q.value = 0.7;
    const gain = this.ctx.createGain();
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    const dur = kind === 'pump' ? 0.18 : 0.08;
    this._env(gain, t0, 0.002, dur, kind === 'pump' ? 1.0 : 0.7);
    noise.start(t0); noise.stop(t0 + dur + 0.05);

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(kind === 'pump' ? 140 : 220, t0);
    osc.frequency.exponentialRampToValueAtTime(60, t0 + dur);
    const oGain = this.ctx.createGain();
    osc.connect(oGain).connect(this.sfxGain);
    this._env(oGain, t0, 0.001, dur, 0.5);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  playStunBlast() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t0);
    osc.frequency.linearRampToValueAtTime(1400, t0 + 0.4);
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.02, 0.45, 0.6);
    osc.start(t0); osc.stop(t0 + 0.5);
  }

  playReload() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [0, 0.12].forEach((off) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 500;
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.sfxGain);
      this._env(gain, t0 + off, 0.001, 0.05, 0.3);
      osc.start(t0 + off); osc.stop(t0 + off + 0.08);
    });
  }

  playFootstep(surface = 'concrete') {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this._noiseBuffer(0.12);
    const filter = this.ctx.createBiquadFilter();
    filter.type = surface === 'metal' ? 'highpass' : surface === 'wet' ? 'bandpass' : 'lowpass';
    filter.frequency.value = surface === 'metal' ? 1800 : surface === 'wet' ? 900 : 400;
    const gain = this.ctx.createGain();
    noise.connect(filter).connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.001, 0.08, 0.25);
    noise.start(t0); noise.stop(t0 + 0.1);
  }

  playHitMarker() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 1400;
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.001, 0.06, 0.4);
    osc.start(t0); osc.stop(t0 + 0.08);
  }

  playPlayerHurt() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t0);
    osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.3);
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.005, 0.28, 0.35);
    osc.start(t0); osc.stop(t0 + 0.32);
  }

  playEnemyAlert() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [0, 0.15].forEach((off, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = i === 0 ? 700 : 900;
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.sfxGain);
      this._env(gain, t0 + off, 0.005, 0.1, 0.2);
      osc.start(t0 + off); osc.stop(t0 + off + 0.14);
    });
  }

  playEnemyDown() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.35);
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.005, 0.32, 0.3);
    osc.start(t0); osc.stop(t0 + 0.4);
  }

  playCheckpoint() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [523, 659, 784].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.sfxGain);
      this._env(gain, t0 + i * 0.09, 0.01, 0.2, 0.3);
      osc.start(t0 + i * 0.09); osc.stop(t0 + i * 0.09 + 0.25);
    });
  }

  playPickup() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t0);
    osc.frequency.exponentialRampToValueAtTime(880, t0 + 0.12);
    const gain = this.ctx.createGain();
    osc.connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.005, 0.15, 0.3);
    osc.start(t0); osc.stop(t0 + 0.18);
  }

  play5600Activate() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t0);
    osc.frequency.exponentialRampToValueAtTime(700, t0 + 0.6);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t0);
    filter.frequency.exponentialRampToValueAtTime(4000, t0 + 0.6);
    const gain = this.ctx.createGain();
    osc.connect(filter).connect(gain).connect(this.sfxGain);
    this._env(gain, t0, 0.02, 0.6, 0.5);
    osc.start(t0); osc.stop(t0 + 0.65);
    this._playChant();
  }

  // Stylized two-tone "FIVE-SIX!" crowd chant (synthesized, not real vocals/recordings)
  _playChant(times = 3) {
    if (!this.ctx) return;
    let t0 = this.ctx.currentTime + 0.2;
    for (let i = 0; i < times; i++) {
      [220, 165].forEach((f, j) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 500;
        filter.Q.value = 1.2;
        const gain = this.ctx.createGain();
        osc.connect(filter).connect(gain).connect(this.sfxGain);
        const t = t0 + j * 0.22;
        this._env(gain, t, 0.02, 0.18, 0.22);
        osc.start(t); osc.stop(t + 0.22);
      });
      t0 += 0.55;
    }
  }

  playVictoryStinger() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.sfxGain);
      this._env(gain, t0 + i * 0.14, 0.01, 0.35, 0.35);
      osc.start(t0 + i * 0.14); osc.stop(t0 + i * 0.14 + 0.4);
    });
  }

  playDefeatStinger() {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    [392, 349, 293, 220].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const gain = this.ctx.createGain();
      osc.connect(gain).connect(this.sfxGain);
      this._env(gain, t0 + i * 0.18, 0.01, 0.4, 0.3);
      osc.start(t0 + i * 0.18); osc.stop(t0 + i * 0.18 + 0.45);
    });
  }

  // ---------------- Background instrumental (original, procedural loop) ----------------
  startMusic() {
    if (!this.ctx || this._musicPlaying) return;
    this._musicPlaying = true;
    const bpm = 92;
    const beat = 60 / bpm;
    let step = 0;
    const bassPattern = [0, 0, 3, 0, 5, 0, 3, 2];
    const scheduleStep = () => {
      if (!this._musicPlaying) return;
      const t0 = this.ctx.currentTime;
      // kick
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t0);
        osc.frequency.exponentialRampToValueAtTime(45, t0 + 0.12);
        const gain = this.ctx.createGain();
        osc.connect(gain).connect(this.musicGain);
        this._env(gain, t0, 0.001, 0.15, 0.55);
        osc.start(t0); osc.stop(t0 + 0.16);
      }
      // hats
      if (step % 1 === 0) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this._noiseBuffer(0.05);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 6000;
        const gain = this.ctx.createGain();
        noise.connect(filter).connect(gain).connect(this.musicGain);
        this._env(gain, t0, 0.001, 0.04, step % 2 === 0 ? 0.12 : 0.06);
        noise.start(t0); noise.stop(t0 + 0.05);
      }
      // bass note (low synth, Philly boom-bap inspired instrumental, fully original)
      const semis = bassPattern[step % bassPattern.length];
      const freq = 55 * Math.pow(2, semis / 12);
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 300;
      const gain = this.ctx.createGain();
      osc.connect(filter).connect(gain).connect(this.musicGain);
      this._env(gain, t0, 0.01, beat * 0.9, 0.22);
      osc.start(t0); osc.stop(t0 + beat);

      step++;
      this._musicTimer = setTimeout(scheduleStep, beat * 1000 / 2);
    };
    scheduleStep();
  }

  stopMusic() {
    this._musicPlaying = false;
    if (this._musicTimer) clearTimeout(this._musicTimer);
  }

  // Looping ambience bed (rain/wind + distant traffic) mixed low under SFX/music
  startAmbience() {
    if (!this.ctx) return;
    this.stopAmbience();
    const noise = this.ctx.createBufferSource();
    const buf = this._noiseBuffer(4);
    noise.buffer = buf;
    noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.05;
    noise.connect(filter).connect(gain).connect(this.master);
    noise.start();
    this._ambienceNodes.push(noise);
  }

  stopAmbience() {
    this._ambienceNodes.forEach((n) => { try { n.stop(); } catch (e) {} });
    this._ambienceNodes = [];
  }
}

export const AudioBus = new AudioManager();
