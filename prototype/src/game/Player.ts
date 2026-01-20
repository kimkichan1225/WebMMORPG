import type { Direction } from '../types';
import { CONFIG } from '../types';

interface PlayerImages {
  headFront: HTMLImageElement;
  headBack: HTMLImageElement;
  bodyFront: HTMLImageElement;
  bodyBack: HTMLImageElement;
  footLeft: HTMLImageElement;
  footRight: HTMLImageElement;
}

export class Player {
  x: number;
  y: number;
  direction: Direction = 'down';
  isMoving: boolean = false;
  facingRight: boolean = false; // 좌우 반전 상태 (D키 누르면 true)

  private images: PlayerImages | null = null;
  private imagesLoaded: boolean = false;

  // 애니메이션
  private walkFrame: number = 0;
  private walkTimer: number = 0;
  private bounceOffset: number = 0;

  // 스케일 (캐릭터 전체 크기 조절)
  private scale: number = CONFIG.PLAYER_SCALE;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.loadImages();
  }

  private loadImages(): void {
    const imageUrls = {
      headFront: '/assets/head/Base-Head.png',
      headBack: '/assets/head/Base_Back-Head.png',
      bodyFront: '/assets/body/Base-Body.png',
      bodyBack: '/assets/body/Base_Back-Body.png',
      footLeft: '/assets/foot/foot_left.png',
      footRight: '/assets/foot/foot_right.png',
    };

    const loadedImages: Partial<PlayerImages> = {};
    let loadedCount = 0;
    const totalImages = Object.keys(imageUrls).length;

    Object.entries(imageUrls).forEach(([key, url]) => {
      const img = new Image();
      img.onload = () => {
        loadedImages[key as keyof PlayerImages] = img;
        loadedCount++;
        if (loadedCount === totalImages) {
          this.images = loadedImages as PlayerImages;
          this.imagesLoaded = true;
          console.log('Images loaded:', {
            head: { w: this.images.headFront.width, h: this.images.headFront.height },
            body: { w: this.images.bodyFront.width, h: this.images.bodyFront.height },
            foot: { w: this.images.footLeft.width, h: this.images.footLeft.height },
          });
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
      };
      img.src = url;
    });
  }

  update(deltaTime: number, isMoving: boolean, direction: Direction): void {
    this.isMoving = isMoving;
    this.direction = direction;

    if (isMoving) {
      this.walkTimer += deltaTime;
      if (this.walkTimer >= CONFIG.WALK_FRAME_DURATION) {
        this.walkTimer = 0;
        this.walkFrame = (this.walkFrame + 1) % 2;
      }
      this.bounceOffset = Math.sin(Date.now() / 100) * 2;
    } else {
      this.walkFrame = 0;
      this.walkTimer = 0;
      this.bounceOffset = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.imagesLoaded || !this.images) {
      const screenX = this.x - cameraX;
      const screenY = this.y - cameraY;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screenX, screenY, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();
      return;
    }

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // 방향에 따라 앞/뒤 이미지 선택
    const isFacingBack = this.direction === 'up';
    const headImg = isFacingBack ? this.images.headBack : this.images.headFront;
    const bodyImg = isFacingBack ? this.images.bodyBack : this.images.bodyFront;

    // 좌우 반전 여부 결정
    // front: D키(오른쪽)일 때 반전
    // back: A키(왼쪽)일 때 반전 (뒤돌아보면 좌우가 반대)
    const shouldFlip = isFacingBack ? !this.facingRight : this.facingRight;

    if (shouldFlip) {
      ctx.save();
      ctx.translate(screenX * 2, 0);
      ctx.scale(-1, 1);
    }

    // 실제 이미지 크기 사용
    const footW = this.images.footLeft.width * this.scale;
    const footH = this.images.footLeft.height * this.scale;
    const bodyW = this.images.bodyFront.width * this.scale;
    const bodyH = this.images.bodyFront.height * this.scale;
    const headW = this.images.headFront.width * this.scale;
    const headH = this.images.headFront.height * this.scale;

    // 파츠 간 간격 (겹치지 않도록)
    const GAP = 2;

    // 걷기 애니메이션: 발 위치 조정
    let leftFootOffsetY = 0;
    let rightFootOffsetY = 0;
    if (this.isMoving) {
      if (this.walkFrame === 0) {
        leftFootOffsetY = -5;
        rightFootOffsetY = 3;
      } else {
        leftFootOffsetY = 3;
        rightFootOffsetY = -5;
      }
    }

    // === 아래에서 위로 배치 ===
    // screenY = 캐릭터 중심 위치

    // 2. 몸통 (중심 기준)
    const bodyX = screenX - bodyW / 2;
    const bodyY = screenY - bodyH / 2 + this.bounceOffset;

    // 1. 발 (몸통 아래에 붙임 - 위로 올림)
    const footY = bodyY + bodyH - footH * 0.3; // 발을 몸통에 겹치게
    const footLeftX = screenX - footW - 2;
    const footRightX = screenX + 2;

    // 3. 머리 (몸통 위에 붙임 - 아래로 내림)
    const headX = screenX - headW / 2;
    const headY = bodyY - headH + headH * 0.15 + this.bounceOffset; // 머리를 몸통에 겹치게

    // 렌더링 순서 (나중에 그린 것이 앞에 보임)
    if (isFacingBack) {
      // W (뒤를 볼 때): 발 → 머리 → 몸 (몸이 제일 앞)
      ctx.drawImage(this.images.footLeft, footLeftX, footY + leftFootOffsetY, footW, footH);
      ctx.drawImage(this.images.footRight, footRightX, footY + rightFootOffsetY, footW, footH);
      ctx.drawImage(headImg, headX, headY, headW, headH);
      ctx.drawImage(bodyImg, bodyX, bodyY, bodyW, bodyH);
    } else {
      // S (앞을 볼 때): 몸 → 발 → 머리 (머리가 제일 앞)
      ctx.drawImage(bodyImg, bodyX, bodyY, bodyW, bodyH);
      ctx.drawImage(this.images.footLeft, footLeftX, footY + leftFootOffsetY, footW, footH);
      ctx.drawImage(this.images.footRight, footRightX, footY + rightFootOffsetY, footW, footH);
      ctx.drawImage(headImg, headX, headY, headW, headH);
    }

    // 좌우 반전 상태 복원
    if (shouldFlip) {
      ctx.restore();
    }

    // 디버그: 각 파츠 영역 표시 (확인 후 삭제)
    // ctx.strokeStyle = 'red';
    // ctx.strokeRect(headX, headY, headW, headH);
    // ctx.strokeStyle = 'blue';
    // ctx.strokeRect(bodyX, bodyY, bodyW, bodyH);
    // ctx.strokeStyle = 'green';
    // ctx.strokeRect(footLeftX, footY, footW, footH);
    // ctx.strokeRect(footRightX, footY, footW, footH);
  }
}
