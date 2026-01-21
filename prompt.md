# 🎮 해골 MMORPG - 통합 기획서

## 게임 개요
웹 기반 2D 탑다운 MMORPG + 팀 서바이벌 매칭 게임
귀여운 해골 캐릭터로 오픈월드에서 성장하거나, 매칭 게임에서 팀 대전을 즐김

---

## 🎯 두 가지 게임 모드

### 모드 1: 오픈월드 MMORPG
- 광장, 필드, 던전 자유 탐험
- 영구 캐릭터 성장 (레벨, 스탯, 장비)
- 퀘스트, 생활스킬, 거래, 파티, 길드
- 기존 MMORPG 시스템 그대로 유지

### 모드 2: 매칭 게임 (팀 서바이벌)
- 3v3 / 5v5 팀 대전
- 모두 Lv.1 Base 상태로 시작
- 인게임에서 파밍, 성장, 전직, 전투
- 한 판 끝나면 리셋, 보상은 오픈월드 캐릭터에 지급

---

## 기술 스택
- **Frontend**: React + TypeScript + Canvas API
- **상태관리**: Zustand
- **Backend**: Node.js + Express + Socket.io
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **배포**: Vercel (Frontend) / Railway (Backend)

---

## 📁 프로젝트 구조
```
Web-MMORPG/
├── client/
│   ├── src/
│   │   ├── components/        # UI 컴포넌트
│   │   ├── game/              # 게임 엔진
│   │   │   ├── Canvas.tsx
│   │   │   ├── Player.ts
│   │   │   ├── Camera.ts
│   │   │   ├── Map.ts
│   │   │   └── Monster.ts
│   │   ├── modes/             # 게임 모드
│   │   │   ├── OpenWorld/     # 오픈월드 모드
│   │   │   └── MatchGame/     # 매칭 게임 모드
│   │   ├── stores/            # Zustand
│   │   ├── hooks/
│   │   ├── types/
│   │   └── assets/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   ├── socket/
│   │   │   ├── lobby.ts       # 대기방 관리
│   │   │   ├── matchGame.ts   # 매칭 게임 로직
│   │   │   └── openWorld.ts   # 오픈월드 동기화
│   │   └── services/
└── Character/                 # 에셋
    ├── head/                  # 머리 (1000x830)
    ├── body/                  # 몸통 (1000x400)
    ├── foot/                  # 발 (공통)
    └── weapon/                # 무기 (손 포함)
        ├── Bong.png           # 봉 (1024x1536)
        ├── Bow.png            # 활 (1024x1324)
        ├── Fork.png           # 포크 (1024x1536)
        ├── Gun.png            # 총 (1024x1536)
        ├── Knife.png          # 칼 (1024x1324)
        └── Bone.png           # 뼈 (1024x1536)
```

---

# 🌍 오픈월드 모드 상세

## 캐릭터 시스템

### 파츠 구조
- Head (1000x830px): 머리 + 모자/장비
- Body (1000x400px): 몸통 + 옷
- Foot: 왼발, 오른발 (공통)
- Weapon: 무기 + 손 (1024x1324~1536)

### 렌더링 순서
1. Foot (왼발, 오른발)
2. Body
3. Weapon
4. Head

### 스탯 시스템 (레벨당 5포인트)
| 스탯 | 효과 |
|------|------|
| STR | 근접 데미지 +2, 소지량 +5 |
| DEX | 원거리 데미지 +2, 공속 +0.5%, 회피 +0.3% |
| INT | 마법 데미지 +2, MP +5, MP회복 +0.5% |
| VIT | HP +10, 방어력 +1, HP회복 +1% |
| LUK | 크리티컬 +0.5%, 드롭률 +0.3%, 희귀자원 +0.2% |

### 직업 시스템

**1차 직업 (Lv.10+)**
| 직업 | 요구 스탯 | 보너스 | 무기 |
|------|----------|--------|------|
| Warrior | STR 20+ | STR+5, VIT+3 | 검 |
| Archer | DEX 20+ | DEX+5, LUK+3 | 활 |
| Mage | INT 20+ | INT+5, VIT+3 | 스태프 |
| Thief | DEX 15+, LUK 15+ | DEX+3, LUK+5 | 단검 |

**2차 직업 (Lv.30+)**
- Warrior → Sword, Blunt, Bong
- Archer → Bow, Crossbow, Gunner
- Mage → Element, Evil, Holy
- Thief → Dagger, Knife, Fighter

### 생활스킬
| 스킬 | 도구 | 채집 대상 |
|------|------|----------|
| 벌목 | 도끼 | 나무 → 목재 |
| 채광 | 곡괭이 | 광석 → 돌, 철, 금, 미스릴 |
| 채집 | 낫 | 약초 → 힐링허브, 마나풀 |
| 낚시 | 낚싯대 | 물고기 |
| 요리 | - | 재료 → 버프 음식 |
| 제작 | - | 재료 → 장비 |
| 연금술 | - | 재료 → 포션, 강화석 |

