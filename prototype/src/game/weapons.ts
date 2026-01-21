// Canvas-based weapon drawing system
// All weapons are drawn with pivot point at handle (bottom of weapon)
// Weapon extends upward (negative Y direction)
export type WeaponType = 'bone' | 'sword' | 'bow' | 'staff' | 'dagger' | 'axe' | 'pickaxe' | 'sickle';

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
  }

  ctx.restore();
};

// Map job to weapon type
export const JOB_WEAPONS: Record<string, WeaponType> = {
  Base: 'bone',
  Warrior: 'sword',
  Archer: 'bow',
  Mage: 'staff',
  Thief: 'dagger',
};

// Map tool names to weapon types
export const TOOL_WEAPONS: Record<string, WeaponType> = {
  axe: 'axe',
  pickaxe: 'pickaxe',
  sickle: 'sickle',
};
