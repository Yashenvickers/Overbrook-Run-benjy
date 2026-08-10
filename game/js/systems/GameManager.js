// GameManager.js — orchestrates the run: world, player, enemies, pickups,
// checkpoints, special events, scoring, and the Philly Momentum / 5600 Mode
// systems. main.js drives GameManager.update(dt) once per frame while the
// "game" screen is active, and reacts to onGameOver / onVictory callbacks.
import * as THREE from 'three';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Pickup } from '../entities/Pickup.js';
import { WEAPONS } from '../entities/Weapons.js';
import { Momentum } from './Momentum.js';
import { SECTIONS, sectionForZ, TOTAL_LENGTH } from '../world/Sections.js';
import { dist2D, clamp, shortestAngleDiff, damp } from '../utils/MathUtils.js';

const PICKUP_TYPE_TO_WEAPON = { weapon_pump: 'pump', weapon_rapid: 'rapid', weapon_flash: 'flash' };
const SAFEHOUSE = { x: 0, z: 655 };

function forwardWithSpread(camera, spread) {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  if (spread > 0) {
    dir.x += (Math.random() - 0.5) * spread;
    dir.y += (Math.random() - 0.5) * spread * 0.5;
    dir.z += (Math.random() - 0.5) * spread;
    dir.normalize();
  }
  return dir;
}

export class GameManager {
  constructor(canvas, audio, hud, input) {
    this.canvas = canvas;
    this.audio = audio;
    this.hud = hud;
    this.input = input;
    this.onGameOver = null;
    this.onVictory = null;
    this.raycaster = new THREE.Raycaster();
  }

  init(quality) {
    this.world = new World(this.canvas, quality);
    this.player = new Player(this.world.camera, this.world, this.audio);
    this.momentum = new Momentum();
    this.enemies = [];
    this.pickups = [];
  }

  start() {
    // reset dynamic state for a fresh run without rebuilding static geometry
    this.enemies.forEach((e) => e.dispose());
    this.pickups.forEach((p) => p.collect());
    this.enemies = [];
    this.pickups = [];

    this.player.reset();
    this.player.respawnAt(0, SECTIONS[0].spawnZ);

    this.momentum = new Momentum();
    this.score = 0;
    this.combo = 1; this.maxCombo = 1; this._comboTimer = 0;
    this.defeatedCount = 0;
    this.elapsed = 0;
    this._prevFireHeld = false;
    this._prevSwitch = false;
    this._prevMode5600Key = false;
    this._ended = false;
    this.activeSectionId = -1;
    this.sectionEnterTime = {};
    this.checkpointsReached = new Set();
    this.triggerSpawned = new Set();
    this.eventFlags = {};
    SECTIONS.forEach((s) => { this.eventFlags[s.id] = { started: false, completed: false, timer: 0, waveEnemies: [] }; });

    this._spawnAllPickups();
    this._pendingCheckpointMsg = null;
    this._targetFov = 75;
  }

  _spawnAllPickups() {
    for (const section of SECTIONS) {
      for (const p of section.pickups) {
        this.pickups.push(new Pickup(p.type, p.x, p.z, this.world));
      }
    }
  }

  _spawnWave(waveList, centerZ, aggression) {
    const spawned = [];
    for (const entry of waveList) {
      for (let i = 0; i < entry.count; i++) {
        const x = (Math.random() - 0.5) * 9;
        const z = centerZ + (Math.random() - 0.5) * 10;
        const enemy = new Enemy(entry.type, x, z, this.world, this.audio, { aggression });
        this.enemies.push(enemy);
        spawned.push(enemy);
      }
    }
    return spawned;
  }

  _awardKill(enemy) {
    this.defeatedCount++;
    this._comboTimer = 4;
    this.combo = Math.min(10, this.combo + 1);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const mult = this.player.mode5600 ? 1.5 : 1;
    this.score += Math.round(enemy.stats.score * this.combo * mult);
    this.momentum.onKill();
  }

