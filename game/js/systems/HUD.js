// HUD.js — reads game state each frame and writes it into the DOM overlay.
// Kept isolated from game logic so GameManager just calls HUD.update(state).
import { formatTime, clamp } from '../utils/MathUtils.js';

function $(id) { return document.getElementById(id); }

export class HUD {
  constructor() {
    this.els = {
      health: $('hud-health'), armor: $('hud-armor'), stamina: $('hud-stamina'),
      timer: $('hud-timer'), score: $('hud-score'), combo: $('hud-combo'), comboBox: $('hud-combo-box'),
      sectionName: $('hud-section-name'), checkpointMsg: $('hud-checkpoint-msg'),
      crosshair: $('hud-crosshair'), hitmarker: $('hitmarker'), damageFlash: $('damage-flash'),
      damageIndicators: $('damage-indicators'),
      objectiveArrow: $('objective-arrow'), objectiveDist: $('objective-dist'),
      weaponName: $('hud-weapon-name'), ammo: $('hud-ammo'), ammoReserve: $('hud-ammo-reserve'),
      momentum: $('hud-momentum'), momentumReady: $('momentum-ready'),
      mode5600Banner: $('mode-5600-banner'), chantBanner: $('chant-banner'),
      gameScreen: $('screen-game'),
    };
    this._checkpointMsgTimer = 0;
    this._hitmarkerTimer = 0;
    this._flashTimer = 0;
  }

  update(dt, state) {
    const e = this.els;
    e.health.style.width = `${clamp(state.health, 0, 100)}%`;
    e.armor.style.width = `${clamp(state.armor, 0, 100)}%`;
    e.stamina.style.width = `${clamp(state.stamina, 0, 100)}%`;
    e.timer.textContent = formatTime(state.elapsed);
    e.score.textContent = Math.floor(state.score).toLocaleString();
    e.combo.textContent = state.combo;
    e.comboBox.style.opacity = state.combo > 1 ? '1' : '0.35';
    e.sectionName.textContent = state.sectionName;

    e.weaponName.textContent = state.weaponName;
    e.ammo.textContent = state.ammoMag;
    e.ammoReserve.textContent = state.ammoReserve;

    e.momentum.style.width = `${state.momentumPct}%`;
    e.momentumReady.classList.toggle('show', state.momentumReady);

    e.crosshair.classList.toggle('aiming', state.aiming);

    e.gameScreen.classList.toggle('mode-5600', state.mode5600);

    if (state.objectiveBearing !== null) {
      e.objectiveArrow.style.transform = `rotate(${state.objectiveBearing}rad)`;
      e.objectiveDist.textContent = `${Math.round(state.objectiveDist)}m`;
    }

    if (state.checkpointMsg) {
      e.checkpointMsg.textContent = state.checkpointMsg;
      e.checkpointMsg.classList.add('show');
      this._checkpointMsgTimer = 3.2;
    }
    if (this._checkpointMsgTimer > 0) {
      this._checkpointMsgTimer -= dt;
      if (this._checkpointMsgTimer <= 0) e.checkpointMsg.classList.remove('show');
    }

    if (state.hitmarker) {
      e.hitmarker.classList.remove('show'); void e.hitmarker.offsetWidth; e.hitmarker.classList.add('show');
    }

    if (state.tookDamage) {
      e.damageFlash.classList.add('show');
      this._flashTimer = 0.25;
      if (state.damageBearing !== null) this._spawnDamageIndicator(state.damageBearing);
    }
    if (this._flashTimer > 0) {
      this._flashTimer -= dt;
      if (this._flashTimer <= 0) e.damageFlash.classList.remove('show');
    }

    if (state.mode5600Activated) {
      e.mode5600Banner.classList.remove('show'); void e.mode5600Banner.offsetWidth; e.mode5600Banner.classList.add('show');
      e.chantBanner.classList.remove('show'); void e.chantBanner.offsetWidth; e.chantBanner.classList.add('show');
    }
  }

  _spawnDamageIndicator(bearing) {
    const el = document.createElement('div');
    el.className = 'dmg-indicator show';
    el.style.transform = `rotate(${bearing}rad)`;
    this.els.damageIndicators.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  showCheckpointMsg(text) {
    this.els.checkpointMsg.textContent = text;
    this.els.checkpointMsg.classList.add('show');
    clearTimeout(this._cpTimeout);
    this._cpTimeout = setTimeout(() => this.els.checkpointMsg.classList.remove('show'), 3200);
  }
}
