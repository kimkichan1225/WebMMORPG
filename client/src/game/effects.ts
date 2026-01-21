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
// Enhanced with dynamic particles, multiple trails, and impact burst

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
  const alpha = Math.max(0, 1 - progress * 1.3);

  // Slash arc - sweeps from top to bottom
  const radius = 55;
  const thickness = 10;
  const startAngle = -Math.PI * 0.6;
  const endAngle = Math.PI * 0.35;
  const currentAngle = startAngle + (endAngle - startAngle) * easedProgress;

  // Dynamic outer glow with color shift
  ctx.shadowColor = `rgba(255, ${200 + Math.floor(55 * (1 - progress))}, 150, 0.9)`;
  ctx.shadowBlur = 30 * alpha;

  // Outer energy trail (wider, more dramatic)
  const outerGradient = ctx.createLinearGradient(
    Math.cos(startAngle) * radius * 1.2,
    Math.sin(startAngle) * radius * 1.2,
    Math.cos(currentAngle) * radius * 1.2,
    Math.sin(currentAngle) * radius * 1.2
  );
  outerGradient.addColorStop(0, `rgba(255, 200, 100, 0)`);
  outerGradient.addColorStop(0.2, `rgba(255, 180, 80, ${alpha * 0.3})`);
  outerGradient.addColorStop(0.6, `rgba(255, 150, 50, ${alpha * 0.5})`);
  outerGradient.addColorStop(1, `rgba(255, 100, 0, ${alpha * 0.7})`);

  ctx.strokeStyle = outerGradient;
  ctx.lineWidth = thickness * 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.1, startAngle, currentAngle);
  ctx.stroke();

  // Main slash arc with sharp gradient
  const mainGradient = ctx.createLinearGradient(
    Math.cos(startAngle) * radius,
    Math.sin(startAngle) * radius,
    Math.cos(currentAngle) * radius,
    Math.sin(currentAngle) * radius
  );
  mainGradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
  mainGradient.addColorStop(0.2, `rgba(255, 255, 220, ${alpha * 0.4})`);
  mainGradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.8})`);
  mainGradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

  ctx.strokeStyle = mainGradient;
  ctx.lineWidth = thickness;
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle, currentAngle);
  ctx.stroke();

  // Inner bright core (super white)
  ctx.shadowBlur = 15;
  ctx.shadowColor = 'rgba(255, 255, 255, 1)';
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = thickness * 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, radius, startAngle + (currentAngle - startAngle) * 0.4, currentAngle);
  ctx.stroke();

  // Sparkle particles along the arc
  ctx.shadowBlur = 0;
  for (let i = 0; i < 8; i++) {
    const particleAngle = startAngle + (currentAngle - startAngle) * (i / 8);
    const particleRadius = radius + (Math.random() - 0.5) * 20;
    const px = Math.cos(particleAngle) * particleRadius;
    const py = Math.sin(particleAngle) * particleRadius;
    const particleAlpha = alpha * (0.5 + Math.random() * 0.5);
    const particleSize = 2 + Math.random() * 3;

    ctx.fillStyle = `rgba(255, 255, ${200 + Math.floor(Math.random() * 55)}, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dramatic tip spark with burst
  if (progress < 0.7) {
    const tipX = Math.cos(currentAngle) * radius;
    const tipY = Math.sin(currentAngle) * radius;
    const sparkSize = 10 * (1 - progress * 0.8);

    // Outer glow
    const sparkGradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, sparkSize * 2);
    sparkGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    sparkGradient.addColorStop(0.3, `rgba(255, 220, 150, ${alpha * 0.7})`);
    sparkGradient.addColorStop(1, `rgba(255, 150, 50, 0)`);

    ctx.fillStyle = sparkGradient;
    ctx.beginPath();
    ctx.arc(tipX, tipY, sparkSize * 2, 0, Math.PI * 2);
    ctx.fill();

    // Sharp center
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(tipX, tipY, sparkSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Mini burst lines
    for (let i = 0; i < 4; i++) {
      const burstAngle = currentAngle + (i - 1.5) * 0.3;
      ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX + Math.cos(burstAngle) * sparkSize * 2,
        tipY + Math.sin(burstAngle) * sparkSize * 2
      );
      ctx.stroke();
    }
  }

  ctx.restore();
};

