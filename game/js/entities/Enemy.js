// Enemy.js — fictional arcade opponents with simple state-machine AI:
// patrol -> detect -> chase -> attack -> search, plus flank/cutoff behavior
// for Blockers and Scouts. All opponents are entirely fictional; defeats are
// non-graphic (a knockout stagger + fade, no blood/gore).
import * as THREE from 'three';
import { clamp, dist2D, randRange, angleTo, shortestAngleDiff } from '../utils/MathUtils.js';

export const ENEMY_TYPES = {
  chaser: { health: 30, speed: 4.6, damage: 7, attackRange: 1.7, attackInterval: 0.9, detectRange: 22, ranged: false, color: 0x3f6b46, score: 100 },
  blocker: { health: 55, speed: 4.0, damage: 10, attackRange: 1.9, attackInterval: 1.1, detectRange: 20, ranged: false, color: 0x8a908a, score: 150, blocker: true },
  ranged: { health: 24, speed: 3.3, damage: 6, attackRange: 17, attackInterval: 1.5, detectRange: 26, ranged: true, color: 0xd99a2b, score: 150 },
  heavy: { health: 95, speed: 2.3, damage: 15, attackRange: 2.1, attackInterval: 1.3, detectRange: 18, ranged: false, color: 0x2c2c2c, score: 250, scale: 1.35 },
  scout: { health: 16, speed: 6.4, damage: 5, attackRange: 1.5, attackInterval: 0.7, detectRange: 30, ranged: false, color: 0xcfd6cf, score: 175, scout: true, scale: 0.85 },
  captain: { health: 260, speed: 3.7, damage: 18, attackRange: 15, attackInterval: 1.1, detectRange: 45, ranged: true, color: 0x1c3a24, score: 1000, scale: 1.6, captain: true },
};

