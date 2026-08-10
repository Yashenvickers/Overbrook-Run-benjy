// Momentum.js — the "Philly Momentum" meter. Fills from movement, accurate
// hits, kills, fast checkpoints, and avoiding damage. At full, the player can
// trigger "5600 Mode" for a short, powerful burst.
import { clamp } from '../utils/MathUtils.js';

export class Momentum {
  constructor() {
    this.value = 15;
    this.max = 100;
    this._noDamageTime = 0;
  }

  update(dt, isMoving, tookDamage) {
    if (tookDamage) {
      this._noDamageTime = 0;
      this.value = clamp(this.value - 6, 0, this.max);
      return;
    }
    this._noDamageTime += dt;
    let gain = 0;
    if (isMoving) gain += dt * 1.1;
    if (this._noDamageTime > 3) gain += dt * 1.3;
    this.value = clamp(this.value + gain, 0, this.max);
  }

  onAccurateHit() { this.value = clamp(this.value + 3.5, 0, this.max); }
  onKill() { this.value = clamp(this.value + 9, 0, this.max); }
  onCheckpoint(fastBonus) { this.value = clamp(this.value + 12 + fastBonus, 0, this.max); }

  get ready() { return this.value >= this.max; }
  get pct() { return (this.value / this.max) * 100; }

  consume() { this.value = 0; }
}