// Hit effect - dramatic impact with ring and particles
export const drawHitEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress * 1.5);
  const size = 25 + progress * 45;

  // Outer energy ring expanding
  ctx.strokeStyle = `rgba(255, 180, 100, ${alpha * 0.6})`;
  ctx.lineWidth = 4 * (1 - progress);
  ctx.beginPath();
  ctx.arc(x, y, size * 1.3, 0, Math.PI * 2);
  ctx.stroke();

  // Main impact flash with multiple color layers
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(0.15, `rgba(255, 255, 200, ${alpha})`);
  gradient.addColorStop(0.3, `rgba(255, 200, 150, ${alpha * 0.8})`);
  gradient.addColorStop(0.5, `rgba(255, 150, 80, ${alpha * 0.5})`);
  gradient.addColorStop(1, `rgba(255, 100, 50, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Impact spark lines
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + progress * 0.5;
    const lineLength = 15 + progress * 25;
    const innerDist = size * 0.3;

    ctx.strokeStyle = `rgba(255, 220, 150, ${alpha * 0.7})`;
    ctx.lineWidth = 2 * (1 - progress);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * innerDist,
      y + Math.sin(angle) * innerDist
    );
    ctx.lineTo(
      x + Math.cos(angle) * (innerDist + lineLength),
      y + Math.sin(angle) * (innerDist + lineLength)
    );
    ctx.stroke();
  }

  // Central white flash (very bright initially)
  if (progress < 0.3) {
    const flashAlpha = alpha * (1 - progress / 0.3);
    const flashGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.4);
    flashGradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
    flashGradient.addColorStop(1, `rgba(255, 255, 200, 0)`);

    ctx.fillStyle = flashGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small flying debris/sparks
  for (let i = 0; i < 6; i++) {
    const sparkAngle = (Math.PI * 2 * i) / 6 + progress * 2;
    const sparkDist = size * (0.5 + progress * 0.8);
    const sparkX = x + Math.cos(sparkAngle) * sparkDist;
    const sparkY = y + Math.sin(sparkAngle) * sparkDist;
    const sparkSize = 3 * (1 - progress);

    ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
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
  const yOffset = -progress * 40;

  // Dynamic scale: pop in, then shrink out
  let scale = 1;
  if (progress < 0.1) {
    // Pop in effect
    scale = 0.5 + (progress / 0.1) * 0.8;
  } else if (progress < 0.2) {
    // Overshoot
    scale = 1.3 - ((progress - 0.1) / 0.1) * 0.3;
  } else {
    // Normal with slight shrink at end
    scale = 1 - (progress - 0.2) * 0.3;
  }

  if (dn.isCritical) {
    scale *= 1.4;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(dn.x, dn.y + yOffset);
  ctx.scale(scale, scale);

  const fontSize = dn.isCritical ? 26 : 20;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';

  const text = dn.value.toString();

  if (dn.isCritical) {
    // Critical: golden glow with outline
    ctx.shadowColor = 'rgba(255, 200, 0, 0.9)';
    ctx.shadowBlur = 15;

    // Outer black stroke
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, 0, 0);

    // Middle orange stroke
    ctx.strokeStyle = '#FF8800';
    ctx.lineWidth = 2;
    ctx.strokeText(text, 0, 0);

    // Golden gradient fill
    const critGradient = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
    critGradient.addColorStop(0, '#FFFF00');
    critGradient.addColorStop(0.5, '#FFD700');
    critGradient.addColorStop(1, '#FF8800');
    ctx.fillStyle = critGradient;
    ctx.fillText(text, 0, 0);

    // Inner white highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
    ctx.font = `bold ${fontSize - 2}px Arial`;
    ctx.fillText(text, 0, -1);
  } else {
    // Normal damage: red with slight glow
    ctx.shadowColor = 'rgba(255, 50, 50, 0.5)';
    ctx.shadowBlur = 8;

    // Black outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(text, 0, 0);

    // Red gradient fill
    const dmgGradient = ctx.createLinearGradient(0, -fontSize / 2, 0, fontSize / 2);
    dmgGradient.addColorStop(0, '#FF8888');
    dmgGradient.addColorStop(0.5, '#FF4444');
    dmgGradient.addColorStop(1, '#CC0000');
    ctx.fillStyle = dmgGradient;
    ctx.fillText(text, 0, 0);
  }

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

// ============ DASH EFFECT ============
// Ghost trail effect for dash

export interface DashGhost {
  x: number;
  y: number;
  alpha: number;
  facingRight: boolean;
}

export const drawDashEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  progress: number // 0~1
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Speed lines
  const lineCount = 6;
  const lineLength = 40 + progress * 30;

  ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.6})`;
  ctx.lineWidth = 2;

  let angle = 0;
  switch (direction) {
    case 'right': angle = Math.PI; break;
    case 'left': angle = 0; break;
    case 'up': angle = Math.PI / 2; break;
    case 'down': angle = -Math.PI / 2; break;
  }

  for (let i = 0; i < lineCount; i++) {
    const spread = (i - lineCount / 2) * 8;
    const offsetX = Math.cos(angle + Math.PI / 2) * spread;
    const offsetY = Math.sin(angle + Math.PI / 2) * spread;

    ctx.beginPath();
    ctx.moveTo(x + offsetX, y + offsetY);
    ctx.lineTo(
      x + offsetX + Math.cos(angle) * lineLength,
      y + offsetY + Math.sin(angle) * lineLength
    );
    ctx.stroke();
  }

  // Center burst
  const burstRadius = 15 + progress * 20;
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, burstRadius);
  gradient.addColorStop(0, `rgba(150, 220, 255, ${alpha * 0.4})`);
  gradient.addColorStop(1, `rgba(100, 180, 255, 0)`);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, burstRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Draw dash ghost (afterimage)
