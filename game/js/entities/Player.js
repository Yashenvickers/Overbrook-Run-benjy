// Player.js — Benji 5600's first-person controller: movement, stamina,
// health/armor, crouch/sprint/jump, camera bob & recoil, and the visible
// first-person hands + weapon rig (jersey sleeve, gloves, gun models).
import * as THREE from 'three';
import { clamp, damp } from '../utils/MathUtils.js';
import { WEAPONS, WEAPON_ORDER } from './Weapons.js';
import { PLAY_HALF_WIDTH } from '../world/Sections.js';

const WALK_SPEED = 5.2;
const SPRINT_SPEED = 8.6;
const CROUCH_SPEED = 2.6;
const STAND_HEIGHT = 1.72;
const CROUCH_HEIGHT = 1.05;
const RADIUS = 0.42;
const GRAVITY = -22;
const JUMP_SPEED = 7.4;

function jerseyTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#123a24'; ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 40, 128, 14);
  ctx.fillStyle = '#c9d2cc';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('50', 64, 90);
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#c8ff5a';
  ctx.fillText('SIXERS', 64, 30);
  return new THREE.CanvasTexture(c);
}

function buildFirstPersonRig() {
  const rig = new THREE.Group();
  const jerseyMat = new THREE.MeshStandardMaterial({ map: jerseyTexture(), roughness: 0.7, flatShading: true });
  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0x8a5a3c, roughness: 0.8 });
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x2c2f2b, roughness: 0.4, metalness: 0.6 });
  const gunSilver = new THREE.MeshStandardMaterial({ color: 0xc9d2cc, roughness: 0.3, metalness: 0.8 });

  // right arm (sleeve + glove) holding the weapon
  const rArm = new THREE.Group();
  const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.5), jerseyMat);
  rSleeve.position.set(0, 0, 0.1);
  rArm.add(rSleeve);
  const rGlove = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.13, 0.22), gloveMat);
  rGlove.position.set(0, -0.02, 0.42);
  rArm.add(rGlove);
  rArm.position.set(0.22, -0.32, -0.55);
  rArm.rotation.y = -0.12;
  rig.add(rArm);

  // left arm supporting the weapon
  const lArm = new THREE.Group();
  const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.42), jerseyMat);
  lArm.add(lSleeve);
  const lGlove = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.2), gloveMat);
  lGlove.position.set(0, -0.01, 0.32);
  lArm.add(lGlove);
  lArm.position.set(-0.14, -0.36, -0.78);
  lArm.rotation.y = 0.18;
  rig.add(lArm);

  // weapon group swappable per-weapon visuals
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0.16, -0.28, -0.65);
  rig.add(weaponMount);

  function makeGunModel(kind) {
    const g = new THREE.Group();
    if (kind === 'pump') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.11, 0.6), gunMat);
      g.add(body);
      const pump = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.16), gunSilver);
      pump.position.set(0, -0.03, 0.05);
      g.add(pump);
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.22), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      stock.position.set(0, 0, 0.42);
      g.add(stock);
    } else if (kind === 'rapid') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.13, 0.55), gunMat);
      g.add(body);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.1), gunSilver);
      mag.position.set(0, -0.16, -0.05);
      g.add(mag);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), gunSilver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.42);
      g.add(barrel);
    } else if (kind === 'flash') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.32), new THREE.MeshStandardMaterial({ color: 0x1e3b2a, emissive: 0x2f7a4a, emissiveIntensity: 0.4 }));
      g.add(body);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0xc8ff5a, emissive: 0xc8ff5a, emissiveIntensity: 1.2 }));
      orb.position.set(0, 0.02, -0.2);
      g.add(orb);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.42), gunMat);
      g.add(body);
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.08), gunSilver);
      mag.position.set(0, -0.13, -0.02);
      g.add(mag);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.18, 6), gunSilver);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.015, -0.3);
      g.add(barrel);
    }
    return g;
  }

  rig.userData.makeGunModel = makeGunModel;
  rig.userData.weaponMount = weaponMount;
  rig.userData.rArm = rArm;
  return rig;
}

