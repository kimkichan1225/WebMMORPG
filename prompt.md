# 🎮 해골 MMORPG 개발 프롬프트

## 프로젝트 개요
웹 기반 2D 탑다운 MMORPG. 귀여운 해골 캐릭터가 전투, 채집, 제작을 하며 성장하는 게임.

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
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # UI 컴포넌트
│   │   ├── game/           # 게임 로직
│   │   │   ├── Canvas.tsx  # 메인 캔버스
│   │   │   ├── Player.ts   # 플레이어 클래스
│   │   │   ├── Camera.ts   # 카메라
│   │   │   └── Map.ts      # 맵/타일
│   │   ├── stores/         # Zustand 스토어
│   │   ├── hooks/          # 커스텀 훅
│   │   ├── types/          # TypeScript 타입
│   │   └── assets/         # 이미지, 사운드
│   └── package.json
├── server/                 # Node.js 백엔드
│   ├── src/
│   │   ├── routes/         # API 라우트
│   │   ├── socket/         # Socket.io 핸들러
│   │   └── services/       # 비즈니스 로직
│   └── package.json
└── Character/              # 캐릭터 에셋 (분리 완료)
    ├── head/               # 머리 파츠 (1000x830)
    ├── body/               # 몸통 파츠 (1000x400)
    ├── foot/               # 발 파츠 (공통)
    └── weapon/             # 무기 (손 포함)
        ├── Bong.png        # 봉 (1024x1536)
        ├── Bow.png         # 활 (1024x1324)
        ├── Fork.png        # 포크 (1024x1536)
        ├── Gun.png         # 총 (1024x1536)
        ├── Knife.png       # 칼 (1024x1324)
        └── Bone.png        # 뼈 (1024x1536)
```

### 무기 에셋 특징
- 무기 이미지에 **해골 손이 포함**되어 있음
- 캐릭터 몸통 옆에 배치하면 자연스럽게 무기를 들고 있는 모습
- 렌더링 순서: Foot → Body → Weapon → Head

---

## 🎨 캐릭터 시스템

### 파츠 구조
캐릭터는 3개 파츠로 분리되어 있음:
- **Head** (1000x830px): 머리 + 모자/장비
- **Body** (1000x400px): 몸통 + 옷
- **Foot**: 왼발, 오른발 (공통, 걷기 애니메이션용)

### 직업 시스템
**기본 (Lv.1~)**
- Base: 무직업 상태

**1차 직업 (Lv.10+)**
| 직업 | 요구 스탯 | 보너스 |
|------|----------|--------|
| Warrior | STR 20+ | STR+5, VIT+3 |
| Archer | DEX 20+ | DEX+5, LUK+3 |
| Mage | INT 20+ | INT+5, VIT+3 |
| Thief | DEX 15+, LUK 15+ | DEX+3, LUK+5 |

**2차 직업 (Lv.30+)**
- Warrior → Sword, Blunt, Bong
- Archer → Bow, Crossbow, Gunner
- Mage → Element, Evil, Holy
- Thief → Dagger, Knife, Fighter

---

## 📊 스탯 시스템

### 5대 스탯 (레벨당 5포인트)
| 스탯 | 효과 |
|------|------|
| STR | 근접 데미지 +2, 소지량 +5 |
| DEX | 원거리 데미지 +2, 공속 +0.5%, 회피 +0.3% |
| INT | 마법 데미지 +2, MP +5, MP회복 +0.5% |
| VIT | HP +10, 방어력 +1, HP회복 +1% |
| LUK | 크리티컬 +0.5%, 드롭률 +0.3%, 희귀자원 +0.2% |

---

## 🗺️ 맵 시스템

### 타일맵
- 타일 크기: 32x32 또는 64x64
- 타일 종류: 잔디, 흙, 물, 벽, 도로
- 충돌 처리: 벽, 물은 이동 불가

### 맵 구성
- **마을**: 안전지대, NPC, 상점, 창고
- **필드**: 레벨별 사냥터, 자원 스폰 지점
- **던전**: 파티 콘텐츠 (MVP 제외)

---

## 🎮 조작

### 이동
- WASD 또는 방향키
- 8방향 이동
- 걷기 애니메이션 (발 번갈아 움직임)

### 카메라
- 플레이어 중심 추적
- 맵 경계 제한

---

## 💾 데이터베이스 스키마 (Supabase)

```sql
-- 유저
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 캐릭터
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