---

# ⚔️ 매칭 게임 모드 상세

## 게임 플로우
```
[오픈월드 광장] → [대기방 생성/참가] → [게임 시작] → [인게임] → [결과] → [광장 복귀]
```

## 대기방 설정

| 설정 | 옵션 |
|------|------|
| 인원 | 3v3 / 5v5 |
| 승리조건 | 섬멸전 / 점령전 / 보스레이드 |
| 게임시간 | 10분 / 15분 / 20분 |

- 방장이 설정
- 친구 초대 / 랜덤 매칭
- 전원 준비 완료 시 게임 시작

## 승리 조건

### A) 섬멸전
- 상대팀 전원 동시 처치 (전멸 상태)
- 시간 종료 시: 생존자 수 → 총 레벨 합 → 총 킬 수

### B) 점령전
- 맵 중앙 거점 점령 게이지 100% 달성
- 시간 종료 시: 점령 게이지 높은 팀 승리

### C) 보스 레이드
- 맵 중앙 보스 먼저 처치한 팀 승리
- 보스는 게임 시작 5분 후 스폰
- 시간 종료 시: 보스에게 더 많은 데미지 준 팀

## 인게임 시스템

### 시작 조건
- 모두 Lv.1 Base 상태
- 기본검 장착
- **도구 1개 선택**: 도끼 / 곡괭이 / 낫

### 파밍 자원
| 도구 | 채집 대상 | 자원 |
|------|----------|------|
| 🪓 도끼 | 나무 | 목재, 단단한 목재 |
| ⛏️ 곡괭이 | 광석 | 돌, 철, 금, 미스릴 |
| 🌿 낫 | 약초 | 약초, 마나풀, 희귀약초 |

### 성장 루트
```
Lv.1 Base (기본검)
    │
    ├── 몬스터 사냥 → 경험치 → 레벨업
    ├── 레벨업 → 스탯 포인트 분배
    │
    ▼
Lv.10 + 스탯 조건 → 1차 전직 (직업 무기 자동 지급)
    │
    ▼
Lv.30 + 스탯 조건 → 2차 전직 (분파 무기 자동 지급)
```

### 사망 & 부활

| 항목 | 내용 |
|------|------|
| 부활 시간 | 10초 |
| 페널티 | 레벨 -1, 스탯 일부 감소 |
| 전직 조건 미달 시 | **전직 초기화** (Base 복귀, 기본검) |

### 자원 드롭 (사망 시)

| 자원 등급 | 드롭 확률 |
|----------|----------|
| 일반 (목재, 돌) | 30% |
| 중급 (철, 약초) | 20% |
| 고급 (금, 미스릴) | 10% |
| 제작 장비 | 50% |

- 드롭 아이템 바닥에 30초 유지
- 아군/적군 누구나 줍기 가능
- **팀 공유 상자 자원은 드롭 안 됨**

### 자원 관리

**개인 인벤토리**
- 본인이 파밍한 자원
- 죽으면 확률적으로 일부 드롭

**팀 공유 상자**
- 팀 거점에 위치
- 자원 넣기/빼기 가능
- 팀원 누구나 사용 가능
- **안전 보관** (죽어도 드롭 안 됨)

### 장비 시스템

| 상태 | 무기 |
|------|------|
| Base | 기본검 |
| 1차 전직 | 직업별 무기 자동 지급 |
| 2차 전직 | 분파별 무기 자동 지급 |
| 제작/강화 | 파밍 자원으로 업그레이드 |

**제작 예시**
```
기본검 + 철 x5 → 철검 (공격력 +10)
철검 + 금 x3 → 황금검 (공격력 +20)
활 + 단단한 목재 x3 → 강화활 (공격력 +15)
```

## 게임 맵 구조

```
┌─────────────────────────────────────┐
│                                     │
│  [팀A 거점]              [팀B 거점]  │
│   🏠 📦                    📦 🏠    │
│   스폰 상자                상자 스폰  │
│                                     │
│      🌲🪨    [중립 지역]    🪨🌲     │
│      파밍존                 파밍존   │
│                                     │
│           🐗 몬스터존 🐗            │
│                                     │
│         ┌─────────────┐            │
│         │ 중앙 거점/보스 │            │
│         │     🏆      │            │
│         └─────────────┘            │
│                                     │
│      🌲🪨               🪨🌲        │
│      파밍존              파밍존      │
│                                     │
└─────────────────────────────────────┘
```

## 결과 화면