export const drawDashGhost = (
  ctx: CanvasRenderingContext2D,
  ghost: DashGhost,
  playerSize: number = 30
) => {
  ctx.save();
  ctx.globalAlpha = ghost.alpha * 0.5;

  // Simple ghost silhouette
  ctx.fillStyle = `rgba(100, 200, 255, ${ghost.alpha})`;
  ctx.beginPath();
  ctx.ellipse(ghost.x, ghost.y, playerSize * 0.4, playerSize * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// ============ CRITICAL HIT EFFECT ============

export const drawCriticalEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress * 1.2);
  const size = 40 + progress * 70;

  // Multiple expanding rings
  for (let ring = 0; ring < 3; ring++) {
    const ringProgress = (progress + ring * 0.1) % 1;
    const ringSize = size * (0.5 + ringProgress * 0.8);
    const ringAlpha = alpha * (1 - ringProgress);

    ctx.strokeStyle = `rgba(255, ${200 - ring * 30}, ${50 - ring * 20}, ${ringAlpha * 0.6})`;
    ctx.lineWidth = 3 - ring;
    ctx.beginPath();
    ctx.arc(x, y, ringSize, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Dynamic star burst (more dramatic)
  ctx.shadowColor = 'rgba(255, 200, 0, 0.9)';
  ctx.shadowBlur = 20;

  const points = 12;
  const rotation = progress * Math.PI * 0.5;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Outer star shape
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points;
    const innerRadius = size * 0.35;
    const outerRadius = size * (0.9 + Math.sin(progress * Math.PI * 4 + i) * 0.1);

    if (i === 0) {
      ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    } else {
      ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }

    const nextAngle = angle + Math.PI / points;
    ctx.lineTo(Math.cos(nextAngle) * innerRadius, Math.sin(nextAngle) * innerRadius);
  }
  ctx.closePath();

  // Star gradient fill
  const starGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  starGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  starGradient.addColorStop(0.3, `rgba(255, 255, 150, ${alpha * 0.9})`);
  starGradient.addColorStop(0.6, `rgba(255, 200, 50, ${alpha * 0.6})`);
  starGradient.addColorStop(1, `rgba(255, 150, 0, 0)`);

  ctx.fillStyle = starGradient;
  ctx.fill();

  // Star outline
  ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.rotate(-rotation);
  ctx.translate(-x, -y);

  // Inner core flash
  const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 0.4);
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  coreGradient.addColorStop(0.5, `rgba(255, 255, 200, ${alpha * 0.8})`);
  coreGradient.addColorStop(1, `rgba(255, 220, 100, 0)`);

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Flying spark particles
  ctx.shadowBlur = 0;
  for (let i = 0; i < 16; i++) {
    const sparkAngle = (Math.PI * 2 * i) / 16 + progress * 3;
    const sparkDist = size * (0.4 + progress * 0.9);
    const sparkX = x + Math.cos(sparkAngle) * sparkDist;
    const sparkY = y + Math.sin(sparkAngle) * sparkDist;
    const sparkSize = 4 * (1 - progress * 0.7);
    const sparkAlpha = alpha * (i % 2 === 0 ? 1 : 0.6);

    const sparkColor = i % 3 === 0 ? `rgba(255, 255, 255, ${sparkAlpha})`
      : i % 3 === 1 ? `rgba(255, 220, 100, ${sparkAlpha})`
      : `rgba(255, 180, 50, ${sparkAlpha})`;

    ctx.fillStyle = sparkColor;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // "CRITICAL!" text with dramatic styling
  if (progress < 0.4) {
    const textAlpha = alpha * (1 - progress / 0.4);
    const textScale = 1 + (0.3 * (1 - progress / 0.4));
    const textY = y - size - 15;

    ctx.save();
    ctx.translate(x, textY);
    ctx.scale(textScale, textScale);

    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow
    ctx.shadowColor = 'rgba(255, 150, 0, 1)';
    ctx.shadowBlur = 10;

    // Outline
    ctx.strokeStyle = `rgba(0, 0, 0, ${textAlpha})`;
    ctx.lineWidth = 4;
    ctx.strokeText('CRITICAL!', 0, 0);

    // Orange outline
    ctx.strokeStyle = `rgba(255, 100, 0, ${textAlpha})`;
    ctx.lineWidth = 2;
    ctx.strokeText('CRITICAL!', 0, 0);

    // Golden gradient text
    const textGradient = ctx.createLinearGradient(0, -10, 0, 10);
    textGradient.addColorStop(0, '#FFFF00');
    textGradient.addColorStop(0.5, '#FFD700');
    textGradient.addColorStop(1, '#FF8800');
    ctx.fillStyle = textGradient;
    ctx.fillText('CRITICAL!', 0, 0);

    ctx.restore();
  }

  ctx.restore();
};

// Create critical hit particles (golden sparks)
export const createCriticalParticles = (
  x: number,
  y: number,
  count: number = 12
): Particle[] => {
  const particles: Particle[] = [];
  const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FFFFFF'];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 80;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      life: 0.8,
      maxLife: 0.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
    });
  }

  return particles;
};

// ============ HARVEST VISUAL EFFECT ============

