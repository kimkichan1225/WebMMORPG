# 해골 캐릭터 파츠 분리 스크립트

## 📁 폴더 구조 설정

프로젝트 폴더에 다음과 같이 구성하세요:

```
C:\Users\vxbc5\Desktop\개인 프로젝트\Web-MMORPG\
├── Character/
│   ├── original/      ← 여기에 원본 캐릭터 이미지 넣기
│   │   ├── Base.png
│   │   ├── Base_Back.png
│   │   ├── Archer.png
│   │   ├── Mage.png
│   │   └── ...
│   ├── head/          ← 머리 이미지가 저장될 폴더 (자동 생성)
│   └── body/          ← 몸통 이미지가 저장될 폴더 (자동 생성)
└── split_parts.js     ← 스크립트 파일
```

## 🚀 사용법

### 1. Node.js 설치 확인
```bash
node --version
```
설치 안 되어 있으면 https://nodejs.org 에서 다운로드

### 2. 프로젝트 폴더로 이동
```bash
cd "C:\Users\vxbc5\Desktop\개인 프로젝트\Web-MMORPG"
```

### 3. sharp 패키지 설치
```bash
npm install sharp
```

### 4. 원본 이미지 준비
`Character/original/` 폴더에 캐릭터 PNG 파일들 넣기

### 5. 스크립트 실행
```bash
node split_parts.js
```

## 📤 결과

실행하면 다음과 같이 저장됩니다:

- `Character/original/Base.png` → 
  - `Character/head/Base-Head.png`
  - `Character/body/Base-Body.png`

- `Character/original/Archer.png` → 
  - `Character/head/Archer-Head.png`
  - `Character/body/Archer-Body.png`

## ⚙️ 설정 변경

`split_parts.js` 파일 상단의 CONFIG 부분에서 수정 가능:

```javascript
const CONFIG = {
    inputDir: './Character/original',      // 원본 이미지 폴더
    outputHeadDir: './Character/head',     // Head 출력 폴더
    outputBodyDir: './Character/body',     // Body 출력 폴더
    
    line1Y: 925,   // 머리/몸통 경계 Y좌표
    line2Y: 1192,  // 몸통/발 경계 Y좌표
};
```

## ❓ 문제 해결

### "sharp 모듈을 찾을 수 없습니다"
```bash
npm install sharp
```

### "입력 폴더가 없습니다"
`Character/original/` 폴더를 만들고 PNG 파일을 넣으세요.

### 분리 위치가 안 맞아요
CONFIG의 `line1Y`, `line2Y` 값을 조절하세요.