// Sections.js — level data for the five areas of the run. The map is one
// continuous street that runs along +Z; each section owns a Z range,
// a checkpoint, spawn/pickup placements, and a special event.

export const ROAD_HALF_WIDTH = 5.5;
export const PLAY_HALF_WIDTH = 10.8;

export const SECTIONS = [
  {
    id: 0,
    key: 'overbrook_ave',
    name: 'OVERBROOK AVENUE',
    zStart: 0,
    zEnd: 150,
    checkpointZ: 138,
    spawnZ: 6,
    directional: 'HEAD DOWN OVERBROOK AVE',
    pickups: [
      { type: 'ammo', x: -3, z: 40 },
      { type: 'health', x: 3, z: 70 },
      { type: 'weapon_pump', x: -2.5, z: 100 },
      { type: 'armor', x: 2.5, z: 120 },
    ],
    encounterTriggers: [
      { z: 30, wave: [{ type: 'chaser', count: 2 }] },
      { z: 75, wave: [{ type: 'chaser', count: 2 }, { type: 'blocker', count: 1 }] },
    ],
    specialEvent: {
      type: 'pincer',
      triggerZ: 118,
      label: 'THEY’RE CLOSING IN — BOTH SIDES!',
      wave: [{ type: 'chaser', count: 3 }, { type: 'blocker', count: 2 }],
    },
  },
  {
    id: 1,
    key: 'courts',
    name: 'THE BASKETBALL COURTS',
    zStart: 150,
    zEnd: 285,
    checkpointZ: 272,
    spawnZ: 156,
    directional: 'CUT THROUGH THE COURTS',
    pickups: [
      { type: 'weapon_flash', x: -3, z: 190 },
      { type: 'ammo', x: 3, z: 210 },
      { type: 'health', x: -3, z: 245 },
    ],
    encounterTriggers: [
      { z: 175, wave: [{ type: 'chaser', count: 2 }, { type: 'scout', count: 1 }] },
    ],
    specialEvent: {
      type: 'timedWave',
      triggerZ: 225,
      duration: 30,
      label: 'HOLD THE COURT — GATE UNLOCKING',
      wave: [{ type: 'chaser', count: 3 }, { type: 'ranged', count: 2 }, { type: 'blocker', count: 1 }],
      gateZ: 270,
    },
  },
  {
    id: 2,
    key: 'market',
    name: 'MARKET BLOCK',
    zStart: 285,
    zEnd: 435,
    checkpointZ: 420,
    spawnZ: 291,
    directional: 'PUSH THROUGH MARKET BLOCK',
    pickups: [
      { type: 'weapon_rapid', x: 2.5, z: 320 },
      { type: 'ammo', x: -3, z: 350 },
      { type: 'armor', x: 3, z: 380 },
      { type: 'health', x: -2.5, z: 400 },
    ],
    encounterTriggers: [
      { z: 305, wave: [{ type: 'ranged', count: 2 }] },
      { z: 360, wave: [{ type: 'chaser', count: 3 }, { type: 'scout', count: 1 }] },
    ],
    specialEvent: {
      type: 'keyItem',
      triggerZ: 335,
      storeX: -8, storeZ: 340,
      label: 'GRAB THE KEY FROM THE CORNER STORE',
      wave: [{ type: 'chaser', count: 2 }, { type: 'ranged', count: 1 }],
    },
  },
  {
    id: 3,
    key: 'station',
    name: 'THE TRAIN STATION',
    zStart: 435,
    zEnd: 585,
    checkpointZ: 570,
    spawnZ: 441,
    directional: 'GET TO THE RIGHT PLATFORM',
    pickups: [
      { type: 'weapon_pump', x: 3, z: 470 },
      { type: 'ammo', x: -3, z: 500 },
      { type: 'health', x: 3, z: 530 },
      { type: 'armor', x: -3, z: 550 },
    ],
    encounterTriggers: [
      { z: 455, wave: [{ type: 'chaser', count: 3 }, { type: 'ranged', count: 1 }] },
      { z: 520, wave: [{ type: 'heavy', count: 2 }, { type: 'scout', count: 2 }] },
    ],
    specialEvent: {
      type: 'trainCrossing',
      triggerZ: 495,
      label: 'WATCH THE TRAIN — CROSS TO PLATFORM B',
      trackX: 0,
      safeX: 8,
      wave: [{ type: 'chaser', count: 2 }, { type: 'ranged', count: 2 }],
    },
  },
  {
    id: 4,
    key: 'safehouse',
    name: 'THE 5600 SAFE HOUSE',
    zStart: 585,
    zEnd: 660,
    checkpointZ: 650,
    spawnZ: 591,
    directional: 'MAKE IT TO THE SAFE HOUSE',
    pickups: [
      { type: 'health', x: -3, z: 610 },
      { type: 'armor', x: 3, z: 610 },
      { type: 'ammo', x: 0, z: 625 },
    ],
    encounterTriggers: [],
    specialEvent: {
      type: 'finalWave',
      triggerZ: 640,
      duration: 90,
      label: 'FINAL WAVE — SURVIVE 90 SECONDS',
      wave: [
        { type: 'chaser', count: 5 },
        { type: 'blocker', count: 3 },
        { type: 'ranged', count: 3 },
        { type: 'heavy', count: 2 },
        { type: 'scout', count: 2 },
        { type: 'captain', count: 1 },
      ],
      safehouseX: 0, safehouseZ: 655,
    },
  },
];

export const TOTAL_LENGTH = SECTIONS[SECTIONS.length - 1].zEnd;

export function sectionForZ(z) {
  for (const s of SECTIONS) if (z >= s.zStart && z < s.zEnd) return s;
  return SECTIONS[SECTIONS.length - 1];
}

export function sectionIndexForZ(z) {
  const s = sectionForZ(z);
  return s.id;
}
