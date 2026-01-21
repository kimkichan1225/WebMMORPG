# 🎮 해골 MMORPG 프로토타입 v2

## 목표
매칭 게임 모드의 핵심 루프를 빠르게 테스트.
DB/서버 없이 로컬 싱글플레이로 1~2일 안에 완성.

**테스트할 핵심 기능:**
- 캐릭터 렌더링 + 이동
- 파밍 (도구로 자원 채집)
- 레벨업 + 스탯 분배 + 전직
- 간단한 전투
- 사망 페널티 (레벨/스탯 다운, 전직 초기화)

---

## 기술 스택 (최소화)
- React + TypeScript + Vite
- Canvas API
- Zustand (상태관리)
- 서버/DB 없음

---

## 📁 폴더 구조
```
prototype/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Game.tsx              # 메인 게임
│   │   ├── HUD.tsx               # HP/MP/레벨 표시
│   │   ├── StatWindow.tsx        # 스탯 창
│   │   ├── Inventory.tsx         # 인벤토리
│   │   ├── ToolSelect.tsx        # 도구 선택
│   │   └── JobChangeUI.tsx       # 전직 UI
│   ├── game/
│   │   ├── GameCanvas.tsx        # Canvas 렌더링
│   │   ├── Player.ts             # 플레이어
│   │   ├── Camera.ts             # 카메라
│   │   ├── Map.ts                # 맵
│   │   ├── Monster.ts            # 몬스터
│   │   └── Resource.ts           # 채집 자원
│   ├── stores/
│   │   ├── playerStore.ts        # 플레이어 상태
│   │   └── inventoryStore.ts     # 인벤토리
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   ├── jobs.ts               # 직업 데이터
│   │   └── items.ts              # 아이템 데이터
│   └── assets/
│       ├── head/
│       ├── body/
│       ├── foot/
│       └── weapon/
└── package.json
```

---

## 🎨 에셋

### 캐릭터 파츠 (이미지)
- Head: 1000x830px
- Body: 1000x400px
- Foot: 왼발/오른발 (공통)

### 무기 (Canvas 도형으로 구현)
프로토타입에서는 이미지 대신 **Canvas 도형**으로 무기 표현.
나중에 이미지 에셋으로 교체 예정.

| 무기 | 용도 | 도형 구성 |
|------|------|----------|
| bone | 기본 무기 | 흰색 뼈 모양 |
| sword | 전사 | 은색 삼각형 + 갈색 손잡이 |
| bow | 궁수 | 갈색 곡선 + 직선 (시위) |
| staff | 마법사 | 보라색 막대 + 원형 구슬 |
| dagger | 도적 | 작은 은색 삼각형 |
| axe | 벌목 | 갈색 막대 + 회색 타원 |
| pickaxe | 채광 | 갈색 막대 + 회색 양쪽 뾰족이 |
| sickle | 채집 | 갈색 막대 + 회색 곡선 |

### 렌더링 순서
1. Foot (왼발, 오른발)
2. Body
3. Weapon (Canvas 도형)
4. Head

---

## 📐 설정값

```typescript
const CONFIG = {
  // 캔버스
  CANVAS_WIDTH: 1024,
  CANVAS_HEIGHT: 768,
  
  // 캐릭터
  PLAYER_SCALE: 0.08,
  PLAYER_SPEED: 200,
  
  // 타일
  TILE_SIZE: 64,
  MAP_WIDTH: 40,
  MAP_HEIGHT: 40,
  
  // 애니메이션
  WALK_FRAME_DURATION: 200,
  
  // 전투
  BASE_HP: 100,
  BASE_MP: 50,
  BASE_ATTACK: 10,
  
  // 레벨업
  STAT_POINTS_PER_LEVEL: 5,
  EXP_PER_LEVEL: 100,
  
  // 사망 페널티
  DEATH_LEVEL_PENALTY: 1,
  DEATH_STAT_PENALTY: 1,
  DEATH_RESOURCE_DROP_RATE: {
    common: 0.3,   // 30%
    uncommon: 0.2, // 20%
    rare: 0.1,     // 10%
  },
};
```

