// PropFactory.js — procedural low-poly building blocks for the Overbrook map.
// Every function returns { group: THREE.Group, collider } where collider is
// an axis-aligned box { x, z, hx, hz } in world space (already positioned)
// used by the simple 2D collision system in World.js.
import * as THREE from 'three';
import { brickTexture, windowLitTexture, graffitiTexture, metalTexture } from './Textures.js';

const flat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0.05, ...extra });

let brickTex, windowTex, metalTex, graffitiTexes;
function ensureShared() {
  if (!brickTex) {
    brickTex = brickTexture();
    windowTex = windowLitTexture();
    metalTex = metalTexture();
    graffitiTexes = [graffitiTexture('#c8ff5a'), graffitiTexture('#ffb020'), graffitiTexture('#c9d2cc')];
  }
}

export function createRowhouse(x, z, ry = 0, opts = {}) {
  ensureShared();
  const width = opts.width || 8, depth = opts.depth || 10, height = opts.height || 9;
  const g = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ map: brickTex, flatShading: true, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), bodyMat);
  body.position.y = height / 2;
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  // roofline cap
  const cap = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.4, depth + 0.3), flat('#2a2a2a'));
  cap.position.y = height + 0.2;
  g.add(cap);

  // window strip facing the street (+z front) — emissiveMap (not a flat emissive
  // color) so only the lit window cells in the texture actually glow amber.
  const winMat = new THREE.MeshStandardMaterial({ map: windowTex, emissiveMap: windowTex, emissive: 0xffcf6b, emissiveIntensity: 1.1, roughness: 0.6 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.7, height * 0.55), winMat);
  win.position.set(0, height * 0.55, depth / 2 + 0.06);
  g.add(win);

  // front steps / porch
  const porch = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, 0.5, 1.6), flat('#8a8a86'));
  porch.position.set(0, 0.25, depth / 2 + 0.9);
  g.add(porch);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, 0.9, 0.08), flat('#3a3a3a'));
  rail.position.set(0, 0.9, depth / 2 + 1.6);
  g.add(rail);

  // occasional graffiti tag on side wall
  if (opts.graffiti) {
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2.2), new THREE.MeshStandardMaterial({ map: graffitiTexes[opts.graffitiIdx % 3], transparent: true }));
    tag.position.set(width / 2 + 0.03, 2, depth / 4);
    tag.rotation.y = Math.PI / 2;
    g.add(tag);
  }

  g.position.set(x, 0, z);
  g.rotation.y = ry;

  const hx = ry === 0 ? width / 2 : depth / 2;
  const hz = ry === 0 ? depth / 2 : width / 2;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createCornerStore(x, z, ry = 0) {
  ensureShared();
  const g = new THREE.Group();
  const w = 12, d = 10, h = 5.2;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), flat('#3a4a3f'));
  body.position.y = h / 2;
  g.add(body);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 0.4, 2.4), flat('#ffb020'));
  awning.position.set(0, h - 0.6, d / 2 + 1.2);
  g.add(awning);
  for (let i = -1; i <= 1; i += 2) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 1, 6), flat('#222'));
    pole.position.set(i * (w / 2 - 0.6), (h - 1) / 2, d / 2 + 2.2);
    g.add(pole);
  }
  const sign = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 1, 0.3), flat('#c8ff5a', { emissive: 0x2a4d16, emissiveIntensity: 0.5 }));
  sign.position.set(0, h + 0.2, d / 2 - 0.2);
  g.add(sign);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x223227, transparent: true, opacity: 0.6, roughness: 0.2, metalness: 0.4 });
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.75, h * 0.55), glassMat);
  glass.position.set(0, h * 0.4, d / 2 + 0.05);
  g.add(glass);

  g.position.set(x, 0, z);
  g.rotation.y = ry;
  const hx = ry === 0 ? w / 2 : d / 2;
  const hz = ry === 0 ? d / 2 : w / 2;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createStreetlight(x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 6), flat('#20241f'));
  pole.position.y = 3;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), flat('#20241f'));
  arm.position.set(0.55, 5.9, 0);
  g.add(arm);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffdb7a, emissiveIntensity: 1.4 }));
  lamp.position.set(1.1, 5.75, 0);
  g.add(lamp);
  const light = new THREE.PointLight(0xffdb7a, 6, 14, 2);
  light.position.set(1.1, 5.6, 0);
  g.add(light);
  g.position.set(x, 0, z);
  g.userData.flickerLight = light;
  return { group: g, collider: { x, z, hx: 0.2, hz: 0.2 } };
}

