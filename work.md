# Skeleton MMORPG - 설치 및 실행 가이드

## 개요
이 문서는 해골 MMORPG 프로젝트를 처음부터 실행하기 위해 필요한 모든 단계를 설명합니다.

## 사전 요구사항
- Node.js 18+ 설치
- npm 또는 yarn 설치
- Git 설치 (선택사항)

## 프로젝트 구조
```
Web-MMORPG/
├── client/                 # React 프론트엔드 (Vite)
├── server/                 # Node.js 백엔드 (Express + Socket.io)
├── shared/                 # 공유 타입 정의
├── Character/              # 캐릭터 에셋
└── package.json            # 루트 패키지 (concurrently)
```

---

## 1단계: 의존성 설치

### 루트 디렉토리에서 전체 설치
```bash
cd Web-MMORPG
npm run install:all
```

또는 수동으로 각각 설치:
```bash
# 루트 의존성
npm install

# 클라이언트 의존성
cd client
npm install
cd ..

# 서버 의존성
cd server
npm install
cd ..
```

---

## 2단계: Supabase 설정

### 2-1. Supabase 프로젝트 생성
1. https://supabase.com 에서 새 프로젝트 생성
2. Project URL과 anon key를 복사

### 2-2. 데이터베이스 테이블 생성
Supabase SQL Editor에서 다음 SQL 실행:

```sql
-- 캐릭터 테이블
CREATE TABLE characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL UNIQUE,
  job VARCHAR(20) DEFAULT 'Base',
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 100,
  hp INTEGER DEFAULT 100,
  mp INTEGER DEFAULT 50,
  max_hp INTEGER DEFAULT 100,
  max_mp INTEGER DEFAULT 50,
  attack INTEGER DEFAULT 10,
  defense INTEGER DEFAULT 5,
  x FLOAT DEFAULT 400,
  y FLOAT DEFAULT 300,
  map_id VARCHAR(50) DEFAULT 'starter_village',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인벤토리 테이블
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  item_id VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  slot INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 장비 테이블
CREATE TABLE equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  slot VARCHAR(20) NOT NULL,
  item_id VARCHAR(50),
  UNIQUE(character_id, slot)
);

-- 스킬 테이블
CREATE TABLE character_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  skill_id VARCHAR(50) NOT NULL,
  level INTEGER DEFAULT 1,
  UNIQUE(character_id, skill_id)
);

-- 퀘스트 진행 테이블
CREATE TABLE character_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  quest_id VARCHAR(50) NOT NULL,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(character_id, quest_id)
);

-- 매칭 기록 테이블
CREATE TABLE match_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL,
  team VARCHAR(10),
  result VARCHAR(10),
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security 활성화
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

-- 정책 생성 (사용자는 자신의 데이터만 접근)
CREATE POLICY "Users can view own characters" ON characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters" ON characters
  FOR DELETE USING (auth.uid() = user_id);

-- 인벤토리 정책
CREATE POLICY "Users can manage own inventory" ON inventory
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- 장비 정책
CREATE POLICY "Users can manage own equipment" ON equipment
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- 스킬 정책
CREATE POLICY "Users can manage own skills" ON character_skills
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- 퀘스트 정책
CREATE POLICY "Users can manage own quests" ON character_quests
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- 매칭 기록 정책
CREATE POLICY "Users can view own match history" ON match_history
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );
```

### 2-3. 환경 변수 설정 (이미 설정됨)
현재 프로젝트에 이미 설정된 값:

**client/.env**
```
VITE_SUPABASE_URL=https://qtvlysukacrqrxqqnnsf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SERVER_URL=http://localhost:4000
```

**server/.env**
```
PORT=4000
CLIENT_URL=http://localhost:3000
SUPABASE_URL=https://qtvlysukacrqrxqqnnsf.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ 자신의 Supabase 프로젝트를 사용하려면 위 값들을 교체하세요.

---

## 3단계: 개발 서버 실행

### 클라이언트 + 서버 동시 실행 (권장)
```bash
npm run dev
```

### 또는 각각 실행

터미널 1 - 클라이언트:
```bash
cd client
npm run dev
```

터미널 2 - 서버:
```bash
cd server
npm run dev
```

---

## 4단계: 접속 및 테스트

1. 브라우저에서 http://localhost:3000 접속
2. 회원가입 (이메일 + 비밀번호)
3. 캐릭터 생성 (이름 + 직업 선택)
4. 게임 시작

---

## 주요 기능

### 기본 조작
- **WASD / 화살표**: 이동
- **스페이스바**: 공격
- **클릭**: 자원 채집 / NPC 대화
- **숫자키 1-6**: 스킬 사용

### 시스템
- **인벤토리 (I)**: 아이템 관리
- **스킬 (K)**: 스킬 배우기 및 슬롯 배치
- **장비 (E)**: 장비 착용/해제
- **퀘스트 (L)**: 퀘스트 진행 확인
- **제작 (C)**: 아이템 크래프팅

### UI 창 열기
- `I` - 인벤토리
- `K` - 스킬
- `E` - 장비
- `L` - 퀘스트 로그
- `C` - 제작

---

## 프로덕션 빌드

```bash
# 빌드
npm run build

# 클라이언트만 빌드
npm run build:client

# 서버만 빌드
npm run build:server
```

---

## 트러블슈팅

### "Module not found" 에러
```bash
npm run install:all
```

### Supabase 연결 실패
1. .env 파일의 URL과 키 확인
2. Supabase 대시보드에서 API 설정 확인

### 포트 충돌
- 클라이언트: 기본 3000 (vite.config.ts에서 변경 가능)
- 서버: 기본 4000 (server/.env에서 변경)

### TypeScript 에러
```bash
cd client
npm run type-check
```

---

## 파일 구조 요약

### 클라이언트 주요 파일
```
client/src/
├── App.tsx                      # 메인 앱 (라우팅)
├── stores/                      # Zustand 상태관리
│   ├── authStore.ts             # 인증
│   ├── playerStore.ts           # 플레이어
│   ├── inventoryStore.ts        # 인벤토리
│   ├── skillStore.ts            # 스킬
│   ├── equipmentStore.ts        # 장비
│   ├── questStore.ts            # 퀘스트
│   ├── craftingStore.ts         # 제작
│   ├── multiplayerStore.ts      # 멀티플레이어
│   └── matchStore.ts            # 매칭
├── components/
│   ├── auth/                    # 로그인/회원가입
│   ├── windows/                 # UI 창들
│   └── multiplayer/             # 채팅/플레이어 목록
├── game/
│   ├── entities/                # 플레이어, 몬스터, NPC
│   └── systems/                 # 전투 시스템
├── data/                        # JSON 데이터
│   ├── items.json
│   ├── skills.json
│   ├── npcs.json
│   ├── quests.json
│   └── recipes.json
└── services/                    # API 서비스
    ├── supabase.ts
    └── socket.ts
```

### 서버 주요 파일
```
server/src/
├── index.ts                     # 메인 서버
├── socket/handlers.ts           # Socket.io 핸들러
└── db/supabase.ts              # Supabase 연결
```

---

## 다음 단계 (선택사항)

1. **배포**: Vercel (클라이언트) + Railway/Render (서버)
2. **추가 콘텐츠**: 새로운 맵, 몬스터, 아이템 추가
3. **밸런싱**: 스킬 데미지, 레벨업 경험치 조정
4. **UI 개선**: 더 나은 그래픽, 애니메이션

---

## 문의
프로젝트 관련 문의사항은 이슈를 통해 남겨주세요.