---

## 🎮 프로토타입 기능 체크리스트

### Step 1: 캐릭터 렌더링 ✅
- [ ] Head + Body + Foot + Weapon 합쳐서 그리기
- [ ] 스케일 0.08배
- [ ] 중심점 맞추기

### Step 2: 이동 ✅
- [ ] WASD / 방향키
- [ ] 8방향 이동
- [ ] 걷기 애니메이션 (발 번갈아)

### Step 3: 카메라 + 맵 ✅
- [ ] 플레이어 추적 카메라
- [ ] 타일맵 (잔디/흙/물/벽)
- [ ] 충돌 처리

### Step 4: 도구 & 파밍 🆕
- [ ] 게임 시작 시 도구 선택 UI (도끼/곡괭이/낫)
- [ ] 맵에 자원 배치 (나무/광석/약초)
- [ ] 자원 근처에서 E키 → 채집
- [ ] 인벤토리에 자원 추가
- [ ] 도구에 맞는 자원만 채집 가능

### Step 5: 스탯 시스템 🆕
- [ ] STR/DEX/INT/VIT/LUK 표시
- [ ] 레벨업 시 5포인트 지급
- [ ] 스탯 창 UI (Tab 키)
- [ ] 포인트 분배 버튼

### Step 6: 전투 🆕
- [ ] 몬스터 스폰 (슬라임)
- [ ] 스페이스바 → 공격
- [ ] 몬스터 AI (플레이어 추적)
- [ ] 데미지 계산 (STR/DEX/INT 기반)
- [ ] 몬스터 처치 → 경험치

### Step 7: 사망 & 페널티 🆕
- [ ] HP 0 → 사망
- [ ] 사망 시 레벨 -1
- [ ] 사망 시 스탯 일부 감소
- [ ] 사망 시 자원 확률 드롭
- [ ] 리스폰 (스폰 지점)

### Step 8: 전직 🆕
- [ ] 전직 UI (J 키)
- [ ] 조건 표시 (레벨, 스탯)
- [ ] 조건 충족 시 전직 버튼 활성화
- [ ] 전직 시 Head/Weapon 변경
- [ ] 조건 미달 시 자동 Base 초기화

---

## 📊 직업 데이터

```typescript
const JOBS = {
  Base: {
    tier: 0,
    requirements: null,
    weapon: 'Bone',
    bonusStats: {},
  },
  Warrior: {
    tier: 1,
    requirements: { level: 10, str: 20 },
    weapon: 'Knife',
    bonusStats: { str: 5, vit: 3 },
  },
  Archer: {
    tier: 1,
    requirements: { level: 10, dex: 20 },
    weapon: 'Bow',
    bonusStats: { dex: 5, luk: 3 },
  },
  Mage: {
    tier: 1,
    requirements: { level: 10, int: 20 },
    weapon: 'Bong',
    bonusStats: { int: 5, vit: 3 },
  },
  Thief: {
    tier: 1,
    requirements: { level: 10, dex: 15, luk: 15 },
    weapon: 'Knife',
    bonusStats: { dex: 3, luk: 5 },
  },
};
```

---

## 📦 자원 데이터

```typescript
const RESOURCES = {
  // 도끼 (나무)
  wood: { name: '목재', tool: 'axe', tier: 'common', exp: 5 },
  hardwood: { name: '단단한 목재', tool: 'axe', tier: 'uncommon', exp: 10 },
  
  // 곡괭이 (광석)
  stone: { name: '돌', tool: 'pickaxe', tier: 'common', exp: 5 },
  iron: { name: '철', tool: 'pickaxe', tier: 'uncommon', exp: 10 },
  gold: { name: '금', tool: 'pickaxe', tier: 'rare', exp: 20 },
  
  // 낫 (약초)
  herb: { name: '약초', tool: 'sickle', tier: 'common', exp: 5 },
  manaflower: { name: '마나풀', tool: 'sickle', tier: 'uncommon', exp: 10 },
  rareherd: { name: '희귀약초', tool: 'sickle', tier: 'rare', exp: 20 },
};
```

