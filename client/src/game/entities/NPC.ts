export type NPCType = 'quest' | 'shop' | 'job' | 'fishing' | 'cooking' | 'bank' | 'inn' | 'info';

export interface NPCData {
  id: string;
  name: string;
  nameKo: string;
  type: NPCType;
  x: number;
  y: number;
  dialogue: {
    greeting: string;
    quest_available?: string;
    quest_in_progress?: string;
    quest_complete?: string;
    buy?: string;
    sell?: string;
    job_available?: string;
    job_not_ready?: string;
    info?: string;
    inn_rest?: string;
    bank_deposit?: string;
    bank_withdraw?: string;
    fishing_tip?: string;
    cooking_recipe?: string;
  };
  quests?: string[];
  shop?: {
    items: string[];
  };
}

export class NPC {
  id: string;
  name: string;
  nameKo: string;
  type: NPCType;
  x: number;
  y: number;
  dialogue: NPCData['dialogue'];
  quests?: string[];
  shop?: { items: string[] };

  // Rendering
  private animFrame: number = 0;
  private animTimer: number = 0;

  // Interaction
  interactionRadius: number = 50;
  isHighlighted: boolean = false;

  constructor(data: NPCData) {
    this.id = data.id;
    this.name = data.name;
    this.nameKo = data.nameKo;
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.dialogue = data.dialogue;
    this.quests = data.quests;
    this.shop = data.shop;
  }

  update(deltaTime: number): void {
    // Simple idle animation
    this.animTimer += deltaTime;
    if (this.animTimer > 500) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;

    // Draw NPC body
    ctx.save();

    // Highlight if player is near
    if (this.isHighlighted) {
      ctx.shadowColor = '#ff0';
      ctx.shadowBlur = 15;
    }

    // Different colors based on NPC type
    const colors: Record<NPCType, string> = {
      quest: '#f0c040',
      shop: '#40c0f0',
      job: '#c040f0',
      fishing: '#4FC3F7',
      cooking: '#FF9800',
      bank: '#FFD700',
      inn: '#8BC34A',
      info: '#9E9E9E',
    };
    const color = colors[this.type] || '#FFFFFF';

    // Body (simple humanoid shape)
    ctx.fillStyle = color;

    // Head
    ctx.beginPath();
    ctx.arc(screenX, screenY - 25, 12, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillRect(screenX - 10, screenY - 13, 20, 25);

    // Arms (simple animation)
    const armOffset = this.animFrame === 0 ? 0 : 2;
    ctx.fillRect(screenX - 15, screenY - 10 + armOffset, 5, 15);
    ctx.fillRect(screenX + 10, screenY - 10 - armOffset, 5, 15);

    // Legs
    ctx.fillRect(screenX - 8, screenY + 12, 6, 12);
    ctx.fillRect(screenX + 2, screenY + 12, 6, 12);

    // Draw type indicator
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';

    let icon = '';
    switch (this.type) {
      case 'quest':
        icon = '!';
        break;
      case 'shop':
        icon = '$';
        break;
      case 'job':
        icon = '★';
        break;
      case 'fishing':
        icon = '🎣';
        break;
      case 'cooking':
        icon = '🍳';
        break;
      case 'bank':
        icon = '🏦';
        break;
      case 'inn':
        icon = '🏠';
        break;
      case 'info':
        icon = '?';
        break;
    }

    // Floating indicator
    const bobOffset = Math.sin(Date.now() / 300) * 3;
    ctx.fillText(icon, screenX, screenY - 45 + bobOffset);

    // Draw name
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.nameKo, screenX, screenY + 35);

    ctx.restore();
  }

  // Check if player is within interaction range
  isInRange(playerX: number, playerY: number): boolean {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.interactionRadius;
  }

  // Get appropriate dialogue based on state
  getDialogue(hasAvailableQuest: boolean, hasQuestInProgress: boolean, hasCompletableQuest: boolean): string {
    if (this.type === 'quest') {
      if (hasCompletableQuest) {
        return this.dialogue.quest_complete || this.dialogue.greeting;
      }
      if (hasQuestInProgress) {
        return this.dialogue.quest_in_progress || this.dialogue.greeting;
      }
      if (hasAvailableQuest) {
        return this.dialogue.quest_available || this.dialogue.greeting;
      }
    }
    return this.dialogue.greeting;
  }
}
