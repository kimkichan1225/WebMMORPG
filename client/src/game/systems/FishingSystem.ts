// Fishing Life Skill System

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface Fish {
  id: string;
  name: string;
  nameKo: string;
  rarity: FishRarity;
  minSize: number; // cm
  maxSize: number;
  basePrice: number; // gold per cm
  description: string;
  requiredLevel: number; // fishing level required
}

export interface FishingSpot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  availableFish: string[]; // Fish IDs
  mapId: string;
}

export interface CaughtFish {
  fishId: string;
  size: number;
  timestamp: number;
}

// Fish database
export const FISH_DATA: Record<string, Fish> = {
  // Common fish
  carp: {
    id: 'carp',
    name: 'Carp',
    nameKo: '잉어',
    rarity: 'common',
    minSize: 20,
    maxSize: 50,
    basePrice: 5,
    description: '호수와 강에서 흔히 볼 수 있는 물고기',
    requiredLevel: 1,
  },
  crucian: {
    id: 'crucian',
    name: 'Crucian Carp',
    nameKo: '붕어',
    rarity: 'common',
    minSize: 15,
    maxSize: 35,
    basePrice: 4,
    description: '낚시 초보자도 쉽게 잡을 수 있는 물고기',
    requiredLevel: 1,
  },
  bass: {
    id: 'bass',
    name: 'Bass',
    nameKo: '배스',
    rarity: 'common',
    minSize: 25,
    maxSize: 60,
    basePrice: 6,
    description: '힘이 좋아 낚시의 재미를 느끼게 해주는 물고기',
    requiredLevel: 1,
  },

  // Uncommon fish
  trout: {
    id: 'trout',
    name: 'Trout',
    nameKo: '송어',
    rarity: 'uncommon',
    minSize: 30,
    maxSize: 70,
    basePrice: 10,
    description: '맑은 물에서만 서식하는 고급 물고기',
    requiredLevel: 3,
  },
  catfish: {
    id: 'catfish',
    name: 'Catfish',
    nameKo: '메기',
    rarity: 'uncommon',
    minSize: 40,
    maxSize: 100,
    basePrice: 12,
    description: '어두운 곳을 좋아하는 야행성 물고기',
    requiredLevel: 5,
  },
  eel: {
    id: 'eel',
    name: 'Eel',
    nameKo: '뱀장어',
    rarity: 'uncommon',
    minSize: 50,
    maxSize: 120,
    basePrice: 15,
    description: '긴 몸통과 미끈미끈한 피부를 가진 물고기',
    requiredLevel: 5,
  },

  // Rare fish
  golden_carp: {
    id: 'golden_carp',
    name: 'Golden Carp',
    nameKo: '금잉어',
    rarity: 'rare',
    minSize: 25,
    maxSize: 60,
    basePrice: 50,
    description: '황금빛 비늘을 가진 희귀한 잉어',
    requiredLevel: 10,
  },
  sturgeon: {
    id: 'sturgeon',
    name: 'Sturgeon',
    nameKo: '철갑상어',
    rarity: 'rare',
    minSize: 80,
    maxSize: 200,
    basePrice: 40,
    description: '고대부터 존재한 거대한 물고기',
    requiredLevel: 15,
  },
  ghost_fish: {
    id: 'ghost_fish',
    name: 'Ghost Fish',
    nameKo: '유령 물고기',
    rarity: 'rare',
    minSize: 15,
    maxSize: 40,
    basePrice: 80,
    description: '동굴 깊은 곳에서만 발견되는 투명한 물고기',
    requiredLevel: 15,
  },

  // Legendary fish
  dragon_koi: {
    id: 'dragon_koi',
    name: 'Dragon Koi',
    nameKo: '용 비단잉어',
    rarity: 'legendary',
    minSize: 60,
    maxSize: 150,
    basePrice: 200,
    description: '전설 속에서만 전해지던 신비로운 물고기',
    requiredLevel: 20,
  },
  ancient_fish: {
    id: 'ancient_fish',
    name: 'Ancient Fish',
    nameKo: '고대어',
    rarity: 'legendary',
    minSize: 100,
    maxSize: 300,
    basePrice: 300,
    description: '수억 년 전부터 존재한 살아있는 화석',
    requiredLevel: 25,
  },
  phantom_whale: {
    id: 'phantom_whale',
    name: 'Phantom Whale',
    nameKo: '환영의 고래',
    rarity: 'legendary',
    minSize: 200,
    maxSize: 500,
    basePrice: 500,
    description: '아주 드물게 모습을 드러내는 전설의 생물',
    requiredLevel: 30,
  },
};

