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

### 1. 공격 방향 버그

❗ **문제**
- 플레이어 공격 시 방향이 잘못된 곳으로 표시됨
- 다른 플레이어에게 공격 방향이 동기화되지 않음

💡 **해결책**
- `player:attack` 이벤트에 방향, 위치, 타겟 좌표 데이터 추가
- 서버에서 공격 방향을 브로드캐스트하여 모든 클라이언트에 동기화

✅ **결과**
- 정확한 공격 방향 표시, 멀티플레이어 공격 동기화 완료

---

### 2. 게임 시간 동기화

❗ **문제**
- 각 클라이언트가 독립적으로 시간을 계산하여 플레이어마다 다른 시간 표시
- 낮/밤 주기가 플레이어별로 다르게 적용됨

💡 **해결책**
- 서버에서 게임 시간 관리 (`gameTime` 상태, 1초 = 1게임분)
- 5초마다 `time:update` 이벤트로 모든 클라이언트에 브로드캐스트
- 클라이언트는 서버 시간 수신 후 로컬 보간으로 부드러운 시간 흐름

✅ **결과**
- 모든 플레이어가 동일한 게임 시간 공유, 일관된 낮/밤 주기

---

### 3. 성능 최적화

❗ **문제**
- 게임 루프에서 불필요한 리렌더링 발생
- 많은 플레이어/몬스터 시 프레임 드롭

💡 **해결책**
- `React.memo`로 UI 컴포넌트 메모이제이션 (PartyUI, SkillBar, ChatBox 등)
- `useMemo`로 선택자 최적화, Zustand 상태 구독 최소화
- Canvas 렌더링과 React 상태 분리

✅ **결과**
- 불필요한 리렌더링 제거, 안정적인 60fps 유지

---

### 4. Railway 서버 배포 오류

❗ **문제**
- TypeScript 빌드 오류 (타입 불일치, 누락된 export)
- 서버 시작 경로 오류 (`Cannot find module dist/index.js`)
- 클라이언트 정적 파일 경로 오류 (`ENOENT: no such file`)
- Supabase 환경변수 미인식

💡 **해결책**
- 타입 오류: `InventoryItem` 인터페이스에 `gold` 추가, 속성명 수정 (`itemId` → `id`)
- 서버 경로: `tsconfig.json`의 `rootDir` 설정으로 인한 출력 구조 파악, start 스크립트를 `dist/server/src/index.js`로 수정
- 정적 파일: `__dirname` 기준 경로를 `../../../../client/dist`로 수정
- 환경변수: Vite는 `VITE_` 접두사 필요, Railway Variables에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가 후 재빌드

✅ **결과**
- Railway 배포 성공, 클라이언트/서버 통합 서빙 정상 작동