---

## 🗺️ 프로토타입 맵

```
┌──────────────────────────────────────┐
│                                      │
│  🌲🌲🌲              🪨🪨🪨         │
│  나무 존             광석 존         │
│                                      │
│           🏠 스폰 지점               │
│              (플레이어)              │
│                                      │
│     🐗        중앙        🐗        │
│   슬라임               슬라임        │
│                                      │
│  🌿🌿🌿                             │
│  약초 존                             │
│                                      │
│  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │
│            물 (이동불가)             │
└──────────────────────────────────────┘
```

---

## 🗡️ 무기 시스템 (Canvas 도형)

### weapons.ts
```typescript
export const drawWeapon = (
  ctx: CanvasRenderingContext2D, 
  weapon: string, 
  x: number, 
  y: number, 
  angle: number = 0,  // 공격 시 회전
  scale: number = 1
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';

  switch (weapon) {
    case 'bone':
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(-4, -25, 8, 50);
      ctx.strokeRect(-4, -25, 8, 50);
      // 뼈 끝 (위)
      ctx.beginPath();
      ctx.arc(-6, -25, 6, 0, Math.PI * 2);
      ctx.arc(6, -25, 6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // 뼈 끝 (아래)
      ctx.beginPath();
      ctx.arc(-6, 25, 6, 0, Math.PI * 2);
      ctx.arc(6, 25, 6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      break;

    case 'sword':
      // 손잡이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-4, 15, 8, 20);
      ctx.strokeRect(-4, 15, 8, 20);
      // 가드
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-12, 10, 24, 6);
      ctx.strokeRect(-12, 10, 24, 6);
      // 검날
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-6, 10);
      ctx.lineTo(6, 10);
      ctx.lineTo(0, -35);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;

    case 'bow':
      ctx.fillStyle = '#8B4513';
      ctx.lineWidth = 4;
      // 활 몸체
      ctx.beginPath();
      ctx.arc(10, 0, 30, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      // 시위
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, -28);
      ctx.lineTo(10, 28);
      ctx.stroke();
      break;

    case 'staff':
      // 막대
      ctx.fillStyle = '#4B0082';
      ctx.fillRect(-4, -35, 8, 60);
      ctx.strokeRect(-4, -35, 8, 60);
      // 구슬
      ctx.fillStyle = '#9370DB';
      ctx.beginPath();
      ctx.arc(0, -42, 10, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      // 빛 효과
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(-3, -45, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'dagger':
      // 손잡이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, 8, 6, 15);
      ctx.strokeRect(-3, 8, 6, 15);
      // 가드
      ctx.fillStyle = '#A0A0A0';
      ctx.fillRect(-8, 5, 16, 4);
      ctx.strokeRect(-8, 5, 16, 4);
      // 검날
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.lineTo(5, 5);
      ctx.lineTo(0, -20);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;

    case 'axe':
      // 손잡이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -20, 6, 50);
      ctx.strokeRect(-3, -20, 6, 50);
      // 도끼날
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.ellipse(-12, -15, 12, 18, 0, -Math.PI * 0.3, Math.PI * 0.3);
      ctx.lineTo(-3, -15);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;

    case 'pickaxe':
      // 손잡이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -10, 6, 45);
      ctx.strokeRect(-3, -10, 6, 45);
      // 곡괭이 머리
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(-25, -8);
      ctx.lineTo(-5, -15);
      ctx.lineTo(-5, -5);
      ctx.lineTo(-20, -5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(25, -8);
      ctx.lineTo(5, -15);
      ctx.lineTo(5, -5);
      ctx.lineTo(20, -5);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      break;

    case 'sickle':
      // 손잡이
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, 5, 6, 25);
      ctx.strokeRect(-3, 5, 6, 25);
      // 낫 날
      ctx.fillStyle = '#A0A0A0';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(5, -10, 20, Math.PI * 0.8, Math.PI * 1.5);
      ctx.stroke();
      break;
  }

  ctx.restore();
};
```