| 항목 | 내용 |
|------|------|
| 승패 | 승리 / 패배 |
| MVP | 킬/데미지/힐 기여도 1위 |
| 개인 기록 | 킬, 데스, 데미지, 파밍량, 최고 레벨 |
| 보상 | 오픈월드 골드, 경험치, 칭호, 코스메틱 |

---

# 💾 데이터베이스 스키마

```sql
-- 유저 (오픈월드 + 매칭 공통)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 오픈월드 캐릭터 (영구 저장)
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  job_class TEXT DEFAULT 'Base',
  job_tier INT DEFAULT 0,
  str INT DEFAULT 5,
  dex INT DEFAULT 5,
  int INT DEFAULT 5,
  vit INT DEFAULT 5,
  luk INT DEFAULT 5,
  stat_points INT DEFAULT 0,
  hp INT DEFAULT 100,
  max_hp INT DEFAULT 100,
  mp INT DEFAULT 50,
  max_mp INT DEFAULT 50,
  gold INT DEFAULT 0,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  current_map TEXT DEFAULT 'town'
);

-- 매칭 게임 기록
CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  match_type TEXT NOT NULL,        -- '3v3', '5v5'
  win_condition TEXT NOT NULL,     -- 'elimination', 'capture', 'boss'
  result TEXT NOT NULL,            -- 'win', 'lose'
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  damage_dealt INT DEFAULT 0,
  resources_gathered INT DEFAULT 0,
  max_level_reached INT DEFAULT 1,
  mvp BOOLEAN DEFAULT FALSE,
  reward_gold INT DEFAULT 0,
  reward_exp INT DEFAULT 0,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 대기방
CREATE TABLE match_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES characters(id),
  match_type TEXT DEFAULT '3v3',
  win_condition TEXT DEFAULT 'elimination',
  game_duration INT DEFAULT 15,    -- 분
  status TEXT DEFAULT 'waiting',   -- 'waiting', 'playing', 'finished'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 대기방 참가자
CREATE TABLE match_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES match_rooms(id),
  character_id UUID REFERENCES characters(id),
  team TEXT,                       -- 'A', 'B'
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

# 🚀 개발 로드맵

## Phase 1: 기본 세팅 (1주)
- [ ] React + TypeScript + Vite 프로젝트
- [ ] Canvas 기본 구조
- [ ] Supabase 연동 (Auth, DB)
- [ ] 캐릭터 생성

## Phase 2: 캐릭터 & 이동 (1주)
- [ ] 파츠 렌더링 (Head + Body + Foot + Weapon)
- [ ] 8방향 이동 + 걷기 애니메이션
- [ ] 카메라 추적
- [ ] 기본 타일맵

## Phase 3: 오픈월드 기초 (2주)
- [ ] 마을 맵
- [ ] NPC 배치
- [ ] 스탯 시스템
- [ ] 전투 (몬스터)
- [ ] 레벨업 + 전직

## Phase 4: 매칭 시스템 (2주)
- [ ] 대기방 UI
- [ ] Socket.io 실시간 동기화
- [ ] 팀 매칭 로직
- [ ] 게임방 생성/참가

## Phase 5: 매칭 게임 인게임 (2주)
- [ ] 매칭 전용 맵
- [ ] Lv.1 시작 로직
- [ ] 도구 선택 + 파밍
- [ ] 인게임 전직
- [ ] 사망/부활/페널티
- [ ] 자원 드롭
- [ ] 팀 공유 상자

## Phase 6: 승리 조건 (1주)
- [ ] 섬멸전 로직
- [ ] 점령전 로직
- [ ] 보스 레이드 로직
- [ ] 결과 화면 + 보상

## Phase 7: 생활스킬 & 제작 (1주)
- [ ] 파밍 시스템
- [ ] 제작 시스템
- [ ] 장비 강화

## Phase 8: 폴리싱 (1주)
- [ ] UI/UX 개선
- [ ] 밸런스 조정
- [ ] 버그 수정
- [ ] 최적화

---

# 📝 첫 번째 작업 요청

**Phase 1부터 시작해줘.**

1. React + TypeScript + Vite 프로젝트 생성 (`client` 폴더)
2. Canvas 컴포넌트 기본 구조
3. 게임 루프 (requestAnimationFrame)
4. 캐릭터 파츠 렌더링 테스트 (Head + Body + Foot + Weapon 합치기)

에셋 경로: `Character/head/`, `Character/body/`, `Character/foot/`, `Character/weapon/`

---

# ⚠️ 개발 원칙
- 모든 코드에 TypeScript 타입 명시
- 컴포넌트는 함수형 + hooks
- 게임 로직과 UI 로직 분리
- 상태관리는 Zustand
- Socket.io는 Phase 4부터 도입
- 커밋은 기능 단위로