-- 인벤토리
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  item_id TEXT NOT NULL,
  quantity INT DEFAULT 1,
  slot INT
);

-- 생활스킬
CREATE TABLE life_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  logging_level INT DEFAULT 1,
  logging_exp INT DEFAULT 0,
  mining_level INT DEFAULT 1,
  mining_exp INT DEFAULT 0,
  gathering_level INT DEFAULT 1,
  gathering_exp INT DEFAULT 0,
  fishing_level INT DEFAULT 1,
  fishing_exp INT DEFAULT 0,
  cooking_level INT DEFAULT 1,
  cooking_exp INT DEFAULT 0,
  crafting_level INT DEFAULT 1,
  crafting_exp INT DEFAULT 0,
  alchemy_level INT DEFAULT 1,
  alchemy_exp INT DEFAULT 0
);
```

---

## 🚀 개발 순서 (Phase별)

### Phase 1: 기본 세팅 (1주차)
- [ ] React + TypeScript 프로젝트 생성
- [ ] Canvas 기본 구조 세팅
- [ ] Supabase 프로젝트 생성 + 테이블 생성
- [ ] Supabase Auth 연동 (회원가입/로그인)
- [ ] 캐릭터 생성 화면

### Phase 2: 이동 + 맵 (2주차)
- [ ] 캐릭터 파츠 렌더링 (head + body + foot)
- [ ] 8방향 이동 (WASD)
- [ ] 걷기 애니메이션 (발 번갈아 움직임)
- [ ] 카메라 추적
- [ ] 타일맵 렌더링
- [ ] 충돌 처리

### Phase 3: 스탯 (3주차)
- [ ] 스탯 UI (STR/DEX/INT/VIT/LUK)
- [ ] 레벨업 포인트 분배
- [ ] 스탯 효과 적용
- [ ] Supabase 저장/불러오기

### Phase 4: 전투 (4주차)
- [ ] 기본 공격
- [ ] 공격 애니메이션
- [ ] 몬스터 스폰/AI
- [ ] 데미지 계산 (스탯 기반)
- [ ] HP 바
- [ ] 경험치/레벨업

### Phase 5: 생활스킬 (5주차)
- [ ] 도구 장착 (도끼/곡괭이/낫)
- [ ] 자원 채집
- [ ] 채집 애니메이션
- [ ] 생활스킬 경험치

### Phase 6: 인벤토리 + 제작 (6주차)
- [ ] 인벤토리 UI
- [ ] 아이템 정보 표시
- [ ] 제작 UI
- [ ] 기본 레시피

### Phase 7: 퀘스트 (7주차)
- [ ] 퀘스트 UI
- [ ] NPC 대화
- [ ] 사냥/수집/제작 퀘스트
- [ ] 보상 지급

### Phase 8: 직업 변경 (8주차)
- [ ] 직업 요구조건 체크
- [ ] 직업 변경 UI
- [ ] 4개 1차 직업
- [ ] 직업별 외형 변경
- [ ] 직업 보너스 스탯

---

## 📝 첫 번째 작업 요청

**Phase 1부터 시작해줘.**

1. React + TypeScript + Vite 프로젝트 생성 (client 폴더)
2. Canvas 컴포넌트 기본 구조 만들기
3. 게임 루프 (requestAnimationFrame) 세팅
4. 간단한 캐릭터 파츠 렌더링 테스트 (head + body + foot 합치기)

에셋 경로: `Character/head/`, `Character/body/`, `Character/foot/`

---

## ⚠️ 주의사항
- 모든 코드에 TypeScript 타입 명시
- 컴포넌트는 함수형 + hooks 사용
- 게임 로직과 UI 로직 분리
- 상태관리는 Zustand 사용
- 커밋은 기능 단위로 나눠서