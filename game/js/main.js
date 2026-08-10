// main.js — screen state machine, bootstrapping, and the top-level game loop.
import { AudioBus } from './core/AudioManager.js';
import { InputManager } from './core/Input.js';
import { SaveData } from './core/SaveData.js';
import { Leaderboard } from './core/Leaderboard.js';
import { HUD } from './systems/HUD.js';
import { GameManager } from './systems/GameManager.js';
import { formatTime } from './utils/MathUtils.js';

const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

const canvas = document.getElementById('game-canvas');
const settings = SaveData.getSettings();
window.__settings = { mouseSensitivity: settings.mouseSensitivity, touchSensitivity: settings.touchSensitivity };

const input = new InputManager(canvas);
const hud = new HUD();
const gm = new GameManager(canvas, AudioBus, hud, input);
window.__gm = gm; // debug/inspection hook

let paused = false;
let currentScreen = 'loading';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  currentScreen = id;
  input.enabled = (id === 'screen-game' && !paused);
}

// ---------------- Boot ----------------
function boot() {
  gm.init(settings.quality);
  AudioBus.setMusicVolume(settings.musicVolume);
  AudioBus.setSfxVolume(settings.sfxVolume);
  document.getElementById('title-best-score').textContent = SaveData.getBestScore().toLocaleString();

  applySettingsToInputs();
  bindMenuButtons();
  bindMobileVisibility();

  gm.onGameOver = (stats) => onRunEnd(false, stats);
  gm.onVictory = (stats) => onRunEnd(true, stats);

  let pct = 0;
  const fill = document.getElementById('loading-fill');
  const iv = setInterval(() => {
    pct += 18 + Math.random() * 20;
    fill.style.width = `${Math.min(100, pct)}%`;
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => showScreen('screen-title'), 200);
    }
  }, 90);

  requestAnimationFrame(loop);
}

function bindMobileVisibility() {
  if (!isTouch) document.getElementById('mobile-controls').style.display = 'none';
}

// ---------------- Menu wiring ----------------
function bindMenuButtons() {
  document.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => handleAction(btn.dataset.action));
  });

  document.getElementById('story-skip').addEventListener('click', beginRun);
  document.getElementById('btn-pause').addEventListener('click', togglePause);

  // settings
  const musicR = document.getElementById('set-music');
  const sfxR = document.getElementById('set-sfx');
  const mouseR = document.getElementById('set-mouse');
  const touchR = document.getElementById('set-touch');
  const qualitySel = document.getElementById('set-quality');
  musicR.value = settings.musicVolume; sfxR.value = settings.sfxVolume;
  mouseR.value = settings.mouseSensitivity; touchR.value = settings.touchSensitivity;
  qualitySel.value = settings.quality;

  musicR.addEventListener('input', () => { AudioBus.setMusicVolume(+musicR.value); SaveData.updateSettings({ musicVolume: +musicR.value }); });
  sfxR.addEventListener('input', () => { AudioBus.setSfxVolume(+sfxR.value); SaveData.updateSettings({ sfxVolume: +sfxR.value }); });
  mouseR.addEventListener('input', () => { window.__settings.mouseSensitivity = +mouseR.value; SaveData.updateSettings({ mouseSensitivity: +mouseR.value }); });
  touchR.addEventListener('input', () => { window.__settings.touchSensitivity = +touchR.value; SaveData.updateSettings({ touchSensitivity: +touchR.value }); });
  qualitySel.addEventListener('change', () => { SaveData.updateSettings({ quality: qualitySel.value }); });
  document.getElementById('set-fullscreen').addEventListener('click', toggleFullscreen);

  document.getElementById('vic-submit').addEventListener('click', submitScore);

  canvas.addEventListener('click', () => {
    if (currentScreen === 'screen-game' && !paused && !isTouch && !input.pointerLocked) {
      input.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    if (currentScreen === 'screen-game' && !paused && !isTouch && !document.pointerLockElement) {
      pause();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && currentScreen === 'screen-game') {
      paused ? resume() : pause();
    }
  });
}