function buildEnemyMesh(type) {
  const t = ENEMY_TYPES[type];
  const scale = t.scale || 1;
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: t.color, flatShading: true, roughness: 0.75 });
  const accentMat = new THREE.MeshStandardMaterial({ color: t.captain ? 0xc8ff5a : 0x151515, flatShading: true, roughness: 0.6 });

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5 * scale, 0.7 * scale, 0.3 * scale), mat);
  torso.position.y = 1.1 * scale;
  g.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18 * scale, 8, 8), new THREE.MeshStandardMaterial({ color: 0x8a5a3c, flatShading: true }));
  head.position.y = 1.62 * scale;
  g.add(head);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.7), accentMat);
  hood.position.y = 1.66 * scale;
  g.add(hood);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.17 * scale, 0.65 * scale, 0.2 * scale), accentMat);
  legL.position.set(-0.14 * scale, 0.45 * scale, 0);
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.14 * scale;
  g.add(legR);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.55 * scale, 0.16 * scale), mat);
  armL.position.set(-0.34 * scale, 1.1 * scale, 0);
  g.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.34 * scale;
  g.add(armR);

  if (t.ranged || t.captain) {
    const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.4), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    gun.position.set(0.34 * scale, 0.95 * scale, 0.25);
    g.add(gun);
  }
  if (t.captain) {
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.9), new THREE.MeshStandardMaterial({ color: 0xc8ff5a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    cape.position.set(0, 1.05 * scale, -0.18 * scale);
    cape.rotation.x = 0.2;
    g.add(cape);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 5), new THREE.MeshStandardMaterial({ color: 0xffb020, emissive: 0xffb020, emissiveIntensity: 0.4 }));
    crown.position.y = 1.85 * scale;
    g.add(crown);
  }

  const ring = new THREE.Mesh(new THREE.RingGeometry(0.35 * scale, 0.42 * scale, 16), new THREE.MeshBasicMaterial({ color: t.captain ? 0xff3b3b : 0xffcc55, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  ring.visible = false;
  g.add(ring);

  return { group: g, legL, legR, armL, armR, torso, alertRing: ring };
}

let idCounter = 1;

export class Enemy {
  constructor(type, x, z, world, audio, options = {}) {
    this.id = idCounter++;
    this.type = type;
    this.stats = ENEMY_TYPES[type];
    this.world = world;
    this.audio = audio;
    this.aggression = options.aggression || 1;

    this.health = this.stats.health * (options.healthMult || 1);
    this.maxHealth = this.health;
    this.x = x; this.z = z; this.y = 0;
    this.spawnX = x; this.spawnZ = z;
    this.facing = Math.PI;
    this.state = 'patrol';
    this.stateTimer = randRange(0, 2);
    this.attackCooldown = 0;
    this.searchTimer = 0;
    this.stunTimer = 0;
    this.alive = true;
    this.fadeTimer = 0;
    this.walkCycle = Math.random() * 10;
    this._stuckTimer = 0;
    this._lastPos = { x, z };
    this._patrolTarget = { x: x + randRange(-4, 4), z: z + randRange(-4, 4) };
    this.flankSide = Math.random() < 0.5 ? -1 : 1;

    const built = buildEnemyMesh(type);
    this.mesh = built.group;
    this.parts = built;
    this.mesh.position.set(x, 0, z);
    this.mesh.userData.enemyRef = this;
    world.scene.add(this.mesh);
  }

  takeDamage(amount) {
    if (!this.alive) return 0;
    const dealt = Math.min(this.health, amount);
    this.health -= dealt;
    if (this.health <= 0) this.die();
    else if (this.state === 'patrol') { this.state = 'chase'; this.audio.playEnemyAlert(); }
    return dealt;
  }

  stun(duration) {
    if (!this.alive) return;
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  die() {
    this.alive = false;
    this.state = 'down';
    this.fadeTimer = 1.4;
    this.audio.playEnemyDown();
  }

  _moveToward(tx, tz, dt, speedMult = 1) {
    const speed = this.stats.speed * this.aggression * speedMult * (this.stunTimer > 0 ? 0.15 : 1);
    const dx = tx - this.x, dz = tz - this.z;
    const d = Math.hypot(dx, dz) || 0.0001;
    const stepX = (dx / d) * speed * dt;
    const stepZ = (dz / d) * speed * dt;
    const resolved = this.world.resolveCollision(this.x + stepX, this.z + stepZ, 0.4);
    const moved = Math.hypot(resolved.x - this.x, resolved.z - this.z);
    if (moved < speed * dt * 0.2) {
      this._stuckTimer += dt;
      if (this._stuckTimer > 0.5) {
        // side-step to get unstuck
        const perp = Math.atan2(dz, dx) + Math.PI / 2 * this.flankSide;
        const nx = this.x + Math.cos(perp) * speed * dt * 1.5;
        const nz = this.z + Math.sin(perp) * speed * dt * 1.5;
        const r2 = this.world.resolveCollision(nx, nz, 0.4);
        this.x = r2.x; this.z = r2.z;
        this._stuckTimer = 0;
      }
    } else {
      this._stuckTimer = 0;
    }
    this.x = resolved.x; this.z = resolved.z;
    this.facing = Math.atan2(dx, dz);
  }

  update(dt, player, allies) {
    if (!this.alive) {
      this.fadeTimer -= dt;
      const s = clamp(this.fadeTimer / 1.4, 0, 1);
      this.mesh.rotation.z = (1 - s) * -1.4;
      this.mesh.position.y = 0;
      this.mesh.traverse((o) => { if (o.material) { o.material.transparent = true; o.material.opacity = s; } });
      this.mesh.position.set(this.x, 0, this.z);
      return { attackedPlayer: false, removeMe: this.fadeTimer <= 0 };
    }

    if (this.stunTimer > 0) this.stunTimer -= dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    const dPlayer = dist2D(this.x, this.z, player.position.x, player.position.z);
    let attacked = false;

    switch (this.state) {
      case 'patrol': {
        const dToTarget = dist2D(this.x, this.z, this._patrolTarget.x, this._patrolTarget.z);
        if (dToTarget < 0.6 || this.stateTimer <= 0) {
          this._patrolTarget = { x: this.spawnX + randRange(-5, 5), z: this.spawnZ + randRange(-5, 5) };
          this.stateTimer = randRange(3, 6);
        }
        this.stateTimer -= dt;
        this._moveToward(this._patrolTarget.x, this._patrolTarget.z, dt, 0.4);
        if (dPlayer < this.stats.detectRange && player.alive) {
          this.state = 'chase';
          this.audio.playEnemyAlert();
          if (this.stats.scout) this._alertAllies(allies);
        }
        break;
      }
      case 'chase': {
        if (!player.alive) { this.state = 'patrol'; break; }
        if (dPlayer > this.stats.detectRange * 1.6) {
          this.state = 'search';
          this.searchTimer = 3;
          this._lastKnown = { x: player.position.x, z: player.position.z };
          break;
        }
        if (dPlayer <= this.stats.attackRange) {
          this.state = 'attack';
          break;
        }
        if (this.stats.blocker) {
          // try to cut off: aim for a point ahead of the player along their travel direction
          const leadX = player.position.x + Math.sin(player.yaw) * 3;
          const leadZ = player.position.z + Math.cos(player.yaw) * 3;
          this._moveToward(leadX, leadZ, dt);
        } else if (this.stats.scout) {
          // flank: approach from an angle rather than straight on
          const ang = angleTo(this.x, this.z, player.position.x, player.position.z);
          const flankAng = ang + (Math.PI / 3) * this.flankSide;
          const fx = player.position.x + Math.sin(flankAng + Math.PI) * 2.5;
          const fz = player.position.z + Math.cos(flankAng + Math.PI) * 2.5;
          this._moveToward(fx, fz, dt, 1.1);
        } else if (this.stats.ranged || this.stats.captain) {
          if (dPlayer < this.stats.attackRange * 0.6) {
            // keep distance
            this._moveToward(this.x - Math.sin(this.facing), this.z - Math.cos(this.facing), dt, 0.6);
          } else if (dPlayer > this.stats.attackRange * 0.9) {
            this._moveToward(player.position.x, player.position.z, dt);
          } else {
            this.state = 'attack';
          }
        } else {
          this._moveToward(player.position.x, player.position.z, dt);
        }
        break;
      }
      case 'attack': {
        if (!player.alive) { this.state = 'patrol'; break; }
        if (dPlayer > this.stats.attackRange * 1.15) { this.state = 'chase'; break; }
        this.facing = angleTo(this.x, this.z, player.position.x, player.position.z);
        if (this.attackCooldown <= 0 && this.stunTimer <= 0) {
          this.attackCooldown = this.stats.attackInterval / this.aggression;
          attacked = true;
        }
        if (this.stats.ranged || this.stats.captain) {
          // maintain stand-off distance
          if (dPlayer < this.stats.attackRange * 0.5) this._moveToward(this.x - Math.sin(this.facing), this.z - Math.cos(this.facing), dt, 0.5);
        }
        break;
      }
      case 'search': {
        this.searchTimer -= dt;
        if (this._lastKnown) this._moveToward(this._lastKnown.x, this._lastKnown.z, dt, 0.7);
        if (dPlayer < this.stats.detectRange) { this.state = 'chase'; break; }
        if (this.searchTimer <= 0) this.state = 'patrol';
        break;
      }
    }

    // simple leg animation
    if (this.state !== 'down') {
      const moving = this.state === 'chase' || this.state === 'patrol' || this.state === 'search';
      if (moving) this.walkCycle += dt * this.stats.speed * 2.2;
      const swing = moving ? Math.sin(this.walkCycle) * 0.5 : 0;
      this.parts.legL.rotation.x = swing;
      this.parts.legR.rotation.x = -swing;
      this.parts.armL.rotation.x = -swing * 0.7;
      this.parts.armR.rotation.x = swing * 0.7;
    }
    this.parts.alertRing.visible = this.state === 'chase' || this.state === 'attack';

    this.mesh.position.set(this.x, 0, this.z);
    this.mesh.rotation.y = this.facing;

    return { attackedPlayer: attacked, removeMe: false };
  }

  _alertAllies(allies) {
    for (const other of allies) {
      if (other === this || !other.alive) continue;
      if (other.state === 'patrol' && dist2D(this.x, this.z, other.x, other.z) < 14) {
        other.state = 'chase';
      }
    }
  }

  dispose() {
    this.world.scene.remove(this.mesh);
  }
}
