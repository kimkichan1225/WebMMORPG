import type { Direction } from '../types';
import { CONFIG } from '../types';
import { drawWeapon, type WeaponType } from './weapons';

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
  facingRight: boolean = false;
  weapon: WeaponType = 'bone';
  isAttacking: boolean = false;
  attackProgress: number = 0;

  private images: PlayerImages | null = null;
  private imagesLoaded: boolean = false;

  // Animation
  private walkFrame: number = 0;
  private walkTimer: number = 0;
  private bounceOffset: number = 0;

  // Scale
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
        }
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
      };
      img.src = url;
    });
  }

  update(deltaTime: number, isMoving: boolean, direction: Direction, weapon?: WeaponType, isAttacking?: boolean): void {
    this.isMoving = isMoving;
    this.direction = direction;

    if (weapon) {
      this.weapon = weapon;
    }

    if (isAttacking !== undefined) {
      this.isAttacking = isAttacking;
    }

    // Attack animation
    if (this.isAttacking) {
      this.attackProgress = Math.min(1, this.attackProgress + deltaTime / 300);
    } else {
      this.attackProgress = Math.max(0, this.attackProgress - deltaTime / 150);
    }

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

    // 걷기 애니메이션
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

    // 파츠 위치 계산
    const bodyX = screenX - bodyW / 2;
    const bodyY = screenY - bodyH / 2 + this.bounceOffset;

    const footY = bodyY + bodyH - footH * 0.3;
    const footLeftX = screenX - footW - 2;
    const footRightX = screenX + 2;

    const headX = screenX - headW / 2;
    const headY = bodyY - headH + headH * 0.15 + this.bounceOffset;

    // ============ WEAPON ANIMATION ============
    // Simple, clean weapon swing that matches the slash effect
    const showWeapon = this.attackProgress > 0;

    // Fast ease out for snappy attack feel
    const easeOutExpo = (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const easedProgress = easeOutExpo(this.attackProgress);

    // Base direction angle (where the attack is aimed)
    let dirAngle = 0;
    switch (this.direction) {
      case 'right': dirAngle = 0; break;
      case 'down': dirAngle = Math.PI / 2; break;
      case 'left': dirAngle = Math.PI; break;
      case 'up': dirAngle = -Math.PI / 2; break;
    }

    // Swing arc matches slash effect: -90° to +45° relative to direction
    const swingStart = -Math.PI * 0.5;
    const swingEnd = Math.PI * 0.25;
    const swingAngle = swingStart + (swingEnd - swingStart) * easedProgress;
    const weaponAngle = dirAngle + swingAngle;

    // Position weapon near character, offset in attack direction
    const dist = 22;
    const weaponX = screenX + Math.cos(dirAngle) * dist;
    const weaponY = bodyY + bodyH * 0.15 + Math.sin(dirAngle) * dist;

    // Scale
    const weaponScale = 0.4;

    // Flip for left-side attacks
    const weaponFlip = this.direction === 'left';

    // Z-order: weapon behind when attacking up
    const weaponBehind = this.direction === 'up';

    // Draw weapon helper
    const renderWeapon = () => {
      if (showWeapon) {
        drawWeapon(ctx, this.weapon, weaponX, weaponY, weaponAngle, weaponScale, weaponFlip);
      }
    };

    // Render character parts with proper z-order
    if (isFacingBack) {
      ctx.drawImage(this.images.footLeft, footLeftX, footY + leftFootOffsetY, footW, footH);
      ctx.drawImage(this.images.footRight, footRightX, footY + rightFootOffsetY, footW, footH);
      ctx.drawImage(headImg, headX, headY, headW, headH);
      if (weaponBehind) renderWeapon();
      ctx.drawImage(bodyImg, bodyX, bodyY, bodyW, bodyH);
      if (!weaponBehind) renderWeapon();
    } else {
      ctx.drawImage(bodyImg, bodyX, bodyY, bodyW, bodyH);
      ctx.drawImage(this.images.footLeft, footLeftX, footY + leftFootOffsetY, footW, footH);
      ctx.drawImage(this.images.footRight, footRightX, footY + rightFootOffsetY, footW, footH);
      renderWeapon();
      ctx.drawImage(headImg, headX, headY, headW, headH);
    }

    // Restore flip state
    if (shouldFlip) {
      ctx.restore();
    }
  }
}
