// Pickup.js — floating collectibles: health, armor, ammo, and weapon crates.
import * as THREE from 'three';

const COLORS = {
  health: 0xff3b3b,
  armor: 0x5fb3ff,
  ammo: 0xffb020,
  weapon_pump: 0xc9d2cc,
  weapon_rapid: 0xc9d2cc,
  weapon_flash: 0xc8ff5a,
};

function labelFor(type) {
  switch (type) {
    case 'health': return 'HEALTH';
    case 'armor': return 'ARMOR';
    case 'ammo': return 'AMMO';
    case 'weapon_pump': return 'BROAD STREET PUMP';
    case 'weapon_rapid': return 'OVERBROOK RAPID';
    case 'weapon_flash': return 'PHILLY FLASH';
    default: return type.toUpperCase();
  }
}

export class Pickup {
  constructor(type, x, z, world) {
    this.type = type;
    this.x = x; this.z = z;
    this.world = world;
    this.collected = false;
    this.label = labelFor(type);
    this.bob = Math.random() * 10;

    const g = new THREE.Group();
    const color = COLORS[type] || 0xffffff;
    const isWeapon = type.startsWith('weapon_');
    const geo = isWeapon ? new THREE.BoxGeometry(0.5, 0.35, 0.7) : new THREE.OctahedronGeometry(0.32, 0);
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3, metalness: 0.4 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1;
    g.add(mesh);
    this.spinMesh = mesh;

    const light = new THREE.PointLight(color, 3, 5, 2);
    light.position.y = 1;
    g.add(light);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 20), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    g.add(ring);

    g.position.set(x, 0, z);
    this.group = g;
    world.scene.add(g);
  }

  update(dt) {
    this.bob += dt;
    this.spinMesh.position.y = 1 + Math.sin(this.bob * 2) * 0.12;
    this.spinMesh.rotation.y += dt * 1.6;
  }

  collect() {
    this.collected = true;
    this.world.scene.remove(this.group);
  }
}