export function createStopSign(x, z, ry = 0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), flat('#666'));
  pole.position.y = 1.2;
  g.add(pole);
  const sign = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 8), flat('#c0392b'));
  sign.rotation.x = Math.PI / 2;
  sign.position.y = 2.5;
  g.add(sign);
  g.position.set(x, 0, z); g.rotation.y = ry;
  return { group: g, collider: { x, z, hx: 0.15, hz: 0.15 } };
}

export function createUtilityPole(x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 8, 6), flat('#4a3626'));
  pole.position.y = 4;
  g.add(pole);
  const cross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.1), flat('#4a3626'));
  cross.position.y = 7.2;
  g.add(cross);
  g.position.set(x, 0, z);
  return { group: g, collider: { x, z, hx: 0.2, hz: 0.2 } };
}

export function createTrashCan(x, z) {
  const g = new THREE.Group();
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.9, 8), flat('#2f4d38'));
  can.position.y = 0.45;
  g.add(can);
  g.position.set(x, 0, z);
  return { group: g, collider: { x, z, hx: 0.4, hz: 0.4 } };
}

export function createFireHydrant(x, z) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.7, 8), flat('#d4a017'));
  body.position.y = 0.35;
  g.add(body);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), flat('#d4a017'));
  cap.position.y = 0.75;
  g.add(cap);
  g.position.set(x, 0, z);
  return { group: g, collider: { x, z, hx: 0.3, hz: 0.3 } };
}

export function createFence(x, z, length = 4, ry = 0) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map: metalTexture(), flatShading: true, roughness: 0.6, metalness: 0.6 });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(length, 1.4, 0.06), mat);
  panel.position.y = 0.7;
  g.add(panel);
  g.position.set(x, 0, z); g.rotation.y = ry;
  const hx = ry === 0 ? length / 2 : 0.1;
  const hz = ry === 0 ? 0.1 : length / 2;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createParkedCar(x, z, ry = 0, color = '#274d6b') {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.8, 4.2), flat(color));
  body.position.y = 0.6;
  g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 2.2), flat('#111'));
  cabin.position.y = 1.25;
  g.add(cabin);
  [[-0.85, 0.35, 1.4], [0.85, 0.35, 1.4], [-0.85, 0.35, -1.4], [0.85, 0.35, -1.4]].forEach((p) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 10), flat('#111'));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(p[0], p[1], p[2]);
    g.add(wheel);
  });
  g.position.set(x, 0, z); g.rotation.y = ry;
  const hx = ry === 0 ? 1.1 : 2.3;
  const hz = ry === 0 ? 2.3 : 1.1;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createBus(x, z, ry = 0) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3, 2.6, 9), flat('#b9c2bb'));
  body.position.y = 1.6;
  g.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.02, 0.5, 9.02), flat('#2f7a4a'));
  stripe.position.y = 1.2;
  g.add(stripe);
  const windows = new THREE.Mesh(new THREE.BoxGeometry(3.03, 0.9, 8.6), new THREE.MeshStandardMaterial({ color: 0x1c2a24, roughness: 0.3, metalness: 0.4 }));
  windows.position.y = 2.15;
  g.add(windows);
  [-3.8, 3.8].forEach((zz) => {
    [-1.5, 1.5].forEach((xx) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 10), flat('#111'));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(xx, 0.5, zz);
      g.add(wheel);
    });
  });
  g.position.set(x, 0, z); g.rotation.y = ry;
  const hx = ry === 0 ? 1.6 : 4.6;
  const hz = ry === 0 ? 4.6 : 1.6;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createBasketballHoop(x, z, ry = 0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.6, 8), flat('#333'));
  pole.position.y = 1.8;
  g.add(pole);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), flat('#333'));
  arm.position.set(0, 3.5, 0.6);
  g.add(arm);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.06), flat('#e8e8e0'));
  board.position.set(0, 3.6, 1.1);
  g.add(board);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.03, 6, 12), flat('#ff5a1f'));
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.15, 1.35);
  g.add(rim);
  g.position.set(x, 0, z); g.rotation.y = ry;
  return { group: g, collider: { x, z, hx: 0.2, hz: 0.2 } };
}