export class Player {
  constructor(camera, world, audio) {
    this.camera = camera;
    this.world = world;
    this.audio = audio;

    this.position = new THREE.Vector3(0, 0, 2);
    this.velocityY = 0;
    this.yaw = Math.PI; // facing +Z (down the street)
    this.pitch = 0;
    this.grounded = true;
    this.crouching = false;
    this.sprinting = false;
    this.height = STAND_HEIGHT;

    this.maxHealth = 100; this.health = 100;
    this.maxArmor = 100; this.armor = 25;
    this.maxStamina = 100; this.stamina = 100;

    this.alive = true;
    this.invulnTimer = 0;

    // weapons
    this.owned = { blaster: true, pump: false, rapid: false, flash: false };
    this.ammo = {
      blaster: { mag: WEAPONS.blaster.magSize, reserve: 90 },
      pump: { mag: 0, reserve: 0 },
      rapid: { mag: 0, reserve: 0 },
      flash: { mag: 0, reserve: 2 },
    };
    this.currentWeapon = 'blaster';
    this.fireCooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;

    this.bobTime = 0;
    this.recoilKick = 0;
    this.viewKickPitch = 0;

    // stats tracking for scoring
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.distanceTraveled = 0;
    this._lastTrackedPos = this.position.clone();

    this.mode5600 = false;
    this.mode5600Timer = 0;

    this.rig = buildFirstPersonRig();
    camera.add(this.rig);
    this._setWeaponModel('blaster');
  }

  _setWeaponModel(key) {
    const mount = this.rig.userData.weaponMount;
    while (mount.children.length) mount.remove(mount.children[0]);
    const model = this.rig.userData.makeGunModel(WEAPONS[key].kind);
    mount.add(model);
    this.weaponModel = model;
  }

  respawnAt(x, z) {
    this.position.set(x, 0, z);
    this.velocityY = 0;
  }

  // Reset all run-specific state without rebuilding the visible rig (so the
  // camera keeps exactly one set of hands/weapon attached across retries).
  reset() {
    this.health = this.maxHealth;
    this.armor = 25;
    this.stamina = this.maxStamina;
    this.alive = true;
    this.invulnTimer = 0;
    this.owned = { blaster: true, pump: false, rapid: false, flash: false };
    this.ammo = {
      blaster: { mag: WEAPONS.blaster.magSize, reserve: 90 },
      pump: { mag: 0, reserve: 0 },
      rapid: { mag: 0, reserve: 0 },
      flash: { mag: 0, reserve: 2 },
    };
    this.currentWeapon = 'blaster';
    this.fireCooldown = 0;
    this.reloading = false;
    this.reloadTimer = 0;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.distanceTraveled = 0;
    this.mode5600 = false;
    this.mode5600Timer = 0;
    this.recoilKick = 0;
    this.viewKickPitch = 0;
    this.bobTime = 0;
    this.yaw = Math.PI;
    this.pitch = 0;
    this.grounded = true;
    this.crouching = false;
    this.sprinting = false;
    this._setWeaponModel('blaster');
  }

  addHealth(amount) { this.health = clamp(this.health + amount, 0, this.maxHealth); }
  addArmor(amount) { this.armor = clamp(this.armor + amount, 0, this.maxArmor); }
  addAmmo(weaponKey, amount) {
    if (!this.owned[weaponKey]) this.owned[weaponKey] = true;
    this.ammo[weaponKey].reserve = clamp(this.ammo[weaponKey].reserve + amount, 0, WEAPONS[weaponKey].reserveMax);
  }
  giveWeapon(weaponKey) {
    this.owned[weaponKey] = true;
    const w = WEAPONS[weaponKey];
    if (this.ammo[weaponKey].mag <= 0) this.ammo[weaponKey].mag = Math.min(w.magSize, w.magSize);
    this.ammo[weaponKey].reserve = clamp(this.ammo[weaponKey].reserve + Math.floor(w.magSize * 2), 0, w.reserveMax);
  }

