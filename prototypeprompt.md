# 🎮 해골 MMORPG 프로토타입 프롬프트

## 목표
빠르게 핵심 기능만 구현해서 게임의 느낌을 확인하는 프로토타입.
DB 연동 없이 로컬에서만 동작. 1~2일 안에 완성 목표.

---

## 기술 스택 (최소화)
- React + TypeScript + Vite
- Canvas API
- Zustand (상태관리)
- DB 없음 (로컬 상태만)

---

## 📁 폴더 구조
```
prototype/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   └── Game.tsx          # 메인 게임 컴포넌트
│   ├── game/
│   │   ├── GameCanvas.tsx    # Canvas 렌더링
│   │   ├── Player.ts         # 플레이어 클래스
│   │   ├── Camera.ts         # 카메라
│   │   ├── Map.ts            # 간단한 맵
│   │   └── Monster.ts        # 몬스터
│   ├── stores/
│   │   └── gameStore.ts      # Zustand 스토어
│   ├── types/
│   │   └── index.ts          # 타입 정의
│   └── assets/               # 캐릭터 이미지
│       ├── head/
│       ├── body/
│       └── foot/
└── package.json
```

---

## 🎨 캐릭터 에셋

### 파츠 크기
- Head: 1000x830px
- Body: 1000x400px  
- Foot: 왼발/오른발 (공통)

### 사용할 캐릭터 (프로토타입)
- Base (기본)
- Mage (마법사) - 직업 변경 테스트용

### 렌더링 방식
캔버스에 파츠를 순서대로 그림:
1. Foot (왼발, 오른발)
2. Body
3. Head

스케일 조절해서 화면에 적절한 크기로 표시 (예: 0.1배 = 100x83px 머리)

---

## 🎮 프로토타입 기능

### 1. 캐릭터 렌더링
- [x] Head + Body + Foot 합쳐서 그리기
- [x] 스케일 조절 (0.08~0.1배)
- [x] 중심점 맞추기

### 2. 이동
- [x] WASD / 방향키 입력
- [x] 8방향 이동
- [x] 이동 속도 조절

### 3. 걷기 애니메이션
- [x] 이동 중 왼발/오른발 번갈아 움직임
- [x] 정지 시 기본 자세

### 4. 카메라
- [x] 플레이어 중심 추적
- [x] 맵 경계 제한

### 5. 간단한 맵
- [x] 타일 기반 (잔디, 흙, 물)
- [x] 충돌 처리 (물, 벽 이동 불가)
- [x] 맵 크기: 30x30 타일

### 6. 몬스터 (선택)
- [ ] 슬라임 스폰
- [ ] 단순 AI (플레이어 추적)
- [ ] 클릭하면 데미지

### 7. UI (최소한)
- [x] HP/MP 바
- [x] 현재 위치 표시
- [ ] 간단한 스탯 창

---

## 📐 설정값

```typescript
// 게임 설정
const CONFIG = {
  // 캔버스
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // 캐릭터
  PLAYER_SCALE: 0.08,        // 파츠 스케일
  PLAYER_SPEED: 200,         // 이동 속도 (px/s)
  
  // 타일
  TILE_SIZE: 64,
  MAP_WIDTH: 30,             // 타일 개수
  MAP_HEIGHT: 30,
  
  // 애니메이션
  WALK_FRAME_DURATION: 200,  // 발 교체 주기 (ms)
};
```

---

## 🎯 즉시 구현 요청

**아래 순서대로 프로토타입 만들어줘:**

### Step 1: 프로젝트 세팅
```bash
npm create vite@latest prototype -- --template react-ts
cd prototype
npm install zustand
```

### Step 2: 캐릭터 렌더링
- Canvas에 Head + Body + Foot 이미지 로드
- 화면 중앙에 캐릭터 표시
- 스케일 0.08배로 축소

### Step 3: 이동 구현
- WASD 키 입력 감지
- 8방향 이동 (대각선 포함)
- 걷기 애니메이션 (발 번갈아)

### Step 4: 카메라 + 맵
- 간단한 타일맵 생성 (컬러 박스로 대체 가능)
- 카메라가 플레이어 추적
- 맵 경계 처리

### Step 5: 기본 UI
- 상단에 HP/MP 바
- 미니맵 또는 좌표 표시

---

## 📂 에셋 경로
```
src/assets/
├── head/
│   ├── Base-Head.png
│   └── Mage-Head.png
├── body/
│   ├── Base-Body.png
│   └── Mage-Body.png
├── foot/
│   ├── Foot_L.png
│   └── Foot_R.png
└── weapon/
    ├── Bong.png      # 봉 (1024x1536)
    ├── Bow.png       # 활 (1024x1324)
    ├── Fork.png      # 포크 (1024x1536)
    ├── Gun.png       # 총 (1024x1536)
    ├── Knife.png     # 칼 (1024x1324)
    └── Bone.png      # 뼈 (1024x1536)
```

### 무기 에셋 특징
- 무기 이미지에 **손이 포함**되어 있음 (해골 손)
- 캐릭터 몸통 옆에 배치하면 자연스럽게 들고 있는 모습
- 렌더링 순서: Foot → Body → Weapon → Head

---

## ⚡ 빠른 시작 코드

### gameStore.ts (Zustand)
```typescript
import { create } from 'zustand';

interface PlayerState {
  x: number;
  y: number;
  direction: string;
  isMoving: boolean;
  currentJob: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
}

interface GameState {
  player: PlayerState;
  movePlayer: (dx: number, dy: number) => void;
  setDirection: (dir: string) => void;
  setMoving: (moving: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: {
    x: 400,
    y: 300,
    direction: 'down',
    isMoving: false,
    currentJob: 'Base',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
  },
  movePlayer: (dx, dy) => set((state) => ({
    player: {
      ...state.player,
      x: state.player.x + dx,
      y: state.player.y + dy,
    }
  })),
  setDirection: (dir) => set((state) => ({
    player: { ...state.player, direction: dir }
  })),
  setMoving: (moving) => set((state) => ({
    player: { ...state.player, isMoving: moving }
  })),
}));
```

---

## ⚠️ 프로토타입 원칙
- **완벽보다 속도**: 일단 돌아가게 만들기
- **하드코딩 OK**: 설정값 상수로 박아도 됨
- **리팩토링 나중에**: 구조 잡는 건 본개발 때
- **에러 무시**: console.error 정도만
- **주석 최소화**: 코드로 설명되게

---

## 🚀 시작!

위 내용 기반으로 프로토타입 만들어줘.
Step 1부터 순서대로 진행하고, 각 Step 완료할 때마다 테스트 가능하게 해줘.