export const drawHarvestProgressEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number, // 0~1
  color: string
) => {
  ctx.save();

  // Swirling particles around resource
  const particleCount = 6;
  const radius = 25;
  const time = Date.now() / 200;

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + time;
    const px = x + Math.cos(angle) * radius * (0.5 + progress * 0.5);
    const py = y + Math.sin(angle) * radius * (0.5 + progress * 0.5);
    const size = 3 + progress * 3;

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6 + Math.sin(time + i) * 0.3;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Progress ring
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.stroke();

  // Background ring
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
  ctx.stroke();

  // Gathering spark effect at the tip of progress
  if (progress > 0.1) {
    const sparkAngle = -Math.PI / 2 + Math.PI * 2 * progress;
    const sparkX = x + Math.cos(sparkAngle) * (radius + 8);
    const sparkY = y + Math.sin(sparkAngle) * (radius + 8);

    ctx.globalAlpha = 0.8 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Tool swing animation particles
export const createToolSwingParticles = (
  x: number,
  y: number,
  toolColor: string
): Particle[] => {
  const particles: Particle[] = [];

  for (let i = 0; i < 5; i++) {
    const angle = Math.random() * Math.PI - Math.PI / 2;
    const speed = 30 + Math.random() * 40;

    particles.push({
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4,
      maxLife: 0.4,
      color: toolColor,
      size: 2 + Math.random() * 2,
    });
  }

  return particles;
};

// ============ SKILL EFFECTS ============

export interface SkillEffect {
  type: string;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  progress: number;
  duration: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  color?: string;
}

// Draw skill effect based on type
export const drawSkillEffect = (
  ctx: CanvasRenderingContext2D,
  effect: SkillEffect
) => {
  const progress = effect.progress / effect.duration;

  switch (effect.type) {
    case 'fireball':
      drawFireballEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'magic_bolt':
    case 'mage_attack':
      drawMagicBoltEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress, effect.color);
      break;
    case 'ice_bolt':
      drawIceBoltEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'meteor':
      drawMeteorEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'whirlwind':
      drawWhirlwindEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'arrow':
    case 'double_arrow':
      drawArrowEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'arrow_rain':
      drawArrowRainEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'heal':
      drawHealEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'buff_attack':
    case 'buff_defense':
    case 'buff_evasion':
    case 'buff_siege':
      drawBuffEffect(ctx, effect.x, effect.y, progress, effect.type);
      break;
    case 'poison':
    case 'curse':
      drawPoisonEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'shadow':
      drawShadowEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'power_strike':
    case 'final_cut':
    case 'backstab':
    case 'assassinate':
      drawPowerStrikeEffect(ctx, effect.x, effect.y, effect.direction || 'right', progress);
      break;
    case 'sword_aura':
      drawSwordAuraEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'blade_storm':
    case 'pole_dance':
      drawBladeStormEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'ground_slam':
      drawGroundSlamEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'spear_thrust':
    case 'dragon_spear':
      drawSpearThrustEffect(ctx, effect.x, effect.y, effect.direction || 'right', progress);
      break;
    case 'bullet':
      drawBulletEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'explosion':
      drawExplosionEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'laser_beam':
      drawLaserBeamEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'snipe_arrow':
    case 'piercing_bolt':
      drawSnipeArrowEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'phoenix_arrow':
      drawPhoenixArrowEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'fire_storm':
      drawFireStormEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'blizzard':
      drawBlizzardEffect(ctx, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'chain_lightning':
      drawChainLightningEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'divine_light':
      drawDivineLightEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'sanctuary':
      drawSanctuaryEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'dark_orb':
      drawDarkOrbEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'soul_drain':
      drawSoulDrainEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'combo_fist':
    case 'uppercut':
    case 'fist_of_fury':
      drawFistEffect(ctx, effect.x, effect.y, effect.direction || 'right', progress);
      break;
    case 'blade_fury':
    case 'phantom_blade':
      drawBladeFuryEffect(ctx, effect.x, effect.y, progress);
      break;
    case 'shuriken':
    case 'shuriken_storm':
      drawShurikenEffect(ctx, effect.x, effect.y, effect.targetX || effect.x, effect.targetY || effect.y, progress);
      break;
    case 'shadow_clone':
      drawShadowCloneEffect(ctx, effect.x, effect.y, progress);
      break;
    default:
      // Default slash effect
      drawSlashEffect(ctx, effect.x, effect.y, effect.direction || 'right', progress);
  }
};

// Enhanced Fireball effect with flames and ember trail
const drawFireballEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const size = 22;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();

  // Ember trail particles
  for (let i = 0; i < 15; i++) {
    const trailProgress = Math.max(0, progress - i * 0.02);
    const trailX = startX + (targetX - startX) * trailProgress;
    const trailY = startY + (targetY - startY) * trailProgress;
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20 - i * 2;
    const trailAlpha = alpha * (1 - i / 15);
    const emberSize = 4 - i * 0.2;

    const emberColors = ['rgba(255, 100, 0,', 'rgba(255, 200, 50,', 'rgba(255, 150, 30,'];
    ctx.fillStyle = emberColors[i % 3] + `${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(trailX + offsetX, trailY + offsetY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer flame glow
  ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
  ctx.shadowBlur = 25;

  const outerGlow = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, size * 2.5);
  outerGlow.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
  outerGlow.addColorStop(0.3, `rgba(255, 150, 0, ${alpha * 0.8})`);
  outerGlow.addColorStop(0.6, `rgba(255, 50, 0, ${alpha * 0.4})`);
  outerGlow.addColorStop(1, 'rgba(200, 0, 0, 0)');

  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(currentX, currentY, size * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Flickering flame shapes
  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle + Math.PI);

  for (let i = 0; i < 6; i++) {
    const flameAngle = (Math.PI * 2 * i) / 6 + progress * 10;
    const flameLength = size * (0.8 + Math.sin(progress * 20 + i) * 0.3);
    const flameX = Math.cos(flameAngle) * size * 0.5;
    const flameY = Math.sin(flameAngle) * size * 0.5;

    ctx.fillStyle = `rgba(255, ${150 + Math.floor(Math.random() * 50)}, 0, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.quadraticCurveTo(
      flameX + Math.cos(flameAngle) * flameLength * 0.5 + (Math.random() - 0.5) * 10,
      flameY + Math.sin(flameAngle) * flameLength * 0.5,
      flameX + Math.cos(flameAngle) * flameLength,
      flameY + Math.sin(flameAngle) * flameLength
    );
    ctx.quadraticCurveTo(
      flameX + Math.cos(flameAngle) * flameLength * 0.5 - (Math.random() - 0.5) * 10,
      flameY + Math.sin(flameAngle) * flameLength * 0.5,
      flameX, flameY
    );
    ctx.fill();
  }
  ctx.restore();

  // Hot core
  const coreGradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, size * 0.7);
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  coreGradient.addColorStop(0.4, `rgba(255, 255, 150, ${alpha})`);
  coreGradient.addColorStop(1, `rgba(255, 200, 50, ${alpha * 0.8})`);

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(currentX, currentY, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Magic bolt effect for basic mage attacks
const drawMagicBoltEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number,
  color: string = '#8080FF'
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();

  // Magic trail with sparkles
  for (let i = 0; i < 12; i++) {
    const trailProgress = Math.max(0, progress - i * 0.015);
    const trailX = startX + (targetX - startX) * trailProgress;
    const trailY = startY + (targetY - startY) * trailProgress;
    const spiral = i * 0.5 + progress * 8;
    const offsetX = Math.cos(spiral) * (8 - i * 0.5);
    const offsetY = Math.sin(spiral) * (8 - i * 0.5);
    const trailAlpha = alpha * (1 - i / 12);
    const sparkleSize = 5 - i * 0.3;

    ctx.fillStyle = `rgba(200, 200, 255, ${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(trailX + offsetX, trailY + offsetY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Outer glow
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;

  const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
  outerGlow.addColorStop(0, `rgba(150, 150, 255, ${alpha})`);
  outerGlow.addColorStop(0.4, `rgba(100, 100, 255, ${alpha * 0.6})`);
  outerGlow.addColorStop(1, 'rgba(50, 50, 200, 0)');

  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();

  // Magic core with pulsing
  const pulseSize = 12 + Math.sin(progress * 30) * 3;
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
  coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  coreGradient.addColorStop(0.3, `rgba(200, 200, 255, ${alpha})`);
  coreGradient.addColorStop(1, `rgba(100, 100, 255, ${alpha * 0.5})`);

  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
  ctx.fill();

  // Inner stars/sparkles
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  for (let i = 0; i < 4; i++) {
    const starAngle = (Math.PI * 2 * i) / 4 + progress * 5;
    const starX = Math.cos(starAngle) * 6;
    const starY = Math.sin(starAngle) * 6;
    ctx.beginPath();
    ctx.arc(starX, starY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Ice bolt effect
const drawIceBoltEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const size = 15;
  const alpha = Math.max(0, 1 - progress);

  ctx.save();

  // Glow
  const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, size * 2);
  gradient.addColorStop(0, `rgba(200, 230, 255, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(100, 180, 255, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(50, 100, 200, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(currentX, currentY, size * 2, 0, Math.PI * 2);
  ctx.fill();

  // Ice crystal
  ctx.strokeStyle = `rgba(200, 230, 255, ${alpha})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(
      currentX + Math.cos(angle) * size,
      currentY + Math.sin(angle) * size
    );
    ctx.stroke();
  }

  ctx.restore();
};

// Meteor effect
const drawMeteorEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const fallProgress = Math.min(1, progress * 2);
  const impactProgress = Math.max(0, (progress - 0.5) * 2);

  // Meteor falling
  if (progress < 0.5) {
    const meteorY = y - 100 + 100 * fallProgress;
    const size = 25;

    // Trail
    ctx.fillStyle = `rgba(255, 150, 50, ${0.5 - progress})`;
    ctx.beginPath();
    ctx.moveTo(x, meteorY);
    ctx.lineTo(x - 10, meteorY - 50);
    ctx.lineTo(x + 10, meteorY - 50);
    ctx.closePath();
    ctx.fill();

    // Meteor
    const gradient = ctx.createRadialGradient(x, meteorY, 0, x, meteorY, size);
    gradient.addColorStop(0, '#FFFF80');
    gradient.addColorStop(0.5, '#FF6600');
    gradient.addColorStop(1, '#990000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, meteorY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact explosion
  if (progress >= 0.5) {
    const explosionRadius = 80 * impactProgress;
    const alpha = 1 - impactProgress;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, explosionRadius);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.8})`);
    gradient.addColorStop(0.6, `rgba(255, 50, 0, ${alpha * 0.5})`);
    gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, explosionRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Whirlwind effect
const drawWhirlwindEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const rotation = progress * Math.PI * 4;
  const radius = 60 + progress * 20;

  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Spinning slashes
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI * 2 * i) / 4;
    ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, angle, angle + Math.PI * 0.5);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, angle + Math.PI * 0.1, angle + Math.PI * 0.4);
    ctx.stroke();
  }

  ctx.restore();
};

// Enhanced Arrow effect with glowing trail
const drawArrowEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);

  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Glowing trail particles
  for (let i = 0; i < 8; i++) {
    const trailX = -i * 6;
    const trailY = (Math.random() - 0.5) * 4;
    const trailAlpha = alpha * (1 - i / 8);
    ctx.fillStyle = `rgba(255, 200, 100, ${trailAlpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, 3 - i * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Motion blur trail
  const trailGradient = ctx.createLinearGradient(-50, 0, 0, 0);
  trailGradient.addColorStop(0, `rgba(255, 200, 100, 0)`);
  trailGradient.addColorStop(0.5, `rgba(255, 180, 80, ${alpha * 0.4})`);
  trailGradient.addColorStop(1, `rgba(255, 150, 50, ${alpha * 0.7})`);
  ctx.fillStyle = trailGradient;
  ctx.beginPath();
  ctx.moveTo(-50, -3);
  ctx.lineTo(0, -2);
  ctx.lineTo(0, 2);
  ctx.lineTo(-50, 3);
  ctx.closePath();
  ctx.fill();

  // Arrow body with glow
  ctx.shadowColor = 'rgba(255, 200, 100, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = `rgba(139, 90, 40, ${alpha})`;
  ctx.fillRect(-15, -2, 22, 4);

  // Arrowhead with shine
  const headGradient = ctx.createLinearGradient(0, -6, 10, 0);
  headGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  headGradient.addColorStop(0.5, `rgba(220, 220, 230, ${alpha})`);
  headGradient.addColorStop(1, `rgba(180, 180, 190, ${alpha})`);
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(0, -6);
  ctx.lineTo(2, 0);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();

  // Tip sparkle
  if (progress < 0.7) {
    ctx.shadowBlur = 15;
    ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
    ctx.beginPath();
    ctx.arc(12, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Arrow rain effect
const drawArrowRainEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const arrowCount = 12;

  for (let i = 0; i < arrowCount; i++) {
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 100;
    const arrowProgress = (progress + i * 0.05) % 1;
    const arrowY = y + offsetY - 50 + arrowProgress * 80;

    ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
    ctx.fillRect(x + offsetX - 1, arrowY - 10, 2, 15);

    ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x + offsetX, arrowY + 5);
    ctx.lineTo(x + offsetX - 3, arrowY - 2);
    ctx.lineTo(x + offsetX + 3, arrowY - 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// Heal effect
const drawHealEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const floatY = y - progress * 30;

  // Green healing particles rising up
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + progress * Math.PI;
    const radius = 20 + Math.sin(progress * Math.PI * 2) * 10;
    const px = x + Math.cos(angle) * radius;
    const py = floatY + Math.sin(angle) * radius * 0.5;

    ctx.fillStyle = `rgba(100, 255, 100, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central cross
  ctx.strokeStyle = `rgba(150, 255, 150, ${alpha})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 15, floatY);
  ctx.lineTo(x + 15, floatY);
  ctx.moveTo(x, floatY - 15);
  ctx.lineTo(x, floatY + 15);
  ctx.stroke();

  ctx.restore();
};

// Buff effect
const drawBuffEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
  buffType: string
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const colors = {
    buff_attack: '#FF6B6B',
    buff_defense: '#6B8FFF',
    buff_evasion: '#6BFF6B',
    buff_siege: '#FFD700'
  };
  const color = colors[buffType as keyof typeof colors] || '#FFFFFF';

  // Rising particles
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    const radius = 25;
    const py = y - progress * 40;
    const px = x + Math.cos(angle + progress * Math.PI * 2) * radius;
    const ppy = py + Math.sin(angle + progress * Math.PI * 2) * radius * 0.3;

    ctx.fillStyle = color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.beginPath();
    ctx.arc(px, ppy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Aura ring
  ctx.strokeStyle = color.replace(')', `, ${alpha * 0.5})`).replace('rgb', 'rgba');
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, 30 + progress * 10, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

// Poison effect
const drawPoisonEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Poison bubbles
  for (let i = 0; i < 5; i++) {
    const bubbleProgress = (progress + i * 0.2) % 1;
    const offsetX = Math.sin(i * 1.5) * 15;
    const bubbleY = y - bubbleProgress * 40;
    const size = 5 + Math.sin(bubbleProgress * Math.PI) * 3;

    ctx.fillStyle = `rgba(100, 200, 50, ${alpha * (1 - bubbleProgress)})`;
    ctx.beginPath();
    ctx.arc(x + offsetX, bubbleY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Poison cloud
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
  gradient.addColorStop(0, `rgba(100, 200, 50, ${alpha * 0.3})`);
  gradient.addColorStop(1, 'rgba(100, 200, 50, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Shadow effect
const drawShadowEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

  // Shadow burst
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50 * (1 - progress));
  gradient.addColorStop(0, `rgba(50, 0, 100, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(100, 0, 150, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, 50 * (1 - progress), 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Power strike effect
const drawPowerStrikeEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  progress: number
) => {
  ctx.save();
  ctx.translate(x, y);

  let rotation = 0;
  switch (direction) {
    case 'right': rotation = 0; break;
    case 'down': rotation = Math.PI / 2; break;
    case 'left': rotation = Math.PI; break;
    case 'up': rotation = -Math.PI / 2; break;
  }
  ctx.rotate(rotation);

  const alpha = Math.max(0, 1 - progress * 1.2);
  const size = 60 + progress * 30;

  // Large impact slash
  ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(0, 0, size, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.7, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();

  // Sparks
  for (let i = 0; i < 5; i++) {
    const sparkAngle = (Math.random() - 0.5) * Math.PI * 0.6;
    const sparkDist = size * (0.8 + Math.random() * 0.4);
    ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(
      Math.cos(sparkAngle) * sparkDist,
      Math.sin(sparkAngle) * sparkDist,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
};

// Sword aura effect
const drawSwordAuraEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Crescent blade shape
  ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 25, -Math.PI * 0.6, Math.PI * 0.6);
  ctx.stroke();

  // Inner glow
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 20, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();

  // Trail
  ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(-30, -15);
  ctx.lineTo(0, 0);
  ctx.lineTo(-30, 15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

// Blade storm effect
const drawBladeStormEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const rotation = progress * Math.PI * 6;
  const bladeCount = 6;

  ctx.translate(x, y);
  ctx.rotate(rotation);

  for (let i = 0; i < bladeCount; i++) {
    const angle = (Math.PI * 2 * i) / bladeCount;
    const dist = 40 + Math.sin(progress * Math.PI * 4) * 10;

    ctx.save();
    ctx.rotate(angle);
    ctx.translate(dist, 0);
    ctx.rotate(Math.PI / 4);

    // Blade
    ctx.fillStyle = `rgba(200, 200, 255, ${alpha})`;
    ctx.fillRect(-3, -20, 6, 40);

    // Glow
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(-3, -20, 6, 40);

    ctx.restore();
  }

  ctx.restore();
};

// Ground slam effect
const drawGroundSlamEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Shockwave rings
  for (let i = 0; i < 3; i++) {
    const ringProgress = (progress + i * 0.15) % 1;
    const radius = ringProgress * 80;
    const ringAlpha = alpha * (1 - ringProgress);

    ctx.strokeStyle = `rgba(150, 100, 50, ${ringAlpha})`;
    ctx.lineWidth = 4 * (1 - ringProgress);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ground cracks
  ctx.strokeStyle = `rgba(100, 80, 40, ${alpha})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const length = 30 + progress * 40;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Dust particles
  for (let i = 0; i < 10; i++) {
    const pAngle = Math.random() * Math.PI * 2;
    const pDist = progress * 60 * Math.random();
    ctx.fillStyle = `rgba(139, 119, 101, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(pAngle) * pDist,
      y + Math.sin(pAngle) * pDist - progress * 20,
      3 + Math.random() * 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
};

// Spear thrust effect
const drawSpearThrustEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  progress: number
) => {
  ctx.save();
  ctx.translate(x, y);

  let rotation = 0;
  switch (direction) {
    case 'right': rotation = 0; break;
    case 'down': rotation = Math.PI / 2; break;
    case 'left': rotation = Math.PI; break;
    case 'up': rotation = -Math.PI / 2; break;
  }
  ctx.rotate(rotation);

  const alpha = Math.max(0, 1 - progress);
  const thrustDist = progress * 80;

  // Thrust line
  ctx.strokeStyle = `rgba(200, 180, 150, ${alpha})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(thrustDist + 40, 0);
  ctx.stroke();

  // Tip
  ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.beginPath();
  ctx.moveTo(thrustDist + 50, 0);
  ctx.lineTo(thrustDist + 30, -8);
  ctx.lineTo(thrustDist + 30, 8);
  ctx.closePath();
  ctx.fill();

  // Motion blur
  ctx.fillStyle = `rgba(200, 200, 255, ${alpha * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(thrustDist + 30, -2);
  ctx.lineTo(thrustDist + 30, 2);
  ctx.lineTo(0, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
};

// Enhanced Bullet effect with muzzle flash and smoke trail
const drawBulletEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Smoke trail particles
  for (let i = 0; i < 12; i++) {
    const trailX = -i * 5;
    const trailY = (Math.sin(i * 0.8) * 3) + (Math.random() - 0.5) * 2;
    const trailAlpha = alpha * (1 - i / 12) * 0.4;
    const size = 4 - i * 0.2;
    ctx.fillStyle = `rgba(180, 180, 180, ${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Speed lines
  ctx.strokeStyle = `rgba(255, 200, 50, ${alpha * 0.6})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const lineY = (i - 1) * 4;
    ctx.beginPath();
    ctx.moveTo(-5, lineY);
    ctx.lineTo(-40 - Math.random() * 20, lineY);
    ctx.stroke();
  }

  // Glowing bullet core
  ctx.shadowColor = 'rgba(255, 200, 50, 0.9)';
  ctx.shadowBlur = 12;

  const bulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
  bulletGradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
  bulletGradient.addColorStop(0.4, `rgba(255, 220, 100, ${alpha})`);
  bulletGradient.addColorStop(1, `rgba(255, 150, 50, ${alpha * 0.5})`);

  ctx.fillStyle = bulletGradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner shine
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(2, -1, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle flash (at start) - much more dramatic
  if (progress < 0.15) {
    ctx.restore();
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    const flashAlpha = (1 - progress / 0.15);
    const flashSize = 25 * flashAlpha;

    // Outer flash
    const flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, flashSize);
    flashGradient.addColorStop(0, `rgba(255, 255, 200, ${flashAlpha})`);
    flashGradient.addColorStop(0.3, `rgba(255, 200, 100, ${flashAlpha * 0.8})`);
    flashGradient.addColorStop(0.6, `rgba(255, 100, 50, ${flashAlpha * 0.4})`);
    flashGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = flashGradient;
    ctx.beginPath();
    ctx.arc(10, 0, flashSize, 0, Math.PI * 2);
    ctx.fill();

    // Flash rays
    for (let i = 0; i < 6; i++) {
      const rayAngle = (i - 3) * 0.3;
      ctx.strokeStyle = `rgba(255, 255, 150, ${flashAlpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(15 + Math.cos(rayAngle) * flashSize * 1.5, Math.sin(rayAngle) * flashSize);
      ctx.stroke();
    }
  }

  ctx.restore();
};

// Explosion effect
const drawExplosionEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const radius = progress * 60;

  // Main explosion
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
  gradient.addColorStop(0.3, `rgba(255, 150, 50, ${alpha * 0.8})`);
  gradient.addColorStop(0.6, `rgba(255, 50, 0, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(100, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Sparks
  for (let i = 0; i < 8; i++) {
    const sparkAngle = (Math.PI * 2 * i) / 8;
    const sparkDist = radius * 1.2;
    ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(sparkAngle) * sparkDist,
      y + Math.sin(sparkAngle) * sparkDist,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
};

// Laser beam effect
const drawLaserBeamEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const beamWidth = progress < 0.2 ? progress * 5 * 30 : 30 * (1 - (progress - 0.2) / 0.8);
  const alpha = progress < 0.2 ? 1 : 1 - (progress - 0.2) / 0.8;

  // Beam from sky
  const gradient = ctx.createLinearGradient(x, y - 200, x, y);
  gradient.addColorStop(0, `rgba(255, 50, 50, 0)`);
  gradient.addColorStop(0.5, `rgba(255, 100, 100, ${alpha * 0.8})`);
  gradient.addColorStop(1, `rgba(255, 200, 200, ${alpha})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(x - beamWidth / 2, y - 200, beamWidth, 200);

  // Impact circle
  const impactGradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
  impactGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  impactGradient.addColorStop(0.3, `rgba(255, 100, 100, ${alpha * 0.8})`);
  impactGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

  ctx.fillStyle = impactGradient;
  ctx.beginPath();
  ctx.arc(x, y, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Snipe arrow effect
const drawSnipeArrowEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Glowing arrow
  ctx.shadowColor = 'rgba(255, 255, 100, 0.8)';
  ctx.shadowBlur = 10;

  ctx.fillStyle = `rgba(255, 220, 100, ${alpha})`;
  ctx.fillRect(-20, -2, 25, 4);

  // Sharp tip
  ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(0, -6);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();

  // Long trail
  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(255, 255, 150, ${alpha * 0.3})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(-60, 0);
  ctx.stroke();

  ctx.restore();
};

// Phoenix arrow effect
const drawPhoenixArrowEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const angle = Math.atan2(targetY - startY, targetX - startX);

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(angle);

  // Fire trail
  for (let i = 0; i < 10; i++) {
    const trailX = -i * 8;
    const trailY = Math.sin(i + progress * 10) * 5;
    const size = 8 - i * 0.5;

    ctx.fillStyle = `rgba(255, ${150 + i * 10}, 50, ${alpha * (1 - i / 10)})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phoenix head
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
  gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha})`);
  gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Fire storm effect
const drawFireStormEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const rotation = progress * Math.PI * 4;

  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Fire pillars
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const dist = 50 + Math.sin(progress * Math.PI * 4 + i) * 20;
    const pillarX = Math.cos(angle) * dist;
    const pillarY = Math.sin(angle) * dist;

    const gradient = ctx.createLinearGradient(pillarX, pillarY + 30, pillarX, pillarY - 30);
    gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
    gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha})`);
    gradient.addColorStop(1, `rgba(255, 255, 200, ${alpha})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(pillarX - 8, pillarY - 30, 16, 60);
  }

  ctx.restore();
};

// Blizzard effect
const drawBlizzardEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const time = progress * 10;

  // Ice area
  ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y, 80, 0, Math.PI * 2);
  ctx.fill();

  // Snowflakes
  for (let i = 0; i < 20; i++) {
    const snowX = x + (Math.random() - 0.5) * 150;
    const snowY = y + (Math.random() - 0.5) * 150 - progress * 50;
    const size = 3 + Math.random() * 4;
    const snowAlpha = alpha * Math.random();

    ctx.fillStyle = `rgba(255, 255, 255, ${snowAlpha})`;
    ctx.beginPath();
    ctx.arc(snowX, snowY, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ice crystals
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + time;
    const dist = 40 + Math.sin(time + i) * 20;
    const cx = x + Math.cos(angle) * dist;
    const cy = y + Math.sin(angle) * dist;

    ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
    ctx.lineWidth = 2;
    for (let j = 0; j < 6; j++) {
      const crystalAngle = (Math.PI * 2 * j) / 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(crystalAngle) * 10,
        cy + Math.sin(crystalAngle) * 10
      );
      ctx.stroke();
    }
  }

  ctx.restore();
};

// Chain lightning effect
const drawChainLightningEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Lightning bolt
  ctx.strokeStyle = `rgba(150, 200, 255, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(startX, startY);

  const segments = 8;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const midX = startX + (targetX - startX) * t;
    const midY = startY + (targetY - startY) * t;
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;
    ctx.lineTo(midX + offsetX, midY + offsetY);
  }
  ctx.lineTo(targetX, targetY);
  ctx.stroke();

  // Glow at target
  const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 30);
  gradient.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
  gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');

  ctx.shadowBlur = 0;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Divine light effect
const drawDivineLightEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Light beam from above
  const beamWidth = 40;
  const gradient = ctx.createLinearGradient(x, y - 150, x, y);
  gradient.addColorStop(0, 'rgba(255, 255, 200, 0)');
  gradient.addColorStop(0.5, `rgba(255, 255, 220, ${alpha * 0.5})`);
  gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(x - beamWidth / 2, y - 150, beamWidth, 150);

  // Holy cross at center
  ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 20, y);
  ctx.lineTo(x + 20, y);
  ctx.moveTo(x, y - 25);
  ctx.lineTo(x, y + 15);
  ctx.stroke();

  // Radiating light
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 25, y + Math.sin(angle) * 25);
    ctx.lineTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
    ctx.stroke();
  }

  ctx.restore();
};

// Sanctuary effect
const drawSanctuaryEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const radius = 80;

  // Holy circle
  ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 255, 220, ${alpha * 0.3})`);
  gradient.addColorStop(0.7, `rgba(255, 255, 200, ${alpha * 0.1})`);
  gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Floating particles
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + progress * Math.PI;
    const particleDist = radius * 0.7;
    const particleY = y + Math.sin(angle) * particleDist - progress * 20;
    const particleX = x + Math.cos(angle) * particleDist;

    ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

// Dark orb effect
const drawDarkOrbEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const size = 20;

  ctx.save();

  // Dark trail
  for (let i = 0; i < 5; i++) {
    const trailProgress = Math.max(0, progress - i * 0.05);
    const trailX = startX + (targetX - startX) * trailProgress;
    const trailY = startY + (targetY - startY) * trailProgress;
    const trailAlpha = alpha * (1 - i * 0.2);
    const trailSize = size * (1 - i * 0.15);

    ctx.fillStyle = `rgba(80, 0, 120, ${trailAlpha})`;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main orb
  const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, size);
  gradient.addColorStop(0, `rgba(150, 50, 200, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(80, 0, 120, ${alpha})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(currentX, currentY, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Soul drain effect
const drawSoulDrainEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);

  // Souls flowing from target to caster
  for (let i = 0; i < 8; i++) {
    const soulProgress = (progress + i * 0.1) % 1;
    const soulX = targetX + (startX - targetX) * soulProgress;
    const soulY = targetY + (startY - targetY) * soulProgress + Math.sin(soulProgress * Math.PI * 4) * 10;
    const soulAlpha = alpha * (1 - Math.abs(soulProgress - 0.5) * 2);

    ctx.fillStyle = `rgba(100, 200, 150, ${soulAlpha})`;
    ctx.beginPath();
    ctx.arc(soulX, soulY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark aura at target
  const gradient = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, 40);
  gradient.addColorStop(0, `rgba(80, 0, 80, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(targetX, targetY, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Fist effect
const drawFistEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: 'up' | 'down' | 'left' | 'right',
  progress: number
) => {
  ctx.save();
  ctx.translate(x, y);

  let rotation = 0;
  switch (direction) {
    case 'right': rotation = 0; break;
    case 'down': rotation = Math.PI / 2; break;
    case 'left': rotation = Math.PI; break;
    case 'up': rotation = -Math.PI / 2; break;
  }
  ctx.rotate(rotation);

  const alpha = Math.max(0, 1 - progress);
  const punchDist = progress * 40;

  // Impact lines
  for (let i = 0; i < 5; i++) {
    const lineAngle = (i - 2) * 0.2;
    ctx.strokeStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(punchDist + 20, Math.sin(lineAngle) * 20);
    ctx.lineTo(punchDist + 40, Math.sin(lineAngle) * 35);
    ctx.stroke();
  }

  // Impact burst
  const gradient = ctx.createRadialGradient(punchDist + 30, 0, 0, punchDist + 30, 0, 25);
  gradient.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
  gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.5})`);
  gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(punchDist + 30, 0, 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Blade fury effect
const drawBladeFuryEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = Math.max(0, 1 - progress);
  const rotation = progress * Math.PI * 8;

  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Multiple slashes
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6;
    ctx.save();
    ctx.rotate(angle);

    ctx.strokeStyle = `rgba(200, 200, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, 35, -Math.PI * 0.3, Math.PI * 0.3);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
};

// Shuriken effect
const drawShurikenEffect = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  progress: number
) => {
  const currentX = startX + (targetX - startX) * progress;
  const currentY = startY + (targetY - startY) * progress;
  const alpha = Math.max(0, 1 - progress);
  const rotation = progress * Math.PI * 8;

  ctx.save();
  ctx.translate(currentX, currentY);
  ctx.rotate(rotation);

  // Shuriken shape
  ctx.fillStyle = `rgba(150, 150, 150, ${alpha})`;
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 4);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -3);
    ctx.lineTo(15, 0);
    ctx.lineTo(10, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Center
  ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

// Shadow clone effect
const drawShadowCloneEffect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number
) => {
  ctx.save();

  const alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

  // Multiple shadow copies
  const clonePositions = [
    { x: x - 30, y: y - 20 },
    { x: x + 30, y: y - 20 },
    { x: x, y: y + 25 }
  ];

  clonePositions.forEach((pos, i) => {
    const cloneAlpha = alpha * (0.3 + i * 0.1);

    // Shadow figure
    ctx.fillStyle = `rgba(50, 0, 80, ${cloneAlpha})`;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 15, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing edge
    ctx.strokeStyle = `rgba(150, 50, 200, ${cloneAlpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y, 15, 25, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  ctx.restore();
};

// Update skill effects
export const updateSkillEffects = (
  effects: SkillEffect[],
  deltaTime: number
): SkillEffect[] => {
  return effects
    .map((effect) => ({
      ...effect,
      progress: effect.progress + deltaTime
    }))
    .filter((effect) => effect.progress < effect.duration);
};

// Create skill effect
export const createSkillEffect = (
  type: string,
  x: number,
  y: number,
  targetX?: number,
  targetY?: number,
  direction?: 'up' | 'down' | 'left' | 'right',
  duration: number = 500
): SkillEffect => ({
  type,
  x,
  y,
  targetX,
  targetY,
  progress: 0,
  duration,
  direction
});