  _handleFire(dt) {
    const weaponKey = this.player.currentWeapon;
    const w = WEAPONS[weaponKey];
    const heldFire = this.input.isFiring();
    const wantsFire = w.auto ? heldFire : (heldFire && !this._prevFireHeld);
    this._prevFireHeld = heldFire;

    const aiming = this.input.isAiming();
    const result = this.player.tryFire(dt, wantsFire);
    if (!result.fired) return;

    if (w.stun) {
      this.audio.playStunBlast();
      const forward = this.player.getForwardVector();
      let stunned = 0;
      for (const en of this.enemies) {
        if (!en.alive) continue;
        const dx = en.x - this.player.position.x, dz = en.z - this.player.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist > w.stunRadius) continue;
        const dot = (dx * forward.x + dz * forward.z) / (dist || 1);
        if (dot > 0.15 || dist < 3) {
          en.stun(w.stunDuration);
          const before = en.alive;
          en.takeDamage(w.damage);
          stunned++;
          if (before && !en.alive) this._awardKill(en);
        }
      }
      if (stunned > 0) this.player.shotsHit++;
      return;
    }

    this.audio.playGunshot(w.kind);
    const spread = w.spread * (aiming ? 0.4 : 1);
    const pelletDamage = w.pellets > 1 ? w.pelletDamage : w.damage;
    const meshes = this.enemies.filter((e) => e.alive).map((e) => e.mesh);
    let anyHit = false;
    for (let i = 0; i < w.pellets; i++) {
      const dir = forwardWithSpread(this.world.camera, spread);
      this.raycaster.set(this.world.camera.position, dir);
      this.raycaster.far = w.range;
      const hits = this.raycaster.intersectObjects(meshes, true);
      if (!hits.length) continue;
      let obj = hits[0].object;
      while (obj && !obj.userData.enemyRef) obj = obj.parent;
      const enemy = obj && obj.userData.enemyRef;
      if (!enemy || !enemy.alive) continue;
      anyHit = true;
      const wasAlive = enemy.alive;
      enemy.takeDamage(pelletDamage);
      this.score += pelletDamage;
      this.momentum.onAccurateHit();
      this.hud.els.hitmarker.classList.remove('show'); void this.hud.els.hitmarker.offsetWidth; this.hud.els.hitmarker.classList.add('show');
      this.audio.playHitMarker();
      if (wasAlive && !enemy.alive) this._awardKill(enemy);
    }
    if (anyHit) this.player.shotsHit++;
  }

  _handleReloadSwitch5600() {
    if (this.input.isDown('reload') || this.input.consumePressed('reload')) this.player.startReload();
    const wantSwitch = this.input.keys.has('KeyQ') || this.input.consumePressed('switch');
    if (wantSwitch && !this._prevSwitch) this.player.switchWeapon();
    this._prevSwitch = wantSwitch;

    const wantMode = this.input.keys.has('KeyF') || this.input.consumePressed('mode5600');
    if (wantMode && !this._prevMode5600Key && this.momentum.ready && !this.player.mode5600) {
      this.player.activate5600(10);
      this.momentum.consume();
      this._mode5600JustActivated = true;
    }
    this._prevMode5600Key = wantMode;
  }

  _updateSectionsAndEvents(dt) {
    const section = sectionForZ(this.player.position.z);
    if (section.id !== this.activeSectionId) {
      this.activeSectionId = section.id;
      this.sectionEnterTime[section.id] = this.elapsed;
      this._pendingCheckpointMsg = section.directional;
    }

    // encounter waves
    section.encounterTriggers.forEach((trig, idx) => {
      const key = `${section.id}-${idx}`;
      if (this.player.position.z >= trig.z && !this.triggerSpawned.has(key)) {
        this.triggerSpawned.add(key);
        this._spawnWave(trig.wave, this.player.position.z + 14, 1 + section.id * 0.1);
      }
    });

    // checkpoint
    if (this.player.position.z >= section.checkpointZ && !this.checkpointsReached.has(section.id)) {
      this.checkpointsReached.add(section.id);
      const timeIn = this.elapsed - (this.sectionEnterTime[section.id] || this.elapsed);
      const fastBonus = timeIn < 20 ? 15 : timeIn < 35 ? 8 : 0;
      this.momentum.onCheckpoint(fastBonus);
      this.score += 200 + fastBonus * 10;
      this.audio.playCheckpoint();
      this._pendingCheckpointMsg = `CHECKPOINT REACHED — ${section.name}`;
    }

    this._updateSpecialEvent(section, dt);
  }

  _updateSpecialEvent(section, dt) {
    const ev = section.specialEvent;
    const flags = this.eventFlags[section.id];
    if (!ev || flags.completed) return;

    if (!flags.started) {
      if (this.player.position.z >= ev.triggerZ) {
        flags.started = true;
        flags.timer = ev.duration || 0;
        this._pendingCheckpointMsg = ev.label;
        const wave = this._spawnWave(ev.wave, this.player.position.z + 10, 1 + section.id * 0.15);
        flags.waveEnemies = wave;
        if (ev.type === 'keyItem') {
          flags.keyPickup = new Pickup('key', ev.storeX, ev.storeZ, this.world);
          this.pickups.push(flags.keyPickup);
        }
      }
      return;
    }

    switch (ev.type) {
      case 'pincer':
        flags.completed = true;
        break;
      case 'timedWave': {
        flags.timer -= dt;
        const cleared = flags.waveEnemies.every((e) => !e.alive);
        if (flags.timer <= 0 || cleared) {
          flags.completed = true;
          this._pendingCheckpointMsg = 'GATE UNLOCKED — MOVE!';
          this.score += 300;
        }
        break;
      }
      case 'keyItem':
        if (flags.keyPickup && flags.keyPickup.collected) {
          flags.completed = true;
          this._pendingCheckpointMsg = 'KEY SECURED';
          this.score += 300;
        }
        break;
      case 'trainCrossing': {
        flags.timer += dt;
        const trainZ = section.zStart + 5 + Math.sin(flags.timer * 0.5) * 55 + 55;
        if (this.world.trainRef) this.world.trainRef.position.z = trainZ;
        const nearTrack = Math.abs(this.player.position.x - ev.trackX) < 2.2;
        const trainClose = Math.abs(trainZ - this.player.position.z) < 3.5;
        if (nearTrack && trainClose && this.player.invulnTimer <= 0) {
          this.player.takeDamage(35);
          this.audio.playPlayerHurt();
          const push = this.player.position.x < ev.trackX ? -1 : 1;
          const resolved = this.world.resolveCollision(ev.safeX * Math.sign(push || 1), this.player.position.z, 0.4);
          this.player.position.x = resolved.x;
          this._tookDamageThisFrame = true;
          this._damageBearing = 0;
        }
        if (this.player.position.z > ev.triggerZ + 40) flags.completed = true;
        break;
      }
      case 'finalWave': {
        flags.timer -= dt;
        if (flags.timer <= 0) {
          flags.completed = true;
          this._pendingCheckpointMsg = 'THE BLOCK IS CLEAR — GET INSIDE';
        }
        break;
      }
    }
  }

  _updatePickups() {
    for (const pk of this.pickups) {
      if (pk.collected) continue;
      pk.update(1 / 60);
      const d = dist2D(this.player.position.x, this.player.position.z, pk.x, pk.z);
      if (d < 1.3) {
        this._applyPickup(pk);
        pk.collect();
        this.audio.playPickup();
      }
    }
  }

  _applyPickup(pk) {
    switch (pk.type) {
      case 'health': this.player.addHealth(35); break;
      case 'armor': this.player.addArmor(35); break;
      case 'ammo':
        this.player.addAmmo('blaster', 24);
        if (this.player.owned.rapid) this.player.addAmmo('rapid', 30);
        if (this.player.owned.pump) this.player.addAmmo('pump', 6);
        if (this.player.owned.flash) this.player.addAmmo('flash', 1);
        break;
      case 'key': this.score += 100; break;
      default: {
        const wk = PICKUP_TYPE_TO_WEAPON[pk.type];
        if (wk) { this.player.giveWeapon(wk); this._pendingCheckpointMsg = `PICKED UP ${WEAPONS[wk].name}`; }
      }
    }
  }

  _updateEnemies(dt) {
    this._tookDamageThisFrame = this._tookDamageThisFrame || false;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const en = this.enemies[i];
      const res = en.update(dt, this.player, this.enemies);
      if (res.attackedPlayer) {
        const hitChance = en.stats.ranged ? 0.8 : 0.97;
        if (Math.random() < hitChance && this.player.invulnTimer <= 0) {
          const variance = 0.8 + Math.random() * 0.4;
          this.player.takeDamage(en.stats.damage * variance);
          this.audio.playPlayerHurt();
          this._tookDamageThisFrame = true;
          const worldAngle = Math.atan2(this.player.position.x - en.x, this.player.position.z - en.z);
          this._damageBearing = shortestAngleDiff(this.player.yaw, worldAngle);
        }
      }
      if (res.removeMe) { en.dispose(); this.enemies.splice(i, 1); }
    }
  }

  _objective() {
    const unreached = SECTIONS.find((s) => !this.checkpointsReached.has(s.id));
    if (unreached) return { x: 0, z: unreached.checkpointZ };
    return SAFEHOUSE;
  }

  update(dt) {
    this.elapsed += dt;
    this._tookDamageThisFrame = false;
    this._damageBearing = null;
    this._mode5600JustActivated = false;

    this.player.update(dt, this.input, this.elapsed);
    this._handleFire(dt);
    this._handleReloadSwitch5600();
    this._updateSectionsAndEvents(dt);
    this._updateEnemies(dt);
    this._updatePickups();

    const moving = Math.hypot(this.input.getMoveVector().x, this.input.getMoveVector().z) > 0.05;
    this.momentum.update(dt, moving, this._tookDamageThisFrame);
    if (this._comboTimer > 0) { this._comboTimer -= dt; if (this._comboTimer <= 0) this.combo = 1; }

    const aiming = this.input.isAiming();
    this._targetFov = aiming ? 58 : 75;
    this.world.camera.fov = damp(this.world.camera.fov, this._targetFov, 10, dt);
    this.world.camera.updateProjectionMatrix();

    this.world.update(dt, this.elapsed, this.player.position.z);

    this._updateHUD(dt);
    this._checkEndConditions();
  }

  _updateHUD(dt) {
    const section = sectionForZ(this.player.position.z);
    const obj = this._objective();
    // worldAngle must match the camera's yaw convention (forward = (-sin(yaw), -cos(yaw))),
    // so that a bearing of 0 truly means "the objective is dead ahead on screen".
    const worldAngle = Math.atan2(this.player.position.x - obj.x, this.player.position.z - obj.z);
    const bearing = shortestAngleDiff(this.player.yaw, worldAngle);
    const dist = dist2D(this.player.position.x, this.player.position.z, obj.x, obj.z);

    const w = WEAPONS[this.player.currentWeapon];
    const a = this.player.ammo[this.player.currentWeapon];

    this.hud.update(dt, {
      health: this.player.health, armor: this.player.armor, stamina: this.player.stamina,
      elapsed: this.elapsed, score: this.score, combo: this.combo,
      sectionName: section.name,
      weaponName: this.player.reloading ? `${w.name} — RELOADING` : w.name,
      ammoMag: a.mag, ammoReserve: a.reserve,
      momentumPct: this.momentum.pct, momentumReady: this.momentum.ready,
      aiming: this.input.isAiming(),
      mode5600: this.player.mode5600,
      objectiveBearing: bearing, objectiveDist: dist,
      checkpointMsg: this._pendingCheckpointMsg,
      hitmarker: false,
      tookDamage: this._tookDamageThisFrame,
      damageBearing: this._damageBearing,
      mode5600Activated: this._mode5600JustActivated,
    });
    this._pendingCheckpointMsg = null;
  }

  _checkEndConditions() {
    if (this._ended) return;
    if (!this.player.alive) {
      this._ended = true;
      if (this.onGameOver) this.onGameOver(this._buildStats());
      return;
    }
    const finalFlags = this.eventFlags[4];
    if (this.player.position.z >= SAFEHOUSE.z - 3 && finalFlags && finalFlags.completed) {
      this._ended = true;
      if (this.onVictory) this.onVictory(this._buildStats());
    }
  }

  _buildStats() {
    return {
      distance: Math.round(this.player.distanceTraveled),
      defeated: this.defeatedCount,
      accuracy: this.player.accuracy,
      score: Math.round(this.score),
      time: this.elapsed,
      combo: this.maxCombo,
    };
  }

  render() { this.world.render(); }
}