function applySettingsToInputs() {
  // placeholder hook if future per-frame settings application is needed
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function handleAction(action) {
  switch (action) {
    case 'play': showScreen('screen-story'); startStory(); break;
    case 'howto': showScreen('screen-howto'); break;
    case 'settings': showScreen('screen-settings'); backTarget = 'screen-title'; break;
    case 'settings-ingame': showScreen('screen-settings'); backTarget = 'screen-pause'; break;
    case 'leaderboard': showScreen('screen-leaderboard'); renderLeaderboard(); break;
    case 'credits': showScreen('screen-credits'); break;
    case 'back': showScreen(backTarget); break;
    case 'resume': resume(); break;
    case 'restart': hidePauseAndRestart(); break;
    case 'quit': quitToMenu(); break;
    case 'retry': retryRun(); break;
    default: break;
  }
}
let backTarget = 'screen-title';

// ---------------- Story ----------------
const STORY_TEXT = 'Overbrook is locked down. Every block between Benji and the 5600 Safe House is covered. No backup. No shortcuts. Keep moving, protect the jersey, and make it home.';
function startStory() {
  const el = document.getElementById('story-line');
  el.textContent = STORY_TEXT;
}

function beginRun() {
  AudioBus.init();
  AudioBus.resume();
  AudioBus.startMusic();
  AudioBus.startAmbience();
  gm.start();
  showScreen('screen-game');
  paused = false;
  if (!isTouch) input.requestPointerLock();
}

// ---------------- Pause ----------------
function togglePause() { paused ? resume() : pause(); }
function pause() {
  paused = true;
  input.enabled = false;
  if (!isTouch) input.exitPointerLock();
  document.getElementById('screen-pause').classList.add('active');
}
function resume() {
  paused = false;
  input.enabled = true;
  document.getElementById('screen-pause').classList.remove('active');
  if (!isTouch) input.requestPointerLock();
}
function hidePauseAndRestart() {
  document.getElementById('screen-pause').classList.remove('active');
  paused = false;
  beginRun();
}
function quitToMenu() {
  document.getElementById('screen-pause').classList.remove('active');
  paused = false;
  if (!isTouch) input.exitPointerLock();
  showScreen('screen-title');
  document.getElementById('title-best-score').textContent = SaveData.getBestScore().toLocaleString();
}
function retryRun() { beginRun(); }

// ---------------- End screens ----------------
let lastStats = null;
function onRunEnd(won, stats) {
  lastStats = stats;
  if (!isTouch) input.exitPointerLock();
  AudioBus.stopMusic();
  if (won) {
    AudioBus.playVictoryStinger();
    document.getElementById('vic-time').textContent = formatTime(stats.time);
    document.getElementById('vic-score').textContent = stats.score.toLocaleString();
    document.getElementById('vic-accuracy').textContent = `${stats.accuracy}%`;
    document.getElementById('vic-combo').textContent = `x${stats.combo}`;
    showScreen('screen-victory');
  } else {
    AudioBus.playDefeatStinger();
    document.getElementById('go-distance').textContent = `${stats.distance}m`;
    document.getElementById('go-defeated').textContent = stats.defeated;
    document.getElementById('go-accuracy').textContent = `${stats.accuracy}%`;
    document.getElementById('go-score').textContent = stats.score.toLocaleString();
    showScreen('screen-gameover');
  }
  setTimeout(() => AudioBus.startMusic(), 1500);
}

function submitScore() {
  if (!lastStats) return;
  const nameInput = document.getElementById('vic-name');
  const name = (nameInput.value || 'BENJI').toUpperCase().slice(0, 12);
  Leaderboard.submit({ name, score: lastStats.score, time: lastStats.time, accuracy: lastStats.accuracy, combo: lastStats.combo });
  nameInput.value = '';
  nameInput.placeholder = 'SUBMITTED!';
}

function renderLeaderboard() {
  Leaderboard.getScores().then((list) => {
    const ul = document.getElementById('leaderboard-list');
    if (!list.length) { ul.innerHTML = '<li>No runs yet — be the first through Overbrook.</li>'; return; }
    ul.innerHTML = list.slice(0, 15).map((s, i) => `<li><span>#${i + 1} ${s.name || 'BENJI'}</span><span>${(s.score || 0).toLocaleString()}</span></li>`).join('');
  });
}

// ---------------- Main loop ----------------
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (currentScreen === 'screen-game') {
    if (!paused) gm.update(dt);
    gm.render();
  }
  requestAnimationFrame(loop);
}

boot();