  takeDamage(amount) {
    if (!this.alive || this.invulnTimer > 0) return;
    let dmg = amount;
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, dmg * 0.6);
      this.armor -= absorbed;
      dmg -= absorbed;
    }
    this.health = clamp(this.health - dmg, 0, this.maxHealth);
    this.invulnTimer = 0.15;
    if (this.health <= 0) this.alive = false;
    return dmg;
  }

  switchWeapon() {
    const owned = WEAPON_ORDER.filter((k) => this.owned[k]);
    if (owned.length <= 1) return;
    const idx = owned.indexOf(this.currentWeapon);
    this.currentWeapon = owned[(idx + 1) % owned.length];
    this._setWeaponModel(this.currentWeapon);
    this.reloading = false;
  }

  startReload() {
    const w = WEAPONS[this.currentWeapon];
    const a = this.ammo[this.currentWeapon];
    if (this.reloading || a.mag >= w.magSize || a.reserve <= 0) return;
    this.reloading = true;
    this.reloadTimer = w.reloadTime * (this.mode5600 ? 0.55 : 1);
    this.audio.playReload();
  }

  activate5600(duration = 10) {
    this.mode5600 = true;
    this.mode5600Timer = duration;
    this.audio.play5600Activate();
  }

  // Returns {fired, spreadDir} if a shot was actually produced this frame.
  tryFire(dt, wantsFire) {
    const w = WEAPONS[this.currentWeapon];
    const a = this.ammo[this.currentWeapon];
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    if (!wantsFire || this.reloading || !this.alive) return { fired: false };
    if (this.fireCooldown > 0) return { fired: false };
    if (a.mag <= 0) {
      if (a.reserve > 0) this.startReload();
      return { fired: false };
    }
    this.fireCooldown = w.fireInterval * (this.mode5600 ? 0.8 : 1);
    a.mag--;
    this.shotsFired++;
    this.recoilKick = Math.min(1, this.recoilKick + w.recoil * 6);
    this.viewKickPitch += w.recoil;
    return { fired: true, weapon: w };
  }

  update(dt, input, elapsed) {
    if (this.invulnTimer > 0) this.invulnTimer -= dt;

    // ---- look ----
    const look = input.consumeLook();
    const sens = (window.__settings?.mouseSensitivity ?? 50) / 50 * 0.0022;
    this.yaw -= look.x * sens;
    this.pitch -= look.y * sens;
    this.pitch = clamp(this.pitch, -1.25, 1.25);

    // recoil recovery pulls view back down (kick recovers)
    this.viewKickPitch = damp(this.viewKickPitch, 0, 6, dt);
    this.recoilKick = damp(this.recoilKick, 0, 8, dt);

    // ---- movement ----
    const move = input.getMoveVector();
    this.crouching = input.isDown('crouch');
    const wantSprint = input.isDown('sprint') && move.z < -0.1 && !this.crouching;
    this.sprinting = wantSprint && this.stamina > 1;

    let speed = this.crouching ? CROUCH_SPEED : this.sprinting ? SPRINT_SPEED : WALK_SPEED;
    if (this.mode5600) speed *= 1.28;

    if (this.sprinting) this.stamina = clamp(this.stamina - dt * 18, 0, this.maxStamina);
    else this.stamina = clamp(this.stamina + dt * (this.crouching ? 8 : 12), 0, this.maxStamina);

    // Movement basis must match the camera's actual look direction (three.js
    // Y-rotation convention: forward = (-sin(yaw), -cos(yaw)), right = (cos(yaw), -sin(yaw))),
    // otherwise strafing/forward would drift away from what's on screen once the player turns.
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    const dx = (move.x * cos + move.z * sin) * speed * dt;
    const dz = (-move.x * sin + move.z * cos) * speed * dt;

    const targetHeight = this.crouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    this.height = damp(this.height, targetHeight, 10, dt);

    if (this.grounded && input.isDown('jump') && !this.crouching) {
      this.velocityY = JUMP_SPEED;
      this.grounded = false;
    }
    this.velocityY += GRAVITY * dt;
    let newY = this.position.y + this.velocityY * dt;
    if (newY <= 0) { newY = 0; this.velocityY = 0; this.grounded = true; }

    const moving = Math.hypot(move.x, move.z) > 0.05;
    const resolved = this.world.resolveCollision(this.position.x + dx, this.position.z + dz, RADIUS);
    const moved = Math.hypot(resolved.x - this.position.x, resolved.z - this.position.z);
    this.distanceTraveled += moved;
    this.position.x = resolved.x;
    this.position.z = resolved.z;
    this.position.y = newY;

    // ---- camera bob ----
    if (moving && this.grounded) {
      this.bobTime += dt * (this.sprinting ? 14 : this.crouching ? 7 : 10);
    }
    const bobY = moving && this.grounded ? Math.sin(this.bobTime) * (this.crouching ? 0.02 : 0.045) : 0;
    const bobX = moving && this.grounded ? Math.cos(this.bobTime * 0.5) * 0.03 : 0;

    this.camera.position.set(this.position.x + bobX, this.position.y + this.height + bobY, this.position.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch - this.viewKickPitch;

    // weapon sway + recoil kick visualization
    if (this.rig) {
      const swayX = moving ? Math.sin(this.bobTime) * 0.012 : 0;
      const swayY = moving ? Math.abs(Math.cos(this.bobTime)) * 0.01 : 0;
      this.rig.position.set(swayX, swayY - this.recoilKick * 0.05, this.recoilKick * 0.08);
      this.rig.rotation.x = -this.recoilKick * 0.25;
    }

    // 5600 mode timer
    if (this.mode5600) {
      this.mode5600Timer -= dt;
      if (this.mode5600Timer <= 0) { this.mode5600 = false; }
    }

    // reload timer
    if (this.reloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        const w = WEAPONS[this.currentWeapon];
        const a = this.ammo[this.currentWeapon];
        const need = w.magSize - a.mag;
        const take = Math.min(need, a.reserve);
        a.mag += take; a.reserve -= take;
        this.reloading = false;
      }
    }
  }

  getForwardVector() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return dir;
  }

  get accuracy() {
    if (this.shotsFired === 0) return 0;
    return clamp(Math.round((this.shotsHit / this.shotsFired) * 100), 0, 100);
  }
}