// Map-specific fishing spots
export const FISHING_SPOTS: FishingSpot[] = [
  // Town - beginner spot (fountain at tile 30,30 = pixel 1920,1920)
  {
    id: 'town_pond',
    x: 1920,
    y: 1920,
    width: 320,
    height: 320,
    availableFish: ['carp', 'crucian', 'bass'],
    mapId: 'town',
  },
  // Forest - intermediate spot
  {
    id: 'forest_stream',
    x: 1200,
    y: 800,
    width: 200,
    height: 80,
    availableFish: ['carp', 'bass', 'trout', 'catfish'],
    mapId: 'forest',
  },
  {
    id: 'forest_deep_lake',
    x: 1000,
    y: 1200,
    width: 250,
    height: 150,
    availableFish: ['trout', 'catfish', 'eel', 'golden_carp'],
    mapId: 'forest_deep',
  },
  // Cave - underground fishing
  {
    id: 'cave_pool',
    x: 800,
    y: 1500,
    width: 180,
    height: 120,
    availableFish: ['catfish', 'eel', 'ghost_fish'],
    mapId: 'cave',
  },
  {
    id: 'cave_deep_river',
    x: 600,
    y: 1800,
    width: 300,
    height: 100,
    availableFish: ['eel', 'ghost_fish', 'sturgeon', 'ancient_fish'],
    mapId: 'cave_deep',
  },
  // Desert - oasis fishing
  {
    id: 'desert_oasis',
    x: 1400,
    y: 700,
    width: 200,
    height: 200,
    availableFish: ['carp', 'catfish', 'golden_carp', 'dragon_koi'],
    mapId: 'desert',
  },
  // Pyramid - legendary fishing spot
  {
    id: 'pyramid_sacred_pool',
    x: 1000,
    y: 1000,
    width: 150,
    height: 150,
    availableFish: ['golden_carp', 'sturgeon', 'dragon_koi', 'ancient_fish', 'phantom_whale'],
    mapId: 'pyramid',
  },
];

// Fishing state
export type FishingState = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught' | 'failed';

export interface FishingGameState {
  state: FishingState;
  currentSpot: FishingSpot | null;
  targetFish: Fish | null;
  castTimer: number;
  waitTimer: number;
  biteWindow: number;
  reelProgress: number;
  reelTarget: number;
  fishSize: number;
  perfectCatch: boolean;
}

// Fishing mechanics configuration
export const FISHING_CONFIG = {
  CAST_TIME: 1000, // ms to cast
  MIN_WAIT_TIME: 3000, // minimum wait for bite
  MAX_WAIT_TIME: 15000, // maximum wait for bite
  BITE_WINDOW: 1500, // time to react to bite
  REEL_TARGET: 100, // progress needed to catch
  REEL_DECAY: 2, // progress lost per tick when not clicking
  REEL_GAIN: 8, // progress gained per click
  PERFECT_CATCH_BONUS: 1.5, // size multiplier for perfect catch
};

// Calculate fishing rarity chances based on level
export const getFishingChances = (fishingLevel: number): Record<FishRarity, number> => {
  const baseChances = {
    common: 60,
    uncommon: 30,
    rare: 8,
    legendary: 2,
  };

  // Higher level = better chances for rare fish
  const levelBonus = Math.min(fishingLevel * 0.5, 20);

  return {
    common: Math.max(30, baseChances.common - levelBonus),
    uncommon: baseChances.uncommon + levelBonus * 0.3,
    rare: baseChances.rare + levelBonus * 0.5,
    legendary: Math.min(baseChances.legendary + levelBonus * 0.2, 15),
  };
};

// Select random fish from spot based on fishing level
export const selectRandomFish = (spot: FishingSpot, fishingLevel: number): Fish | null => {
  const chances = getFishingChances(fishingLevel);
  const roll = Math.random() * 100;

  let targetRarity: FishRarity;
  if (roll < chances.legendary) {
    targetRarity = 'legendary';
  } else if (roll < chances.legendary + chances.rare) {
    targetRarity = 'rare';
  } else if (roll < chances.legendary + chances.rare + chances.uncommon) {
    targetRarity = 'uncommon';
  } else {
    targetRarity = 'common';
  }

  // Filter available fish by rarity and level requirement
  const availableFish = spot.availableFish
    .map((id) => FISH_DATA[id])
    .filter((fish) => fish && fish.rarity === targetRarity && fish.requiredLevel <= fishingLevel);

  // If no fish of target rarity, try lower rarity
  if (availableFish.length === 0) {
    const allAvailable = spot.availableFish
      .map((id) => FISH_DATA[id])
      .filter((fish) => fish && fish.requiredLevel <= fishingLevel);

    if (allAvailable.length === 0) return null;
    return allAvailable[Math.floor(Math.random() * allAvailable.length)];
  }

  return availableFish[Math.floor(Math.random() * availableFish.length)];
};

