import { CONFIG, type Direction, type WeaponType, type JobType } from '@shared/types';
import { drawWeapon } from '../weapons';

interface PlayerImages {
  headFront: HTMLImageElement;
  headBack: HTMLImageElement;
  bodyFront: HTMLImageElement;
  bodyBack: HTMLImageElement;
  footLeft: HTMLImageElement;
  footRight: HTMLImageElement;
}

// Mapping from JobType to asset file prefix
// Note: Asset files have some typos (Worrior instead of Warrior, Achor instead of Archer)
// Format: { front: prefix for front-facing, back: prefix for back-facing }
// If only one prefix, both front and back use the same
interface AssetPrefix {
  front: string;
  back: string;
}

const JOB_ASSET_PREFIX: Record<JobType, AssetPrefix> = {
  // Base
  Base: { front: 'Base', back: 'Base' },
  // 1st jobs (note: Worrior is the typo in files for Warrior)
  // Note: Archer 1st job only has back sprites, front will fallback to Base
  Warrior: { front: 'Worrior', back: 'Worrior' },
  Archer: { front: 'Archer', back: 'Archer' },
  Mage: { front: 'Mage', back: 'Mage' },
  Thief: { front: 'Thief', back: 'Thief' },
  // 2nd jobs - Warrior branch (검, 둔기, 봉)
  Swordsman: { front: 'Worrior2-Sword', back: 'Worrior2-Sword' },
  Mace: { front: 'Worrior2-Blunt', back: 'Worrior2-Blunt' },
  Polearm: { front: 'Worrior2-Bong', back: 'Worrior2-Bong' },
  // 2nd jobs - Archer branch (거너, 활, 석궁) - note: Achor is typo in files
  Gunner: { front: 'Achor2-Gunner', back: 'Achor2-Gunner' },
  Bowmaster: { front: 'Achor2-Bow', back: 'Achor2-Bow' },
  Crossbowman: { front: 'Archer2-Crossbow', back: 'Archer2-Crossbow' },
  // 2nd jobs - Mage branch (원소, 성, 악)
  Elemental: { front: 'Mage2-Element', back: 'Mage2-Element' },
  Holy: { front: 'Mage2-Holy', back: 'Mage2-Holy' },
  Dark: { front: 'Mage2-Evil', back: 'Mage2-Evil' },
  // 2nd jobs - Thief branch (격투가, 단검, 표창)
  Fighter: { front: 'Thief2-Fighter', back: 'Thief2-Fighter' },
  Dagger: { front: 'Thief2-Dagger', back: 'Thief2-Dagger' },
  Shuriken: { front: 'Thief2-Knife', back: 'Thief2-Knife' },
};

export class Player {
  x: number;
  y: number;
  direction: Direction = 'down';
  isMoving: boolean = false;
  facingRight: boolean = false;
  weapon: WeaponType = 'bone';
  isAttacking: boolean = false;
  attackProgress: number = 0;
  currentJob: JobType = 'Base';
  name: string = '';
  level: number = 1;

  private images: PlayerImages | null = null;
  private imagesLoaded: boolean = false;

  // Animation
  private walkFrame: number = 0;
  private walkTimer: number = 0;
  private bounceOffset: number = 0;

  // Scale
  private scale: number = CONFIG.PLAYER_SCALE;

  constructor(x: number, y: number, job: JobType = 'Base', name: string = '', level: number = 1) {
    this.x = x;
    this.y = y;
    this.currentJob = job;
    this.name = name;
    this.level = level;
    this.loadImages(job);
  }

  // Update name and level
  setNameAndLevel(name: string, level: number): void {
    this.name = name;
    this.level = level;
  }

