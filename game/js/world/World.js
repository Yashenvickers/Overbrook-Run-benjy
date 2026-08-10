// World.js — assembles the full Three.js scene: lighting, fog, sky, rain,
// the street, sidewalks, and every prop for the five sections. Also owns a
// lightweight 2D AABB collision list used by the player and enemies.
import * as THREE from 'three';
import * as Props from './PropFactory.js';
import { asphaltTexture, sidewalkTexture, courtTexture, skyGradient } from './Textures.js';
import { SECTIONS, ROAD_HALF_WIDTH, PLAY_HALF_WIDTH, TOTAL_LENGTH } from './Sections.js';
import { randRange, choice, clamp } from '../utils/MathUtils.js';

export class World {
  constructor(canvas, quality = 'medium') {
    this.quality = quality;
    this.canvas = canvas;
    this.colliders = []; // { x, z, hx, hz }
    this.flickerLights = [];
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040807);
    const density = quality === 'low' ? 0.0105 : quality === 'high' ? 0.0075 : 0.009;
    this.scene.fog = new THREE.FogExp2(0x0a1712, density);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 400);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality !== 'low',
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = quality !== 'low';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.trainRef = null;
    this.clouds = [];
    this.rain = null;

    this._buildLighting();
    this._buildGround();
    this._buildSky();
    if (quality !== 'low') this._buildRain();
    this._buildClouds();
    this._buildSections();
    this._buildSkylineSilhouette();

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _buildLighting() {
    const hemi = new THREE.HemisphereLight(0x223a2c, 0x0a0a0a, 0.9);
    this.scene.add(hemi);

    const moon = new THREE.DirectionalLight(0x9fb8c9, 0.55);
    moon.position.set(-40, 60, -20);
    if (this.quality !== 'low') {
      moon.castShadow = true;
      moon.shadow.mapSize.set(1024, 1024);
      moon.shadow.camera.left = -40;
      moon.shadow.camera.right = 40;
      moon.shadow.camera.top = 40;
      moon.shadow.camera.bottom = -40;
      moon.shadow.camera.far = 150;
    }
    this.scene.add(moon);
    this.moon = moon;

    const amberFill = new THREE.AmbientLight(0x3a2f10, 0.25);
    this.scene.add(amberFill);
  }

  _buildGround() {
    const asphalt = asphaltTexture();
    const groundLen = TOTAL_LENGTH + 40;
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_HALF_WIDTH * 2, groundLen),
      new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.35, metalness: 0.15, color: 0x9aa39d })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, groundLen / 2 - 20);
    road.receiveShadow = true;
    this.scene.add(road);

    const sideTex = sidewalkTexture();
    [-1, 1].forEach((side) => {
      const w = PLAY_HALF_WIDTH - ROAD_HALF_WIDTH;
      const walk = new THREE.Mesh(
        new THREE.PlaneGeometry(w, groundLen),
        new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.9 })
      );
      walk.rotation.x = -Math.PI / 2;
      walk.position.set(side * (ROAD_HALF_WIDTH + w / 2), 0.01, groundLen / 2 - 20);
      walk.receiveShadow = true;
      this.scene.add(walk);
    });

    // wide dark backdrop ground beyond sidewalks so there's no void
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(500, groundLen + 100),
      new THREE.MeshStandardMaterial({ color: 0x0a1510, roughness: 1 })
    );
    backdrop.rotation.x = -Math.PI / 2;
    backdrop.position.set(0, -0.02, groundLen / 2 - 20);
    this.scene.add(backdrop);
  }

  _buildSky() {
    const geo = new THREE.SphereGeometry(300, 16, 12);
    const mat = new THREE.MeshBasicMaterial({ map: skyGradient(), side: THREE.BackSide, fog: false });
    const sky = new THREE.Mesh(geo, mat);
    this.scene.add(sky);
  }

  _buildRain() {
    const count = this.quality === 'high' ? 4000 : 2200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = randRange(-30, 30);
      positions[i * 3 + 1] = randRange(0, 30);
      positions[i * 3 + 2] = randRange(-30, 30);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xaad4c0, size: 0.09, transparent: true, opacity: 0.5 });
    this.rain = new THREE.Points(geo, mat);
    this.scene.add(this.rain);
  }

  _buildClouds() {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 32, 4, 64, 32, 60);
    g.addColorStop(0, 'rgba(60,80,70,0.55)');
    g.addColorStop(1, 'rgba(60,80,70,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 64);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false });
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Sprite(mat);
      s.scale.set(randRange(40, 90), randRange(15, 30), 1);
      s.position.set(randRange(-80, 80), randRange(35, 55), randRange(-20, TOTAL_LENGTH + 20));
      this.scene.add(s);
      this.clouds.push(s);
    }
  }

  _buildSkylineSilhouette() {
    const mat = new THREE.MeshBasicMaterial({ color: 0x0d2117, fog: true });
    for (let i = 0; i < 26; i++) {
      const h = randRange(15, 55);
      const b = new THREE.Mesh(new THREE.BoxGeometry(randRange(8, 18), h, randRange(8, 18)), mat);
      const side = choice([-1, 1]);
      b.position.set(side * randRange(60, 110), h / 2, randRange(-20, TOTAL_LENGTH + 20));
      this.scene.add(b);
    }
  }

  _addCollider(entry) {
    this.scene.add(entry.group);
    entry.group.traverse((o) => { if (o.isMesh) { o.castShadow = this.quality !== 'low'; o.receiveShadow = true; } });
    if (entry.collider) this.colliders.push(entry.collider);
    return entry;
  }

  _rowOfHouses(zFrom, zTo, spacing, graffitiChance = 0.25) {
    const density = this.quality === 'low' ? spacing * 1.6 : spacing;
    for (let z = zFrom; z < zTo; z += density) {
      [-1, 1].forEach((side) => {
        const x = side * (PLAY_HALF_WIDTH + 4.2);
        const hasGraffiti = Math.random() < graffitiChance;
        this._addCollider(Props.createRowhouse(x, z + randRange(-1, 1), side > 0 ? Math.PI : 0, {
          width: randRange(7, 9), depth: 10, height: randRange(8, 11),
          graffiti: hasGraffiti, graffitiIdx: Math.floor(Math.random() * 3),
        }));
      });
    }
  }

  _streetFurniture(zFrom, zTo, spacing) {
    const density = this.quality === 'low' ? spacing * 1.8 : spacing;
    let toggle = 0;
    for (let z = zFrom; z < zTo; z += density) {
      const side = toggle % 2 === 0 ? -1 : 1;
      toggle++;
      const x = side * (ROAD_HALF_WIDTH + 0.6);
      const r = Math.random();
      if (r < 0.4) this._addCollider(Props.createStreetlight(x, z));
      else if (r < 0.55) this._addCollider(Props.createUtilityPole(x, z));
      else if (r < 0.7) this._addCollider(Props.createTrashCan(x, z));
      else if (r < 0.85) this._addCollider(Props.createFireHydrant(x, z));
      else this._addCollider(Props.createStopSign(x, z));
    }
  }

  _buildSections() {
    // Global streetlights + furniture along the whole run
    this._streetFurniture(5, TOTAL_LENGTH - 5, 16);

    // ---- Section 0: Overbrook Avenue ----
    this._rowOfHouses(5, 148, 15);
    for (let i = 0; i < 5; i++) {
      const z = randRange(15, 130);
      const side = choice([-1, 1]);
      this._addCollider(Props.createParkedCar(side * (ROAD_HALF_WIDTH - 1.1), z, Math.PI / 2, choice(['#274d6b', '#5b2020', '#333', '#3a5b2a'])));
    }

    // ---- Section 1: Basketball Courts ----
    const courtTex = courtTexture();
    const court = new THREE.Mesh(new THREE.PlaneGeometry(14, 26), new THREE.MeshStandardMaterial({ map: courtTex, roughness: 0.8 }));
    court.rotation.x = -Math.PI / 2;
    court.position.set(0, 0.02, 210);
    this.scene.add(court);
    this._addCollider(Props.createBasketballHoop(0, 200, 0));
    this._addCollider(Props.createBasketballHoop(0, 222, Math.PI));
    for (let i = 0; i < 6; i++) {
      const z = 195 + i * 6;
      this._addCollider(Props.createFence(-9, z, 6, 0));
      this._addCollider(Props.createFence(9, z, 6, 0));
    }
    this._addCollider(Props.createRecCenter(-16, 250, Math.PI / 2 * -1));
    this._rowOfHouses(150, 195, 16);
    this._rowOfHouses(232, 284, 16);

    // ---- Section 2: Market Block ----
    this._rowOfHouses(285, 434, 15, 0.35);
    this._addCollider(Props.createCornerStore(-8, 340, Math.PI / 2));
    this._addCollider(Props.createBus(6, 398, 0));
    for (let i = 0; i < 4; i++) {
      const z = randRange(295, 425);
      const side = choice([-1, 1]);
      this._addCollider(Props.createParkedCar(side * (ROAD_HALF_WIDTH - 1.1), z, Math.PI / 2, choice(['#274d6b', '#5b2020', '#333'])));
    }

    // ---- Section 3: Train Station ----
    this._addCollider(Props.createTrainPlatform(8, 500, 100));
    this._rowOfHouses(435, 470, 16);
    this._rowOfHouses(545, 584, 16);
    for (let i = 0; i < 5; i++) {
      this._addCollider(Props.createFence(-9, 450 + i * 26, 6, 0));
    }
    const train = Props.createTrain(0, -60, 46);
    this.scene.add(train.group);
    this.trainRef = train.group;

    // ---- Section 4: Safe House ----
    this._addCollider(Props.createSafehouse(0, 650));
    for (let i = 0; i < 6; i++) {
      this._addCollider(Props.createFence(-9.5, 590 + i * 12, 10, 0));
      this._addCollider(Props.createFence(9.5, 590 + i * 12, 10, 0));
    }
  }

  update(dt, elapsed, playerZ) {
    this.flickerLights.forEach((l) => {});
    this.scene.traverse((o) => {
      if (o.userData && o.userData.flickerLight) {
        const l = o.userData.flickerLight;
        l.intensity = 5 + Math.sin(elapsed * 8 + o.id) * 1.2 + (Math.random() < 0.01 ? -4 : 0);
      }
    });
    if (this.rain) {
      const pos = this.rain.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - dt * 22;
        if (y < 0) y = 30;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      this.rain.position.z = playerZ;
    }
    this.clouds.forEach((c, i) => { c.position.x += Math.sin(elapsed * 0.02 + i) * dt * 0.4; });
  }

  // Resolve a moving circle (radius r) against all box colliders near (x,z).
  resolveCollision(x, z, r) {
    let nx = x, nz = z;
    for (const c of this.colliders) {
      if (Math.abs(c.z - nz) > c.hz + r + 6) continue;
      const minX = c.x - c.hx, maxX = c.x + c.hx;
      const minZ = c.z - c.hz, maxZ = c.z + c.hz;
      const closestX = clamp(nx, minX, maxX);
      const closestZ = clamp(nz, minZ, maxZ);
      const dx = nx - closestX, dz = nz - closestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < r * r) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const push = (r - dist);
        nx += (dx / dist) * push;
        nz += (dz / dist) * push;
      }
    }
    nx = clamp(nx, -PLAY_HALF_WIDTH + 0.3, PLAY_HALF_WIDTH - 0.3);
    return { x: nx, z: nz };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