// Calculate fish size
export const calculateFishSize = (fish: Fish, isPerfect: boolean): number => {
  const baseSize = fish.minSize + Math.random() * (fish.maxSize - fish.minSize);
  return Math.round(baseSize * (isPerfect ? FISHING_CONFIG.PERFECT_CATCH_BONUS : 1));
};

// Calculate sell price
export const calculateFishPrice = (fish: Fish, size: number): number => {
  const basePrice = fish.basePrice * size;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 3,
    legendary: 10,
  };
  return Math.round(basePrice * rarityMultiplier[fish.rarity]);
};

// Get fishing EXP reward
export const getFishingExp = (fish: Fish, size: number): number => {
  const baseExp = {
    common: 5,
    uncommon: 15,
    rare: 50,
    legendary: 200,
  };
  return Math.round(baseExp[fish.rarity] * (size / fish.minSize));
};

// Draw fishing spot on map
export const drawFishingSpot = (
  ctx: CanvasRenderingContext2D,
  spot: FishingSpot,
  cameraX: number,
  cameraY: number,
  animationFrame: number
): void => {
  const screenX = spot.x - cameraX;
  const screenY = spot.y - cameraY;

  // Skip if off screen
  if (
    screenX < -spot.width ||
    screenX > ctx.canvas.width + spot.width ||
    screenY < -spot.height ||
    screenY > ctx.canvas.height + spot.height
  ) {
    return;
  }

  // Draw water with wave animation
  const gradient = ctx.createLinearGradient(screenX, screenY, screenX, screenY + spot.height);
  gradient.addColorStop(0, 'rgba(30, 144, 255, 0.6)');
  gradient.addColorStop(1, 'rgba(0, 100, 200, 0.8)');

  ctx.fillStyle = gradient;
  ctx.beginPath();

  // Wavy top edge
  ctx.moveTo(screenX, screenY);
  const waveOffset = Math.sin(animationFrame * 0.05) * 3;
  for (let x = 0; x <= spot.width; x += 10) {
    const waveY = Math.sin((x + animationFrame * 2) * 0.1) * 3 + waveOffset;
    ctx.lineTo(screenX + x, screenY + waveY);
  }
  ctx.lineTo(screenX + spot.width, screenY + spot.height);
  ctx.lineTo(screenX, screenY + spot.height);
  ctx.closePath();
  ctx.fill();

  // Draw sparkles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < 3; i++) {
    const sparkleX = screenX + (Math.sin(animationFrame * 0.03 + i * 2) + 1) * spot.width * 0.5;
    const sparkleY = screenY + (Math.cos(animationFrame * 0.02 + i * 3) + 1) * spot.height * 0.3 + 10;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw fishing icon indicator
  const iconX = screenX + spot.width / 2;
  const iconY = screenY - 15;
  const bobOffset = Math.sin(animationFrame * 0.08) * 3;

  // Fish icon
  ctx.save();
  ctx.translate(iconX, iconY + bobOffset);
  ctx.fillStyle = '#4FC3F7';
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-18, -6);
  ctx.lineTo(-18, 6);
  ctx.closePath();
  ctx.fill();
  // Eye
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(6, -1, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

// Draw fishing rod
export const drawFishingRod = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: FishingState,
  reelProgress: number
): void => {
  ctx.save();

  // Rod
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 4;

  const rodAngle = state === 'reeling' ? -0.6 - (reelProgress / 100) * 0.3 : -0.5;
  const rodLength = 60;

  ctx.translate(x, y);
  ctx.rotate(rodAngle);

  // Rod body
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rodLength, 0);
  ctx.stroke();

  // Rod tip
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rodLength - 15, 0);
  ctx.lineTo(rodLength + 10, 0);
  ctx.stroke();

  // Fishing line
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1;

  const lineEndX = rodLength + 10 + Math.sin(state === 'reeling' ? reelProgress * 0.1 : 0) * 5;
  const lineEndY = state === 'casting' ? 20 : state === 'reeling' ? 40 - reelProgress * 0.3 : 50;

  ctx.beginPath();
  ctx.moveTo(rodLength + 10, 0);
  ctx.quadraticCurveTo(rodLength + 20, lineEndY / 2, lineEndX, lineEndY);
  ctx.stroke();

  // Bobber
  if (state !== 'idle' && state !== 'caught' && state !== 'failed') {
    ctx.fillStyle = state === 'bite' ? '#FF0000' : '#FF4500';
    const bobberBounce = state === 'bite' ? Math.sin(Date.now() * 0.05) * 5 : 0;
    ctx.beginPath();
    ctx.arc(lineEndX, lineEndY + bobberBounce, 5, 0, Math.PI * 2);
    ctx.fill();

    // White stripe on bobber
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(lineEndX, lineEndY + bobberBounce - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};
