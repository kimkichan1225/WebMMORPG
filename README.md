# Web MMORPG

브라우저 기반 2D MMORPG 게임

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://webmmorpg-production.up.railway.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/kimkichan1225/WebMMORPG)

**[🎮 Live Demo](https://webmmorpg-production.up.railway.app/)** | **[📂 GitHub](https://github.com/kimkichan1225/WebMMORPG)**

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite
- Zustand (상태 관리)
- HTML5 Canvas (게임 렌더링)
- Socket.io-client (실시간 통신)

### Backend
- Node.js + Express
- Socket.io (WebSocket 서버)
- TypeScript

### Database
- Supabase (PostgreSQL + Auth)

### Deployment
- Railway (서버 + 클라이언트 통합 배포)

## 주요 기능

### 게임 시스템
- 캐릭터 생성 및 직업 선택 (Warrior, Archer, Mage, Thief)
- 2차 전직 시스템 (레벨 30+)
- 실시간 멀티플레이어 이동 및 전투
- 몬스터 스폰 및 AI
- 레벨업 및 스탯 분배

### 생활 스킬
- 벌목 (Logging) - 도끼
- 채광 (Mining) - 곡괭이
- 채집 (Gathering) - 낫
- 낚시 (Fishing) - 낚싯대

### 소셜 시스템
- 파티 시스템 (최대 4명)
- 길드 시스템 (계급: Leader, Officer, Member)
- 실시간 채팅 (글로벌, 파티, 길드, 귓속말)
- 거래 시스템

### 기타
- 서버 동기화 게임 시간 (낮/밤 주기)
- NPC 대화 및 퀘스트
- 미니맵

## 프로젝트 구조

```
Web-MMORPG/
├── client/                 # React 클라이언트
│   ├── src/
│   │   ├── components/     # UI 컴포넌트
│   │   ├── game/           # 게임 로직 (Canvas, 엔티티)
│   │   ├── stores/         # Zustand 상태 관리
│   │   ├── services/       # Socket, Supabase API
│   │   └── data/           # 게임 데이터 (맵, NPC)
│   └── public/assets/      # 게임 에셋
├── server/                 # Express 서버
│   └── src/
│       ├── index.ts        # 서버 엔트리포인트
│       └── socket/         # Socket.io 핸들러
├── shared/                 # 공유 타입 정의
│   └── types.ts
├── railway.json            # Railway 배포 설정
└── package.json            # 루트 스크립트
```

## 로컬 개발

### 설치
```bash
npm run install:all
```

### 개발 서버 실행
```bash
npm run dev
```
- 클라이언트: http://localhost:3000
- 서버: http://localhost:4000

### 빌드
```bash
npm run build
```

## Railway 배포

### 환경변수 설정 (Railway Variables)
```
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **중요**: 클라이언트에서 사용하는 환경변수는 `VITE_` 접두사가 필요합니다.

### 배포 방식
- 클라이언트와 서버 통합 배포
- 서버가 빌드된 클라이언트 정적 파일을 서빙
- GitHub push 시 자동 배포

---

## 문제 해결 사례

Railway 배포 과정에서 발생한 문제들과 해결 방법입니다.

### 1. TradeWindow.tsx TypeScript 오류

**문제**
```
Property 'gold' does not exist on InventoryState
Property 'itemId' does not exist on InventoryItem
Property 'rarity' does not exist on InventoryItem
```

**원인**
- `InventoryItem` 인터페이스에 `id`, `name`, `type`, `quantity`만 정의됨
- `TradeWindow.tsx`에서 존재하지 않는 `itemId`, `rarity`, `gold` 속성 접근

**해결**
1. `inventoryStore.ts`에 `gold` 속성 및 `addGold()`, `removeGold()` 메서드 추가
2. `TradeWindow.tsx`에서 `item.itemId` → `item.id`로 수정
3. 존재하지 않는 `item.rarity` 참조 제거

**결과**: 클라이언트 빌드 성공

---

### 2. guildApi Export 오류

**문제**
```
Module '"../services/supabase"' has no exported member 'guildApi'
```

**원인**
- 로컬에서 `guildApi`를 추가했지만 Git에 커밋되지 않음
- Railway는 GitHub 저장소의 코드를 사용하므로 로컬 변경사항이 반영되지 않음

**해결**
- `client/src/services/supabase.ts` 파일을 Git에 커밋 및 푸시

**결과**: Import 오류 해결

---

### 3. fishing_rod 타입 오류

**문제**
```
Property 'fishing_rod' is missing in type '{ axe: "logging"; pickaxe: "mining"; sickle: "gathering"; }'
```

**원인**
- `TOOL_TO_SKILL` Record에 `fishing_rod` 키가 누락
- 로컬 파일에는 있지만 Git에 커밋되지 않음

**해결**
- `client/src/stores/lifeSkillStore.ts` 파일을 Git에 커밋 및 푸시

**결과**: 타입 오류 해결

---

### 4. StatWindow fishing 속성 누락

**문제**
```
Property 'fishing' is missing in type '{ logging: string; mining: string; gathering: string; }'
```

**원인**
- `SKILL_ICONS`와 `SKILL_COLORS` Record에 `fishing` 키 누락
- 로컬에서 추가했지만 커밋되지 않음

**해결**
- `client/src/components/windows/StatWindow.tsx`에 fishing 아이콘(🎣) 및 색상(#4FC3F7) 추가 후 커밋

**결과**: 빌드 성공

---

### 5. 서버 시작 경로 오류

**문제**
```
Error: Cannot find module '/app/server/dist/index.js'
```

**원인**
- `tsconfig.json`의 `rootDir: ".."` 설정으로 인해 빌드 출력이 `dist/server/src/index.js`에 생성됨
- `package.json`의 start 스크립트는 `dist/index.js`를 찾음

**해결**
- `server/package.json`의 start 스크립트 수정:
  ```json
  "start": "node dist/server/src/index.js"
  ```

**결과**: 서버 정상 시작

---

### 6. 클라이언트 정적 파일 경로 오류

**문제**
```
Error: ENOENT: no such file or directory, stat '/app/server/dist/client/dist/index.html'
Serving static files from: /app/server/dist/client/dist
```

**원인**
- 서버 코드의 `__dirname`이 `/app/server/dist/server/src/`를 가리킴
- `../../client/dist` 경로가 `/app/server/dist/client/dist`로 잘못 해석됨
- 실제 클라이언트 빌드 위치: `/app/client/dist`

**해결**
- `server/src/index.ts`에서 경로 수정:
  ```typescript
  // 수정 전
  const clientDistPath = path.join(__dirname, '../../client/dist');

  // 수정 후
  const clientDistPath = path.join(__dirname, '../../../../client/dist');
  ```

**결과**: 정적 파일 정상 서빙

---

### 7. Supabase Key 오류

**문제**
```
Uncaught Error: supabaseKey is required.
```

**원인**
- Vite는 `VITE_` 접두사가 있는 환경변수만 클라이언트 빌드에 포함
- Railway Variables에 `SUPABASE_ANON_KEY`만 설정하고 `VITE_SUPABASE_ANON_KEY`는 미설정

**해결**
1. Railway Variables에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가
2. 빈 커밋으로 새 빌드 트리거 (환경변수는 빌드 시점에 포함됨)

**결과**: 클라이언트에서 Supabase 정상 연결

---

## 교훈

1. **로컬 변경사항은 반드시 커밋**: 로컬에서 작동해도 Git에 커밋하지 않으면 배포 환경에 반영되지 않음

2. **TypeScript rootDir 주의**: `rootDir` 설정이 빌드 출력 구조에 영향을 미침

3. **Vite 환경변수 규칙**: 클라이언트에서 사용할 환경변수는 `VITE_` 접두사 필수

4. **빌드 시점 vs 런타임**: Vite 환경변수는 빌드 시점에 번들에 포함되므로, 변수 변경 후 재빌드 필요