export function createRecCenter(x, z, ry = 0) {
  const g = new THREE.Group();
  const w = 18, d = 14, h = 7;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), flat('#22422c'));
  body.position.y = h / 2;
  g.add(body);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 1.4, 0.3), flat('#ffb020', { emissive: 0xffb020, emissiveIntensity: 0.4 }));
  sign.position.set(0, h + 0.4, d / 2);
  g.add(sign);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.4), new THREE.MeshStandardMaterial({ color: 0x111, emissive: 0x2f7a4a, emissiveIntensity: 0.6 }));
  doorGlow.position.set(0, 1.7, d / 2 + 0.05);
  g.add(doorGlow);
  g.position.set(x, 0, z); g.rotation.y = ry;
  const hx = ry === 0 ? w / 2 : d / 2;
  const hz = ry === 0 ? d / 2 : w / 2;
  return { group: g, collider: { x, z, hx, hz } };
}

export function createTrainPlatform(x, z, length = 30) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, length), flat('#5c5c58'));
  deck.position.y = 0.3;
  g.add(deck);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.05, length), flat('#ffb020'));
  edge.position.y = 0.62;
  g.add(edge);
  for (let i = -length / 2 + 3; i < length / 2; i += 6) {
    const roofPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.4, 6), flat('#333'));
    roofPole.position.set(-2.6, 2.3, i);
    g.add(roofPole);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, length), flat('#2a2a2a'));
  roof.position.set(-2.6, 4, 0);
  g.add(roof);
  g.position.set(x, 0, z);
  return { group: g, collider: { x, z, hx: 3, hz: length / 2 } };
}

export function createTrain(x, z, length = 40) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3, length), flat('#b9c2bb'));
  body.position.y = 1.8;
  g.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.45, 0.6, length), flat('#c8ff5a'));
  stripe.position.y = 1.3;
  g.add(stripe);
  const windows = new THREE.Mesh(new THREE.BoxGeometry(3.45, 1, length - 2), new THREE.MeshStandardMaterial({ color: 0x1c2a24, roughness: 0.3, metalness: 0.4, emissive: 0x334, emissiveIntensity: 0.3 }));
  windows.position.y = 2.4;
  g.add(windows);
  g.position.set(x, 0, z);
  return { group: g, collider: null };
}

export function createSafehouse(x, z) {
  const g = new THREE.Group();
  ensureShared();
  const w = 16, d = 14, h = 10;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: brickTex, flatShading: true, color: 0x9fae9f }));
  body.position.y = h / 2;
  g.add(body);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.3, d + 0.4), flat('#c8ff5a', { emissive: 0xc8ff5a, emissiveIntensity: 1.2 }));
  glow.position.y = h + 0.15;
  g.add(glow);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(3, 4.2, 0.3), flat('#111'));
  doorFrame.position.set(0, 2.1, d / 2 + 0.1);
  g.add(doorFrame);
  const doorLight = new THREE.PointLight(0xc8ff5a, 8, 18, 2);
  doorLight.position.set(0, 3, d / 2 + 2);
  g.add(doorLight);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.4), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0xffb020, emissiveIntensity: 0.8 }));
  sign.position.set(0, h - 1, d / 2 + 0.16);
  g.add(sign);
  g.position.set(x, 0, z);
  return { group: g, collider: { x, z, hx: w / 2, hz: d / 2 } };
}
