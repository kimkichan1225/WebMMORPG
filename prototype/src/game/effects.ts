// Visual effects for combat and harvesting

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// ============ MODERN SLASH EFFECT ============
// Clean, fast, arcade-style slash inspired by Hades/Dead Cells

export const drawSlashEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  progress: number // 0~1
) => {
  ctx.save();
  ctx.translate(x, y);

  // Direction rotation
  let rotation = 0;
  switch (direction) {
    case 'right': rotation = 0; break;
    case 'down': rotation = Math.PI / 2; break;
    case 'left': rotation = Math.PI; break;
    case 'up': rotation = -Math.PI / 2; break;
  }
  ctx.rotate(rotation);

  // Fast attack feel - quick in, slow out
  const easeOutExpo = (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  const easedProgress = easeOutExpo(progress);

  // Alpha fades out
  const alpha = Math.max(0, 1 - progress * 1.5);

  // Slash arc - sweeps from top to bottom
  const radius = 45;
  const thickness = 8;
  const startAngle = -Math.PI * 0.5; // Start at top (-90°)
  const endAngle = Math.PI * 0.25;   // End at bottom-right (+45°)
  const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;

  // Main slash trail
  ctx.lineCap = 'round';

  // Outer glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 20 * alpha;

  // Draw the slash arc with gradient
  const gradient = ctx.createLinearGradient(
    Math.cos(startAngle) * radius,
    Math.sin(startAngle) * radius,
    Math.cos(currentAngle) * radius,
    Math.sin(currentAngle) * radius
  );
  gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
  gradient.addColorStop(0.3, `rgba(255, 255, 255, ${alpha * 0.5})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, currentAngle);
  ctx.stroke();

  // Inner bright core
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
  ctx.lineWidth = thickness * 0.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle + (currentAngle - startAngle) * 0.5, currentAngle);
  ctx.stroke();

  // Tip spark
  if (progress < 0.6) {
    const tipX = Math.cos(currentAngle) * radius;
    const tipY = Math.sin(currentAngle) * radius;
    const sparkSize = 6 * (1 - progress);

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Hit effect - simple impact flash
export const drawHitEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  const alpha = Math.max(0, 1 - progress * 2);
  const size = 20 + progress * 30;

  // Impact flash
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.3, `rgba(255, 200, 150, ${alpha * 0.6})`);
  gradient.addColorStop(1, `rgba(255, 100, 50, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
};

// Harvest effect (particles)
export const drawHarvestEffect = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) => {
  particles.forEach((p) => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  });

  ctx.globalAlpha = 1;
};

// Level up effect
export const drawLevelUpEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();
  ctx.translate(x, y);

  const alpha = 1 - progress;
  const radius = 30 + progress * 50;

  ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

// Death effect
export const drawDeathEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();
  ctx.translate(x, y);

  const alpha = 1 - progress;

  ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, 0, 20 + progress * 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, 0, 30 + progress * 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Create harvest particles
export const createHarvestParticles = (
  x: number,
  y: number,
  color: string,
  count: number = 8
): Particle[] => {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 50 + Math.random() * 50;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      life: 1,
      maxLife: 1,
      color,
      size: 4 + Math.random() * 4,
    });
  }

  return particles;
};

// Update particles
export const updateParticles = (
  particles: Particle[],
  deltaTime: number
): Particle[] => {
  const dt = deltaTime / 1000;

  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 200 * dt,
      life: p.life - dt * 2,
    }))
    .filter((p) => p.life > 0);
};

// Damage number effect
export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife: number;
  isCritical: boolean;
}

export const drawDamageNumber = (
  ctx: CanvasRenderingContext2D,
  dn: DamageNumber
) => {
  const progress = 1 - dn.life / dn.maxLife;
  const alpha = Math.max(0, dn.life / dn.maxLife);
  const yOffset = -progress * 30;
  const scale = dn.isCritical ? 1.2 : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(dn.x, dn.y + yOffset);
  ctx.scale(scale, scale);

  ctx.font = dn.isCritical ? 'bold 22px Arial' : 'bold 18px Arial';
  ctx.textAlign = 'center';

  // Shadow
  ctx.fillStyle = '#000';
  ctx.fillText(dn.value.toString(), 1, 1);

  // Text
  ctx.fillStyle = dn.isCritical ? '#FFD700' : '#FF6B6B';
  ctx.fillText(dn.value.toString(), 0, 0);

  ctx.restore();
};

export const updateDamageNumbers = (
  damageNumbers: DamageNumber[],
  deltaTime: number
): DamageNumber[] => {
  const dt = deltaTime / 1000;

  return damageNumbers
    .map((dn) => ({
      ...dn,
      life: dn.life - dt,
    }))
    .filter((dn) => dn.life > 0);
};
