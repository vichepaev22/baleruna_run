export interface ObstacleData {
  type: 'toilet' | 'tallToilet' | 'openToilet' | 'plunger' | 'pit' | 'puddle' | 'pipe' | 'spinner' | 'cart';
  x: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface CollectibleData {
  x: number;
  y: number;
  type?: 'roll' | 'magnet' | 'shield' | 'slowmo' | 'double' | 'energy';
}

export interface EnemyData {
  type: 'tuntun' | 'crocobird';
  x: number;
  y?: number;
}

export interface LevelData {
  id: number;
  name: string;
  duration: number;
  speed: number;
  bgColor1: string;
  bgColor2: string;
  groundColor: string;
  obstacles: ObstacleData[];
  collectibles: CollectibleData[];
  enemies: EnemyData[];
  hasTuntun: boolean;
  hasCrocobird: boolean;
  tutorial?: boolean;
}

// Helper to create roll lines
function rollLine(startX: number, y: number, count: number, spacing = 35): CollectibleData[] {
  const rolls: CollectibleData[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push({ x: startX + i * spacing, y, type: 'roll' });
  }
  return rolls;
}

// Helper for arc of rolls (jump trajectory)
function rollArc(startX: number, baseY: number, count: number): CollectibleData[] {
  const rolls: CollectibleData[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const arcY = baseY - Math.sin(t * Math.PI) * 80;
    rolls.push({ x: startX + i * 32, y: arcY, type: 'roll' });
  }
  return rolls;
}

export const levels: LevelData[] = [
  // Level 1: Coffee Square - Tutorial
  {
    id: 1, name: 'Кофейная площадь', duration: 40, speed: 240,
    bgColor1: '#FFE4B5', bgColor2: '#FFA07A', groundColor: '#8B7355',
    tutorial: true, hasTuntun: false, hasCrocobird: false,
    obstacles: [
      { type: 'toilet', x: 350, y: 495 },
      { type: 'plunger', x: 600, y: 500 },
      { type: 'toilet', x: 850, y: 495 },
      { type: 'pipe', x: 1100, y: 440 },
      { type: 'toilet', x: 1400, y: 495 },
      { type: 'plunger', x: 1650, y: 500 },
      { type: 'toilet', x: 1900, y: 495 },
      { type: 'toilet', x: 2200, y: 495 },
      { type: 'plunger', x: 2500, y: 500 },
      { type: 'toilet', x: 2800, y: 495 },
      { type: 'pipe', x: 3100, y: 440 },
      { type: 'toilet', x: 3400, y: 495 },
      { type: 'toilet', x: 3700, y: 495 },
      { type: 'plunger', x: 4000, y: 500 },
      { type: 'toilet', x: 4300, y: 495 },
      { type: 'toilet', x: 4600, y: 495 },
      { type: 'toilet', x: 4900, y: 495 },
      { type: 'toilet', x: 5200, y: 495 },
      { type: 'plunger', x: 5500, y: 500 },
      { type: 'toilet', x: 5800, y: 495 },
      { type: 'toilet', x: 6100, y: 495 },
      { type: 'toilet', x: 6400, y: 495 },
      { type: 'toilet', x: 6700, y: 495 },
      { type: 'toilet', x: 7000, y: 495 },
      { type: 'toilet', x: 7300, y: 495 },
      { type: 'toilet', x: 7600, y: 495 },
      { type: 'toilet', x: 7900, y: 495 },
    ],
    collectibles: [
      ...rollLine(200, 460, 5),
      ...rollLine(450, 440, 3),
      ...rollLine(700, 460, 4),
      ...rollLine(950, 460, 3),
      ...rollArc(1200, 460, 5),
      ...rollLine(1500, 460, 4),
      ...rollLine(1750, 440, 3),
      ...rollLine(2000, 460, 5),
      ...rollLine(2300, 460, 3),
      ...rollLine(2600, 460, 4),
      ...rollLine(2900, 460, 3),
      ...rollLine(3200, 460, 5),
      ...rollLine(3500, 440, 3),
      ...rollLine(3800, 460, 4),
      ...rollLine(4100, 460, 3),
      ...rollLine(4400, 460, 5),
      ...rollLine(4700, 440, 3),
      ...rollLine(5000, 460, 4),
      ...rollLine(5300, 460, 3),
      ...rollLine(5600, 460, 5),
      ...rollLine(5900, 460, 3),
      ...rollLine(6200, 460, 4),
      ...rollLine(6500, 460, 3),
      ...rollLine(6800, 460, 5),
      ...rollLine(7100, 460, 3),
      ...rollLine(7400, 460, 4),
      ...rollLine(7700, 460, 3),
      { x: 1100, y: 380, type: 'energy' },
      { x: 3100, y: 380, type: 'shield' },
    ],
    enemies: []
  },

  // Level 2: Toilet Factory
  {
    id: 2, name: 'Туалетная фабрика', duration: 48, speed: 255,
    bgColor1: '#B0C4DE', bgColor2: '#708090', groundColor: '#4A4A4A',
    hasTuntun: false, hasCrocobird: false,
    obstacles: generateFactoryObstacles(2),
    collectibles: generateFactoryCollectibles(2),
    enemies: []
  },

  // Level 3: Soap Tunnels
  {
    id: 3, name: 'Мыльные тоннели', duration: 52, speed: 265,
    bgColor1: '#87CEEB', bgColor2: '#40E0D0', groundColor: '#2F4F4F',
    hasTuntun: false, hasCrocobird: false,
    obstacles: generateTunnelObstacles(3),
    collectibles: generateTunnelCollectibles(3),
    enemies: []
  },

  // Level 4: City Rooftops
  {
    id: 4, name: 'Крыши города', duration: 58, speed: 275,
    bgColor1: '#FFB6C1', bgColor2: '#DDA0DD', groundColor: '#696969',
    hasTuntun: false, hasCrocobird: false,
    obstacles: generateRooftopObstacles(4),
    collectibles: generateRooftopCollectibles(4),
    enemies: []
  },

  // Level 5: Sahur Chase
  {
    id: 5, name: 'Погоня Сахура', duration: 62, speed: 285,
    bgColor1: '#483D8B', bgColor2: '#2F2F4F', groundColor: '#3D3D3D',
    hasTuntun: true, hasCrocobird: false,
    obstacles: generateChaseObstacles(5),
    collectibles: generateChaseCollectibles(5),
    enemies: [{ type: 'tuntun', x: 2000 }]
  },

  // Level 6: Night Supermarket
  {
    id: 6, name: 'Ночной супермаркет', duration: 65, speed: 295,
    bgColor1: '#191970', bgColor2: '#4B0082', groundColor: '#2D2D2D',
    hasTuntun: false, hasCrocobird: false,
    obstacles: generateMarketObstacles(6),
    collectibles: generateMarketCollectibles(6),
    enemies: []
  },

  // Level 7: Paper Beach
  {
    id: 7, name: 'Бумажный пляж', duration: 68, speed: 305,
    bgColor1: '#87CEEB', bgColor2: '#F0E68C', groundColor: '#DEB887',
    hasTuntun: false, hasCrocobird: false,
    obstacles: generateBeachObstacles(7),
    collectibles: generateBeachCollectibles(7),
    enemies: []
  },

  // Level 8: Crocobird Airfield
  {
    id: 8, name: 'Аэродром Крокодило', duration: 72, speed: 320,
    bgColor1: '#E0FFFF', bgColor2: '#B0E0E0', groundColor: '#708090',
    hasTuntun: false, hasCrocobird: true,
    obstacles: generateAirfieldObstacles(8),
    collectibles: generateAirfieldCollectibles(8),
    enemies: [{ type: 'crocobird', x: 2500 }, { type: 'crocobird', x: 5000 }]
  },

  // Level 9: Great Roll Factory
  {
    id: 9, name: 'Великая фабрика', duration: 78, speed: 340,
    bgColor1: '#FF6347', bgColor2: '#FF4500', groundColor: '#4A4A4A',
    hasTuntun: true, hasCrocobird: false,
    obstacles: generateFactoryObstacles(9),
    collectibles: generateFactoryCollectibles(9),
    enemies: [{ type: 'tuntun', x: 3000 }]
  },

  // Level 10: The Great Escape
  {
    id: 10, name: 'Большой побег', duration: 90, speed: 360,
    bgColor1: '#8B0000', bgColor2: '#FFD700', groundColor: '#2D2D2D',
    hasTuntun: true, hasCrocobird: true,
    obstacles: generateFinalObstacles(),
    collectibles: generateFinalCollectibles(),
    enemies: [{ type: 'tuntun', x: 2000 }, { type: 'crocobird', x: 4000 }, { type: 'crocobird', x: 7000 }]
  },
];

// Level generators
function generateFactoryObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 800;
  let x = 350;
  const gap = Math.max(170, 300 - level * 10);
  const types: ObstacleData['type'][] = ['toilet', 'tallToilet', 'pipe', 'plunger', 'spinner'];
  
  while (x < total - 200) {
    const type = types[Math.floor(Math.random() * Math.min(types.length, 2 + level))];
    obs.push({ type, x, y: type === 'pipe' ? 440 : type === 'tallToilet' ? 475 : 495 });
    x += gap + Math.random() * 50;
  }
  return obs;
}

function generateFactoryCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 800;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3 + Math.floor(Math.random() * 2)));
    x += 150 + Math.random() * 100;
  }
  // Power-ups
  for (let i = 0; i < level; i++) {
    const types: CollectibleData['type'][] = ['magnet', 'shield', 'energy', 'double'];
    cols.push({ x: 500 + i * 800, y: 380, type: types[Math.floor(Math.random() * types.length)] });
  }
  return cols;
}

function generateTunnelObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 1000;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.3) obs.push({ type: 'pipe', x, y: 440 });
    else if (r < 0.5) obs.push({ type: 'puddle', x, y: 510 });
    else if (r < 0.7) obs.push({ type: 'pit', x, y: 520, width: 70 });
    else obs.push({ type: 'toilet', x, y: 495 });
    x += 180 + Math.random() * 60;
  }
  return obs;
}

function generateTunnelCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 1000;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    if (Math.random() > 0.5) cols.push(...rollArc(x + 50, 460, 4));
    x += 180 + Math.random() * 80;
  }
  cols.push({ x: 800, y: 380, type: 'shield' });
  cols.push({ x: 2000, y: 380, type: 'slowmo' });
  return cols;
}

function generateRooftopObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 1200;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.35) obs.push({ type: 'pit', x, y: 520, width: 75 + level * 3 });
    else if (r < 0.6) obs.push({ type: 'tallToilet', x, y: 475 });
    else obs.push({ type: 'toilet', x, y: 495 });
    x += 190 + Math.random() * 50;
  }
  return obs;
}

function generateRooftopCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 1200;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollArc(x, 460, 4));
    x += 200 + Math.random() * 80;
  }
  cols.push({ x: 1000, y: 380, type: 'energy' });
  cols.push({ x: 2500, y: 380, type: 'shield' });
  return cols;
}

function generateChaseObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 1400;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.3) obs.push({ type: 'toilet', x, y: 495 });
    else if (r < 0.5) obs.push({ type: 'tallToilet', x, y: 475 });
    else if (r < 0.7) obs.push({ type: 'pit', x, y: 520, width: 70 });
    else obs.push({ type: 'plunger', x, y: 500 });
    x += 170 + Math.random() * 50;
  }
  return obs;
}

function generateChaseCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 1400;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    x += 160 + Math.random() * 80;
  }
  cols.push({ x: 1200, y: 380, type: 'energy' });
  cols.push({ x: 3000, y: 380, type: 'shield' });
  cols.push({ x: 4500, y: 380, type: 'energy' });
  return cols;
}

function generateMarketObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 1600;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.25) obs.push({ type: 'cart', x, y: 495 });
    else if (r < 0.5) obs.push({ type: 'pipe', x, y: 440 });
    else if (r < 0.75) obs.push({ type: 'toilet', x, y: 495 });
    else obs.push({ type: 'tallToilet', x, y: 475 });
    x += 175 + Math.random() * 45;
  }
  return obs;
}

function generateMarketCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 1600;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    if (Math.random() > 0.6) cols.push(...rollLine(x + 20, 400, 2));
    x += 170 + Math.random() * 70;
  }
  cols.push({ x: 1500, y: 380, type: 'magnet' });
  cols.push({ x: 3500, y: 380, type: 'double' });
  cols.push({ x: 5000, y: 380, type: 'energy' });
  return cols;
}

function generateBeachObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 1800;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.3) obs.push({ type: 'pit', x, y: 520, width: 80 });
    else if (r < 0.5) obs.push({ type: 'puddle', x, y: 510 });
    else if (r < 0.7) obs.push({ type: 'spinner', x, y: 450 });
    else obs.push({ type: 'toilet', x, y: 495 });
    x += 180 + Math.random() * 50;
  }
  return obs;
}

function generateBeachCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 1800;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    x += 180 + Math.random() * 80;
  }
  cols.push({ x: 1500, y: 380, type: 'shield' });
  cols.push({ x: 3000, y: 380, type: 'slowmo' });
  cols.push({ x: 5000, y: 380, type: 'energy' });
  return cols;
}

function generateAirfieldObstacles(level: number): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 240 * level + 2000;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.3) obs.push({ type: 'tallToilet', x, y: 475 });
    else if (r < 0.5) obs.push({ type: 'spinner', x, y: 450 });
    else if (r < 0.7) obs.push({ type: 'pit', x, y: 520, width: 75 });
    else obs.push({ type: 'toilet', x, y: 495 });
    x += 170 + Math.random() * 45;
  }
  return obs;
}

function generateAirfieldCollectibles(level: number): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 240 * level + 2000;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    x += 170 + Math.random() * 70;
  }
  cols.push({ x: 1200, y: 380, type: 'shield' });
  cols.push({ x: 3000, y: 380, type: 'energy' });
  cols.push({ x: 5000, y: 380, type: 'shield' });
  cols.push({ x: 7000, y: 380, type: 'energy' });
  return cols;
}

function generateFinalObstacles(): ObstacleData[] {
  const obs: ObstacleData[] = [];
  const total = 12000;
  let x = 350;
  while (x < total - 200) {
    const r = Math.random();
    if (r < 0.2) obs.push({ type: 'tallToilet', x, y: 475 });
    else if (r < 0.35) obs.push({ type: 'pit', x, y: 520, width: 80 });
    else if (r < 0.5) obs.push({ type: 'spinner', x, y: 450 });
    else if (r < 0.65) obs.push({ type: 'pipe', x, y: 440 });
    else if (r < 0.8) obs.push({ type: 'toilet', x, y: 495 });
    else obs.push({ type: 'plunger', x, y: 500 });
    x += 160 + Math.random() * 40;
  }
  return obs;
}

function generateFinalCollectibles(): CollectibleData[] {
  const cols: CollectibleData[] = [];
  const total = 12000;
  let x = 200;
  while (x < total - 200) {
    cols.push(...rollLine(x, 460, 3));
    if (Math.random() > 0.5) cols.push(...rollArc(x + 30, 460, 4));
    x += 160 + Math.random() * 60;
  }
  // Many power-ups for the final level
  cols.push({ x: 1000, y: 380, type: 'shield' });
  cols.push({ x: 2500, y: 380, type: 'energy' });
  cols.push({ x: 4000, y: 380, type: 'shield' });
  cols.push({ x: 5500, y: 380, type: 'energy' });
  cols.push({ x: 7000, y: 380, type: 'magnet' });
  cols.push({ x: 8500, y: 380, type: 'shield' });
  cols.push({ x: 10000, y: 380, type: 'energy' });
  return cols;
}
