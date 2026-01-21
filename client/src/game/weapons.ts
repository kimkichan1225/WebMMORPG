// Canvas-based weapon drawing system
// All weapons are drawn with pivot point at handle (bottom of weapon)
// Weapon extends upward (negative Y direction)
import type { WeaponType } from '@shared/types';

export const drawWeapon = (
  ctx: CanvasRenderingContext2D,
  weapon: WeaponType,
  x: number,
  y: number,
  angle: number = 0,
  scale: number = 1,
  flip: boolean = false
) => {
  ctx.save();
  ctx.translate(x, y);

  if (flip) {
    ctx.scale(-1, 1);
  }

  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#000';

  switch (weapon) {
    case 'bone':
      // Pivot at bottom, weapon extends upward
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(-4, -50, 8, 50);
      ctx.strokeRect(-4, -50, 8, 50);
      // Bone end (top)
      ctx.beginPath();
      ctx.arc(-6, -50, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, -50, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bone end (bottom/handle)
      ctx.beginPath();
      ctx.arc(-6, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, 0, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'sword':
      // Handle at bottom (pivot point)
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-4, -20, 8, 20);
      ctx.strokeRect(-4, -20, 8, 20);
      // Guard
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-10, -25, 20, 6);
      ctx.strokeRect(-10, -25, 20, 6);
      // Blade (extends upward)
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-5, -25);
      ctx.lineTo(5, -25);
      ctx.lineTo(0, -65);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'bow':
      // Bow grip at center, but pivot at bottom
      ctx.fillStyle = '#8B4513';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#8B4513';
      ctx.beginPath();
      ctx.arc(0, -30, 30, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -58);
      ctx.lineTo(0, -2);
      ctx.stroke();
      // Grip
      ctx.fillStyle = '#654321';
      ctx.fillRect(-4, -35, 8, 12);
      break;

    case 'staff':
      // Handle at bottom
      ctx.fillStyle = '#4B0082';
      ctx.fillRect(-4, -70, 8, 70);
      ctx.strokeRect(-4, -70, 8, 70);
      // Orb at top
      ctx.fillStyle = '#9370DB';
      ctx.beginPath();
      ctx.arc(0, -78, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Light effect
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.arc(-3, -81, 3, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'dagger':
      // Handle at bottom
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -15, 6, 15);
      ctx.strokeRect(-3, -15, 6, 15);
      // Guard
      ctx.fillStyle = '#A0A0A0';
      ctx.fillRect(-7, -18, 14, 4);
      ctx.strokeRect(-7, -18, 14, 4);
      // Blade
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-4, -18);
      ctx.lineTo(4, -18);
      ctx.lineTo(0, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'axe':
      // Handle at bottom
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -55, 6, 55);
      ctx.strokeRect(-3, -55, 6, 55);
      // Axe head at top
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(-3, -45);
      ctx.lineTo(-20, -55);
      ctx.lineTo(-22, -40);
      ctx.lineTo(-3, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'pickaxe':
      // Handle at bottom
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -50, 6, 50);
      ctx.strokeRect(-3, -50, 6, 50);
      // Pickaxe head (left point)
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(-3, -45);
      ctx.lineTo(-25, -52);
      ctx.lineTo(-20, -42);
      ctx.lineTo(-3, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Pickaxe head (right point)
      ctx.beginPath();
      ctx.moveTo(3, -45);
      ctx.lineTo(25, -52);
      ctx.lineTo(20, -42);
      ctx.lineTo(3, -40);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'sickle':
      // Handle at bottom
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -30, 6, 30);
      ctx.strokeRect(-3, -30, 6, 30);
      // Sickle blade (curved)
      ctx.strokeStyle = '#A0A0A0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(15, -35, 20, Math.PI * 0.7, Math.PI * 1.4);
      ctx.stroke();
      // Blade edge
      ctx.strokeStyle = '#C0C0C0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(15, -35, 22, Math.PI * 0.7, Math.PI * 1.4);
      ctx.stroke();
      break;

    // === 2nd Job Weapons ===

    case 'great_sword':
      // Knight's great sword - large two-handed sword
      // Handle
      ctx.fillStyle = '#654321';
      ctx.fillRect(-5, -25, 10, 25);
      ctx.strokeRect(-5, -25, 10, 25);
      // Pommel
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Guard
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-18, -32, 36, 8);
      ctx.strokeRect(-18, -32, 36, 8);
      // Blade (wider)
      ctx.fillStyle = '#E8E8E8';
      ctx.beginPath();
      ctx.moveTo(-8, -32);
      ctx.lineTo(8, -32);
      ctx.lineTo(6, -85);
      ctx.lineTo(0, -95);
      ctx.lineTo(-6, -85);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Fuller (blood groove)
      ctx.strokeStyle = '#B0B0B0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -35);
      ctx.lineTo(0, -75);
      ctx.stroke();
      break;

    case 'battle_axe':
      // Berserker's battle axe - large double-sided axe
      // Handle
      ctx.fillStyle = '#5D3A1A';
      ctx.fillRect(-4, -70, 8, 70);
      ctx.strokeRect(-4, -70, 8, 70);
      // Left axe head
      ctx.fillStyle = '#B0B0B0';
      ctx.beginPath();
      ctx.moveTo(-4, -55);
      ctx.lineTo(-30, -65);
      ctx.lineTo(-35, -50);
      ctx.lineTo(-30, -35);
      ctx.lineTo(-4, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right axe head
      ctx.beginPath();
      ctx.moveTo(4, -55);
      ctx.lineTo(30, -65);
      ctx.lineTo(35, -50);
      ctx.lineTo(30, -35);
      ctx.lineTo(4, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Blood marks
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(-28, -55, 3, 8);
      ctx.fillRect(25, -52, 3, 8);
      break;

    case 'crossbow':
      // Sniper's crossbow
      // Stock
      ctx.fillStyle = '#654321';
      ctx.fillRect(-4, -20, 8, 25);
      ctx.strokeRect(-4, -20, 8, 25);
      // Bow arms
      ctx.fillStyle = '#4A3520';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-30, -25);
      ctx.quadraticCurveTo(-15, -35, 0, -25);
      ctx.quadraticCurveTo(15, -35, 30, -25);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#8B8B83';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-28, -25);
      ctx.lineTo(0, -20);
      ctx.lineTo(28, -25);
      ctx.stroke();
      // Scope
      ctx.fillStyle = '#333';
      ctx.fillRect(-3, -40, 6, 15);
      ctx.fillStyle = '#66B2FF';
      ctx.beginPath();
      ctx.arc(0, -45, 4, 0, Math.PI * 2);
      ctx.fill();
      // Bolt
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-1, -55, 2, 30);
      ctx.fillStyle = '#A0A0A0';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(-3, -55);
      ctx.lineTo(3, -55);
      ctx.closePath();
      ctx.fill();
      break;

    case 'long_bow':
      // Ranger's long bow - elegant curved bow
      // Bow body
      ctx.strokeStyle = '#5D3A1A';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, -45, 45, -Math.PI * 0.75, Math.PI * 0.75);
      ctx.stroke();
      // String
      ctx.strokeStyle = '#C0A080';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -88);
      ctx.lineTo(0, -2);
      ctx.stroke();
      // Grip wrapping
      ctx.fillStyle = '#2F4F2F';
      ctx.fillRect(-5, -50, 10, 15);
      // Decorative tips
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(0, -88, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -2, 4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'arcane_staff':
      // Wizard's arcane staff - glowing magical staff
      // Shaft
      ctx.fillStyle = '#2F0040';
      ctx.fillRect(-5, -85, 10, 85);
      ctx.strokeRect(-5, -85, 10, 85);
      // Spiral pattern
      ctx.strokeStyle = '#9932CC';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(-5 + (i % 2) * 10, -10 - i * 12, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Crystal holder
      ctx.fillStyle = '#4B0082';
      ctx.beginPath();
      ctx.moveTo(-10, -85);
      ctx.lineTo(10, -85);
      ctx.lineTo(12, -95);
      ctx.lineTo(0, -90);
      ctx.lineTo(-12, -95);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Magic crystal
      ctx.fillStyle = '#9370DB';
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.lineTo(-8, -105);
      ctx.lineTo(0, -115);
      ctx.lineTo(8, -105);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#E6E6FA';
      ctx.stroke();
      // Glow effect
      ctx.fillStyle = 'rgba(147, 112, 219, 0.4)';
      ctx.beginPath();
      ctx.arc(0, -105, 15, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'holy_staff':
      // Priest's holy staff - golden staff with cross
      // Shaft
      ctx.fillStyle = '#DAA520';
      ctx.fillRect(-4, -75, 8, 75);
      ctx.strokeRect(-4, -75, 8, 75);
      // Cross top
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-4, -100, 8, 30);
      ctx.fillRect(-15, -95, 30, 8);
      ctx.strokeRect(-4, -100, 8, 30);
      ctx.strokeRect(-15, -95, 30, 8);
      // Holy orb center
      ctx.fillStyle = '#FFFACD';
      ctx.beginPath();
      ctx.arc(0, -91, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFD700';
      ctx.stroke();
      // Light rays
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 8, -91 + Math.sin(angle) * 8);
        ctx.lineTo(Math.cos(angle) * 18, -91 + Math.sin(angle) * 18);
        ctx.stroke();
      }
      break;

    case 'twin_daggers':
      // Assassin's twin daggers
      // Left dagger handle
      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(-18, -12, 5, 15);
      ctx.strokeRect(-18, -12, 5, 15);
      // Left guard
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(-22, -15, 13, 4);
      // Left blade
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-20, -15);
      ctx.lineTo(-12, -15);
      ctx.lineTo(-16, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Right dagger handle
      ctx.fillStyle = '#1C1C1C';
      ctx.fillRect(13, -12, 5, 15);
      ctx.strokeRect(13, -12, 5, 15);
      // Right guard
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(9, -15, 13, 4);
      // Right blade
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(12, -15);
      ctx.lineTo(20, -15);
      ctx.lineTo(16, -45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Poison drip effect
      ctx.fillStyle = '#32CD32';
      ctx.beginPath();
      ctx.arc(-16, -40, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, -38, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'mace':
      // Mace - heavy blunt weapon
      // Handle
      ctx.fillStyle = '#654321';
      ctx.fillRect(-4, -55, 8, 55);
      ctx.strokeRect(-4, -55, 8, 55);
      // Mace head (spiked ball)
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.arc(0, -65, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Spikes
      ctx.fillStyle = '#A0A0A0';
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 12, -65 + Math.sin(angle) * 12);
        ctx.lineTo(Math.cos(angle) * 22, -65 + Math.sin(angle) * 22);
        ctx.lineTo(Math.cos(angle + 0.3) * 12, -65 + Math.sin(angle + 0.3) * 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;

    case 'polearm':
      // Polearm - long spear/pole weapon
      // Long shaft
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-3, -90, 6, 90);
      ctx.strokeRect(-3, -90, 6, 90);
      // Spear head
      ctx.fillStyle = '#C0C0C0';
      ctx.beginPath();
      ctx.moveTo(-8, -90);
      ctx.lineTo(0, -115);
      ctx.lineTo(8, -90);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Side blades
      ctx.beginPath();
      ctx.moveTo(-3, -85);
      ctx.lineTo(-15, -78);
      ctx.lineTo(-3, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, -85);
      ctx.lineTo(15, -78);
      ctx.lineTo(3, -75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;

    case 'gun':
      // Gunner's firearm
      // Barrel
      ctx.fillStyle = '#333';
      ctx.fillRect(-3, -50, 6, 35);
      ctx.strokeRect(-3, -50, 6, 35);
      // Muzzle
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(0, -52, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Body
      ctx.fillStyle = '#444';
      ctx.fillRect(-6, -20, 12, 20);
      ctx.strokeRect(-6, -20, 12, 20);
      // Grip
      ctx.fillStyle = '#5D3A1A';
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-10, 15);
      ctx.lineTo(-4, 18);
      ctx.lineTo(4, 18);
      ctx.lineTo(10, 15);
      ctx.lineTo(6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Trigger guard
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 5, 6, 0, Math.PI);
      ctx.stroke();
      break;

    case 'elemental_staff':
      // Elemental mage staff - fire/ice/lightning
      // Shaft
      ctx.fillStyle = '#2F4F4F';
      ctx.fillRect(-5, -80, 10, 80);
      ctx.strokeRect(-5, -80, 10, 80);
      // Elemental orbs (3 colors)
      // Fire orb
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.arc(-12, -90, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FF6347';
      ctx.stroke();
      // Ice orb
      ctx.fillStyle = '#00BFFF';
      ctx.beginPath();
      ctx.arc(12, -90, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#87CEEB';
      ctx.stroke();
      // Lightning orb (center, top)
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, -100, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFA500';
      ctx.stroke();
      // Energy glow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(0, -93, 20, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'dark_staff':
      // Dark mage staff - sinister purple/black
      // Shaft
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(-5, -75, 10, 75);
      ctx.strokeRect(-5, -75, 10, 75);
      // Skull ornament
      ctx.fillStyle = '#E8E8E8';
      ctx.beginPath();
      ctx.arc(0, -85, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eye sockets
      ctx.fillStyle = '#8B008B';
      ctx.beginPath();
      ctx.arc(-4, -87, 3, 0, Math.PI * 2);
      ctx.arc(4, -87, 3, 0, Math.PI * 2);
      ctx.fill();
      // Nose
      ctx.beginPath();
      ctx.moveTo(0, -85);
      ctx.lineTo(-2, -82);
      ctx.lineTo(2, -82);
      ctx.closePath();
      ctx.fill();
      // Dark aura
      ctx.strokeStyle = '#8B008B';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 15, -85 + Math.sin(angle) * 15);
        ctx.lineTo(Math.cos(angle) * 25, -85 + Math.sin(angle) * 25);
        ctx.stroke();
      }
      break;

    case 'fist':
      // Fighter's fist/gauntlet
      // Arm guard
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-8, -15, 16, 20);
      ctx.strokeRect(-8, -15, 16, 20);
      // Knuckle plate
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(-12, -35, 24, 22);
      ctx.strokeRect(-12, -35, 24, 22);
      // Spikes on knuckles
      ctx.fillStyle = '#A0A0A0';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-9 + i * 6, -35);
        ctx.lineTo(-6 + i * 6, -45);
        ctx.lineTo(-3 + i * 6, -35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Finger gaps
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-12 + i * 6, -35);
        ctx.lineTo(-12 + i * 6, -20);
        ctx.stroke();
      }
      break;

    case 'shuriken':
      // Ninja throwing stars (3 shurikens)
      const drawStar = (cx: number, cy: number, size: number) => {
        ctx.fillStyle = '#C0C0C0';
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const outerX = cx + Math.cos(angle) * size;
          const outerY = cy + Math.sin(angle) * size;
          const innerAngle = angle + Math.PI / 4;
          const innerX = cx + Math.cos(innerAngle) * (size * 0.3);
          const innerY = cy + Math.sin(innerAngle) * (size * 0.3);
          if (i === 0) {
            ctx.moveTo(outerX, outerY);
          } else {
            ctx.lineTo(outerX, outerY);
          }
          ctx.lineTo(innerX, innerY);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Center hole
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
      };
      // Draw 3 shurikens in spread formation
      drawStar(0, -45, 15);
      drawStar(-15, -25, 12);
      drawStar(15, -25, 12);
      break;
  }

  ctx.restore();
};

// Map job to weapon type
export const JOB_WEAPONS: Record<string, WeaponType> = {
  // Base job
  Base: 'bone',
  // 1st jobs
  Warrior: 'sword',
  Archer: 'bow',
  Mage: 'staff',
  Thief: 'dagger',
  // 2nd jobs - Warrior branch (검, 둔기, 봉)
  Swordsman: 'great_sword',
  Mace: 'mace',
  Polearm: 'polearm',
  // 2nd jobs - Archer branch (거너, 활, 석궁)
  Gunner: 'gun',
  Bowmaster: 'long_bow',
  Crossbowman: 'crossbow',
  // 2nd jobs - Mage branch (원소, 성, 악)
  Elemental: 'elemental_staff',
  Holy: 'holy_staff',
  Dark: 'dark_staff',
  // 2nd jobs - Thief branch (격투가, 단검, 표창)
  Fighter: 'fist',
  Dagger: 'twin_daggers',
  Shuriken: 'shuriken',
};

// Map tool names to weapon types
export const TOOL_WEAPONS: Record<string, WeaponType> = {
  axe: 'axe',
  pickaxe: 'pickaxe',
  sickle: 'sickle',
};

// Re-export type
export type { WeaponType };