  private loadImages(job: JobType): void {
    const prefixConfig = JOB_ASSET_PREFIX[job] || JOB_ASSET_PREFIX.Base;
    const frontPrefix = prefixConfig.front;
    const backPrefix = prefixConfig.back;

    const imageUrls = {
      headFront: `/assets/head/${frontPrefix}-Head.png`,
      headBack: `/assets/head/${backPrefix}_Back-Head.png`,
      bodyFront: `/assets/body/${frontPrefix}-Body.png`,
      bodyBack: `/assets/body/${backPrefix}_Back-Body.png`,
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
        // Fallback to Base if image not found
        if (job !== 'Base' && (key === 'headFront' || key === 'headBack' || key === 'bodyFront' || key === 'bodyBack')) {
          const basePrefix = 'Base';
          const fallbackUrl = key.includes('head')
            ? `/assets/head/${basePrefix}${key === 'headBack' ? '_Back' : ''}-Head.png`
            : `/assets/body/${basePrefix}${key === 'bodyBack' ? '_Back' : ''}-Body.png`;
          img.src = fallbackUrl;
        }
      };
      img.src = url;
    });
  }

  // Update job and reload sprites
  setJob(job: JobType): void {
    if (this.currentJob !== job) {
      this.currentJob = job;
      this.imagesLoaded = false;
      this.loadImages(job);
    }
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

      // Draw name even when loading
      if (this.name) {
        const nameY = screenY - 45;
        const displayText = `Lv.${this.level} ${this.name}`;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(displayText).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(screenX - textWidth / 2 - 4, nameY - 8, textWidth + 8, 16);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(displayText, screenX, nameY);
      }
      return;
    }

    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Select front/back images based on direction
    const isFacingBack = this.direction === 'up';
    const headImg = isFacingBack ? this.images.headBack : this.images.headFront;
    const bodyImg = isFacingBack ? this.images.bodyBack : this.images.bodyFront;

    // Determine flip
    const shouldFlip = isFacingBack ? !this.facingRight : this.facingRight;

    if (shouldFlip) {
      ctx.save();
      ctx.translate(screenX * 2, 0);
      ctx.scale(-1, 1);
    }

    // Use actual image sizes
    const footW = this.images.footLeft.width * this.scale;
    const footH = this.images.footLeft.height * this.scale;
    const bodyW = this.images.bodyFront.width * this.scale;
    const bodyH = this.images.bodyFront.height * this.scale;
    const headW = this.images.headFront.width * this.scale;
    const headH = this.images.headFront.height * this.scale;

    // Walk animation
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

    // Part positions
    const bodyX = screenX - bodyW / 2;
    const bodyY = screenY - bodyH / 2 + this.bounceOffset;

    const footY = bodyY + bodyH - footH * 0.3;
    const footLeftX = screenX - footW - 2;
    const footRightX = screenX + 2;

    const headX = screenX - headW / 2;
    const headY = bodyY - headH + headH * 0.15 + this.bounceOffset;

    // ============ WEAPON ANIMATION ============
    const showWeapon = this.attackProgress > 0;

    // Fast ease out for snappy attack feel
    const easeOutExpo = (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    const easedProgress = easeOutExpo(this.attackProgress);

    // Base direction angle
    let dirAngle = 0;
    switch (this.direction) {
      case 'right': dirAngle = 0; break;
      case 'down': dirAngle = Math.PI / 2; break;
      case 'left': dirAngle = Math.PI; break;
      case 'up': dirAngle = -Math.PI / 2; break;
    }

    // Swing arc
    const swingStart = -Math.PI * 0.5;
    const swingEnd = Math.PI * 0.25;
    const swingAngle = swingStart + (swingEnd - swingStart) * easedProgress;
    const weaponAngle = dirAngle + swingAngle;

    // Weapon position
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

    // Draw name and level above head
    if (this.name) {
      const nameY = headY - 15;
      const displayText = `Lv.${this.level} ${this.name}`;

      // Text settings
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Measure text for background
      const textWidth = ctx.measureText(displayText).width;

      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(screenX - textWidth / 2 - 4, nameY - 8, textWidth + 8, 16);

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayText, screenX, nameY);
    }
  }
}
