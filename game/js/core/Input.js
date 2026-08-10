// Input.js — unified keyboard / mouse / touch input for desktop & mobile.
// Consumers call InputManager.getMove(), .consumeLook(), .isDown(action), etc.
// Pointer-lock is used on desktop for FPS mouse-look; touch devices use a
// virtual joystick (movement) + swipe zone (look) + on-screen buttons.

const KEY_MAP = {
  forward: ['KeyW', 'ArrowUp'],
  back: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  sprint: ['ShiftLeft', 'ShiftRight'],
  jump: ['Space'],
  crouch: ['KeyC', 'ControlLeft', 'ControlRight'],
  reload: ['KeyR'],
  interact: ['KeyE'],
  switch: ['KeyQ'],
  pause: ['Escape'],
  mode5600: ['KeyF'],
};

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseLeft = false;
    this.mouseRight = false;
    this.lookDX = 0;
    this.lookDY = 0;
    this.pointerLocked = false;
    this.enabled = false;

    // touch state
    this.touchMoveVec = { x: 0, y: 0 };
    this.touchButtons = {
      fire: false, aim: false, jump: false, sprint: false,
      crouch: false, reload: false, switch: false, mode5600: false,
    };
    this._joystickActive = false;
    this._joystickId = null;
    this._lookId = null;
    this._lastLookX = 0;
    this._lastLookY = 0;

    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
  }

  // ---------------- Keyboard ----------------
  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && this.enabled) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('blur', () => this.keys.clear());
  }

  // ---------------- Mouse / Pointer lock ----------------
  _bindMouse() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;
      if (e.button === 0) this.mouseLeft = true;
      if (e.button === 2) this.mouseRight = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseLeft = false;
      if (e.button === 2) this.mouseRight = false;
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    document.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.lookDX += e.movementX || 0;
      this.lookDY += e.movementY || 0;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });
  }

  requestPointerLock() {
    if (this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (document.exitPointerLock) document.exitPointerLock();
  }

  // ---------------- Touch ----------------
  _bindTouch() {
    const moveZone = document.getElementById('touch-move-zone');
    const joyBase = document.getElementById('touch-joystick-base');
    const joyKnob = document.getElementById('touch-joystick-knob');
    const lookZone = document.getElementById('touch-look-zone');

    const maxRadius = 42;

    if (moveZone) {
      moveZone.addEventListener('pointerdown', (e) => {
        this._joystickActive = true;
        this._joystickId = e.pointerId;
        const rect = joyBase.getBoundingClientRect();
        this._joyCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        moveZone.setPointerCapture(e.pointerId);
        updateKnob(e);
      });
      moveZone.addEventListener('pointermove', (e) => {
        if (this._joystickActive && e.pointerId === this._joystickId) updateKnob(e);
      });
      const endJoy = (e) => {
        if (e.pointerId !== this._joystickId) return;
        this._joystickActive = false;
        this.touchMoveVec.x = 0;
        this.touchMoveVec.y = 0;
        joyKnob.style.transform = 'translate(0px,0px)';
      };
      moveZone.addEventListener('pointerup', endJoy);
      moveZone.addEventListener('pointercancel', endJoy);
    }

    const updateKnob = (e) => {
      let dx = e.clientX - this._joyCenter.x;
      let dy = e.clientY - this._joyCenter.y;
      const len = Math.hypot(dx, dy);
      if (len > maxRadius) { dx = (dx / len) * maxRadius; dy = (dy / len) * maxRadius; }
      joyKnob.style.transform = `translate(${dx}px,${dy}px)`;
      this.touchMoveVec.x = dx / maxRadius;
      this.touchMoveVec.y = dy / maxRadius;
    };

    if (lookZone) {
      lookZone.addEventListener('pointerdown', (e) => {
        this._lookId = e.pointerId;
        this._lastLookX = e.clientX;
        this._lastLookY = e.clientY;
        lookZone.setPointerCapture(e.pointerId);
      });
      lookZone.addEventListener('pointermove', (e) => {
        if (e.pointerId !== this._lookId || !this.enabled) return;
        const dx = e.clientX - this._lastLookX;
        const dy = e.clientY - this._lastLookY;
        this._lastLookX = e.clientX;
        this._lastLookY = e.clientY;
        this.lookDX += dx * 1.4;
        this.lookDY += dy * 1.4;
      });
      const endLook = (e) => { if (e.pointerId === this._lookId) this._lookId = null; };
      lookZone.addEventListener('pointerup', endLook);
      lookZone.addEventListener('pointercancel', endLook);
    }

    const bindBtn = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;
      const on = (e) => { e.preventDefault(); this.touchButtons[key] = true; };
      const off = (e) => { e.preventDefault(); this.touchButtons[key] = false; };
      el.addEventListener('pointerdown', on);
      el.addEventListener('pointerup', off);
      el.addEventListener('pointercancel', off);
      el.addEventListener('pointerleave', off);
    };
    bindBtn('btn-fire', 'fire');
    bindBtn('btn-aim', 'aim');
    bindBtn('btn-jump', 'jump');
    bindBtn('btn-sprint', 'sprint');
    bindBtn('btn-crouch', 'crouch');
    bindBtn('btn-reload', 'reload');
    bindBtn('btn-switch', 'switch');
    bindBtn('btn-5600', 'mode5600');
  }

  // ---------------- Query API ----------------
  isDown(action) {
    const codes = KEY_MAP[action];
    if (codes && codes.some((c) => this.keys.has(c))) return true;
    if (action === 'sprint' && this.touchButtons.sprint) return true;
    if (action === 'jump' && this.touchButtons.jump) return true;
    if (action === 'crouch' && this.touchButtons.crouch) return true;
    return false;
  }

  isFiring() {
    return this.mouseLeft || this.touchButtons.fire;
  }

  isAiming() {
    return this.mouseRight || this.touchButtons.aim;
  }

  // one-shot presses handled by caller diffing keys; expose reload/switch/mode press via key OR touch toggle
  consumePressed(action) {
    // returns true once per touch-button tap for actions without natural key-repeat guard
    if (action === 'reload' && this.touchButtons.reload) { this.touchButtons.reload = false; return true; }
    if (action === 'switch' && this.touchButtons.switch) { this.touchButtons.switch = false; return true; }
    if (action === 'mode5600' && this.touchButtons.mode5600) { this.touchButtons.mode5600 = false; return true; }
    return false;
  }

  getMoveVector() {
    let x = 0, z = 0;
    if (this.isDown('forward')) z -= 1;
    if (this.isDown('back')) z += 1;
    if (this.isDown('left')) x -= 1;
    if (this.isDown('right')) x += 1;
    if (this._joystickActive) {
      x += this.touchMoveVec.x;
      z += this.touchMoveVec.y;
    }
    const len = Math.hypot(x, z);
    if (len > 1) { x /= len; z /= len; }
    return { x, z };
  }

  consumeLook() {
    const dx = this.lookDX, dy = this.lookDY;
    this.lookDX = 0; this.lookDY = 0;
    return { x: dx, y: dy };
  }
}