### effects.ts - 공격 이펙트
```typescript
// 베기 이펙트
export const drawSlashEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  progress: number  // 0~1
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  const alpha = 1 - progress;
  const radius = 40 + progress * 30;
  
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 4 * (1 - progress * 0.5);
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.arc(0, 0, radius, -0.5, 0.5);
  ctx.stroke();
  
  ctx.restore();
};

// 파밍 이펙트 (파티클)
export const drawHarvestEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  particles: { x: number, y: number, vy: number, life: number }[],
  color: string
) => {
  ctx.fillStyle = color;
  
  particles.forEach(p => {
    const alpha = p.life;
    ctx.globalAlpha = alpha;
    ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
  });
  
  ctx.globalAlpha = 1;
};

// 피격 이펙트 (번쩍임)
export const drawHitEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  const alpha = 1 - progress;
  const radius = 20 + progress * 30;
  
  ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};
```

---

## 🎹 조작키

| 키 | 기능 |
|----|------|
| WASD / 방향키 | 이동 |
| Space | 공격 |
| E | 채집 (자원 근처) |
| Tab | 스탯 창 |
| I | 인벤토리 |
| J | 전직 창 |

---

## ⚡ 핵심 Store 코드

### playerStore.ts
```typescript
import { create } from 'zustand';

interface PlayerState {
  // 위치
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  
  // 스탯
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  dex: number;
  int: number;
  vit: number;
  luk: number;
  statPoints: number;
  
  // 직업 & 장비
  job: string;
  jobTier: number;
  weapon: string;
  tool: 'axe' | 'pickaxe' | 'sickle' | null;
  
  // Actions
  move: (dx: number, dy: number) => void;
  setDirection: (dir: 'up' | 'down' | 'left' | 'right') => void;
  setMoving: (moving: boolean) => void;
  setTool: (tool: 'axe' | 'pickaxe' | 'sickle') => void;
  gainExp: (amount: number) => void;
  allocateStat: (stat: 'str' | 'dex' | 'int' | 'vit' | 'luk') => void;
  takeDamage: (amount: number) => void;
  die: () => void;
  tryChangeJob: (job: string) => boolean;
  checkJobMaintenance: () => void;
}

const JOB_REQUIREMENTS: Record<string, any> = {
  Warrior: { level: 10, str: 20 },
  Archer: { level: 10, dex: 20 },
  Mage: { level: 10, int: 20 },
  Thief: { level: 10, dex: 15, luk: 15 },
};

const JOB_WEAPONS: Record<string, string> = {
  Base: 'Bone',
  Warrior: 'Knife',
  Archer: 'Bow',
  Mage: 'Bong',
  Thief: 'Knife',
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // 초기값
  x: 640,
  y: 512,
  direction: 'down',
  isMoving: false,
  
  level: 1,
  exp: 0,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  str: 5,
  dex: 5,
  int: 5,
  vit: 5,
  luk: 5,
  statPoints: 0,
  
  job: 'Base',
  jobTier: 0,
  weapon: 'Bone',
  tool: null,
  
  // 이동
  move: (dx, dy) => set((s) => ({ x: s.x + dx, y: s.y + dy })),
  setDirection: (dir) => set({ direction: dir }),
  setMoving: (moving) => set({ isMoving: moving }),
  
  // 도구 선택
  setTool: (tool) => set({ tool }),
  
  // 경험치 & 레벨업
  gainExp: (amount) => {
    const s = get();
    let newExp = s.exp + amount;
    let newLevel = s.level;
    let newStatPoints = s.statPoints;
    
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
      newStatPoints += 5;
    }
    
    set({
      exp: newExp,
      level: newLevel,
      statPoints: newStatPoints,
    });
  },
  
  // 스탯 분배
  allocateStat: (stat) => set((s) => {
    if (s.statPoints <= 0) return s;
    
    const newStats = { ...s, [stat]: s[stat] + 1, statPoints: s.statPoints - 1 };
    
    // VIT는 HP에 영향
    if (stat === 'vit') {
      newStats.maxHp = 100 + newStats.vit * 10;
      newStats.hp = Math.min(newStats.hp, newStats.maxHp);
    }
    // INT는 MP에 영향
    if (stat === 'int') {
      newStats.maxMp = 50 + newStats.int * 5;
      newStats.mp = Math.min(newStats.mp, newStats.maxMp);
    }
    
    return newStats;
  }),
  
  // 피격
  takeDamage: (amount) => {
    const s = get();
    const newHp = s.hp - amount;
    
    if (newHp <= 0) {
      get().die();
    } else {
      set({ hp: newHp });
    }
  },
  
  // 사망
  die: () => set((s) => {
    // 레벨 & 스탯 감소
    const newLevel = Math.max(1, s.level - 1);
    const newStr = Math.max(5, s.str - 1);
    const newDex = Math.max(5, s.dex - 1);
    const newInt = Math.max(5, s.int - 1);
    const newVit = Math.max(5, s.vit - 1);
    const newLuk = Math.max(5, s.luk - 1);
    
    // 전직 조건 체크 → 미달 시 Base로
    let newJob = s.job;
    let newWeapon = s.weapon;
    let newJobTier = s.jobTier;
    
    const req = JOB_REQUIREMENTS[s.job];
    if (req) {
      const meetsReq = 
        newLevel >= req.level &&
        (!req.str || newStr >= req.str) &&
        (!req.dex || newDex >= req.dex) &&
        (!req.int || newInt >= req.int) &&
        (!req.luk || newLuk >= req.luk);
      
      if (!meetsReq) {
        newJob = 'Base';
        newWeapon = 'Bone';
        newJobTier = 0;
      }
    }
    
    return {
      level: newLevel,
      str: newStr,
      dex: newDex,
      int: newInt,
      vit: newVit,
      luk: newLuk,
      hp: 100 + newVit * 10,
      maxHp: 100 + newVit * 10,
      mp: 50 + newInt * 5,
      maxMp: 50 + newInt * 5,
      job: newJob,
      weapon: newWeapon,
      jobTier: newJobTier,
      x: 640,  // 스폰 지점
      y: 512,
    };
  }),
  
  // 전직 시도
  tryChangeJob: (job) => {
    const s = get();
    const req = JOB_REQUIREMENTS[job];
    
    if (!req) return false;
    
    const meetsReq = 
      s.level >= req.level &&
      (!req.str || s.str >= req.str) &&
      (!req.dex || s.dex >= req.dex) &&
      (!req.int || s.int >= req.int) &&
      (!req.luk || s.luk >= req.luk);
    
    if (meetsReq) {
      set({
        job,
        jobTier: 1,
        weapon: JOB_WEAPONS[job],
      });
      return true;
    }
    
    return false;
  },
  
  // 전직 조건 유지 체크 (매 틱마다 호출)
  checkJobMaintenance: () => {
    const s = get();
    if (s.job === 'Base') return;
    
    const req = JOB_REQUIREMENTS[s.job];
    if (!req) return;
    
    const meetsReq = 
      s.level >= req.level &&
      (!req.str || s.str >= req.str) &&
      (!req.dex || s.dex >= req.dex) &&
      (!req.int || s.int >= req.int) &&
      (!req.luk || s.luk >= req.luk);
    
    if (!meetsReq) {
      set({
        job: 'Base',
        jobTier: 0,
        weapon: 'Bone',
      });
    }
  },
}));
```

---

## ⚠️ 프로토타입 원칙
- **빠르게**: 완벽보다 속도
- **하드코딩 OK**: 설정값 상수로
- **싱글플레이만**: 서버/DB 없음
- **핵심만**: 파밍 → 성장 → 전직 → 전투 → 사망 루프 확인

---

## 🚀 시작!

위 내용 기반으로 프로토타입 만들어줘.
Step 1부터 순서대로 진행하고, 각 Step 완료 시 테스트 가능하게 해줘.