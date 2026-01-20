/**
 * 해골 캐릭터 파츠 분리 스크립트 v2
 * - 트리밍 없이 고정 크기로 분리
 * - 모든 캐릭터의 Head, Body 크기가 동일하게 유지됨
 * 
 * 사용법:
 * 1. 이 파일을 프로젝트 폴더에 저장
 * 2. npm install sharp 실행
 * 3. node split_parts.js 실행
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ============ 설정 ============
const CONFIG = {
    // 원본 이미지 폴더 (캐릭터 이미지들이 있는 곳)
    inputDir: './Character/original',
    
    // 출력 폴더
    outputHeadDir: './Character/head',
    outputBodyDir: './Character/body',
    
    // 원본 이미지 크기
    originalWidth: 1000,
    originalHeight: 1400,
    
    // 분리 라인 Y좌표
    line1Y: 830,   // 머리/몸통 경계
    line2Y: 1230,  // 몸통/발 경계
};

// 계산된 크기 (고정)
const HEAD_WIDTH = CONFIG.originalWidth;                    // 1000
const HEAD_HEIGHT = CONFIG.line1Y;                          // 925
const BODY_WIDTH = CONFIG.originalWidth;                    // 1000
const BODY_HEIGHT = CONFIG.line2Y - CONFIG.line1Y;          // 267

// ============ 메인 함수 ============
async function main() {
    console.log('🦴 해골 캐릭터 파츠 분리 스크립트 v2');
    console.log('=====================================\n');
    
    // 출력 폴더 생성
    ensureDir(CONFIG.outputHeadDir);
    ensureDir(CONFIG.outputBodyDir);
    
    // 입력 폴더 확인
    if (!fs.existsSync(CONFIG.inputDir)) {
        console.log(`❌ 입력 폴더가 없습니다: ${CONFIG.inputDir}`);
        console.log(`\n📁 폴더를 생성하고 캐릭터 이미지를 넣어주세요.`);
        ensureDir(CONFIG.inputDir);
        return;
    }
    
    // PNG 파일 목록 가져오기
    const files = fs.readdirSync(CONFIG.inputDir)
        .filter(f => f.toLowerCase().endsWith('.png'));
    
    if (files.length === 0) {
        console.log(`❌ PNG 파일이 없습니다: ${CONFIG.inputDir}`);
        console.log(`\n📁 캐릭터 이미지 파일을 넣어주세요.`);
        return;
    }
    
    console.log(`📂 입력 폴더: ${CONFIG.inputDir}`);
    console.log(`📂 Head 출력: ${CONFIG.outputHeadDir}`);
    console.log(`📂 Body 출력: ${CONFIG.outputBodyDir}`);
    console.log(`\n🔧 분리 설정:`);
    console.log(`   Line 1 (머리/몸통): Y = ${CONFIG.line1Y}`);
    console.log(`   Line 2 (몸통/발): Y = ${CONFIG.line2Y}`);
    console.log(`\n📐 출력 크기 (고정):`);
    console.log(`   Head: ${HEAD_WIDTH} x ${HEAD_HEIGHT}px`);
    console.log(`   Body: ${BODY_WIDTH} x ${BODY_HEIGHT}px`);
    console.log(`\n📄 발견된 파일: ${files.length}개\n`);
    
    // 각 파일 처리
    let success = 0;
    let failed = 0;
    
    for (const file of files) {
        const inputPath = path.join(CONFIG.inputDir, file);
        const baseName = path.basename(file, '.png');
        
        try {
            await splitCharacter(inputPath, baseName);
            console.log(`✅ ${file}`);
            success++;
        } catch (err) {
            console.log(`❌ ${file} - ${err.message}`);
            failed++;
        }
    }
    
    console.log(`\n=====================================`);
    console.log(`✨ 완료! 성공: ${success}, 실패: ${failed}`);
    console.log(`\n📁 결과 확인:`);
    console.log(`   Head: ${CONFIG.outputHeadDir}`);
    console.log(`   Body: ${CONFIG.outputBodyDir}`);
}

// ============ 파츠 분리 함수 ============
async function splitCharacter(inputPath, baseName) {
    // Head 추출 (0 ~ line1Y) - 트리밍 없이 고정 크기
    const headOutputPath = path.join(CONFIG.outputHeadDir, `${baseName}-Head.png`);
    await sharp(inputPath)
        .extract({ 
            left: 0, 
            top: 0, 
            width: HEAD_WIDTH, 
            height: HEAD_HEIGHT 
        })
        .toFile(headOutputPath);
    
    // Body 추출 (line1Y ~ line2Y) - 트리밍 없이 고정 크기
    const bodyOutputPath = path.join(CONFIG.outputBodyDir, `${baseName}-Body.png`);
    await sharp(inputPath)
        .extract({ 
            left: 0, 
            top: CONFIG.line1Y, 
            width: BODY_WIDTH, 
            height: BODY_HEIGHT 
        })
        .toFile(bodyOutputPath);
}

// ============ 폴더 생성 함수 ============
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 폴더 생성: ${dir}`);
    }
}

// ============ 실행 ============
main().catch(err => {
    console.error('에러 발생:', err);
});