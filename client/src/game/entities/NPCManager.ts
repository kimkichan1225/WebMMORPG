import { NPC, NPCData } from './NPC';
import npcsData from '../../data/npcs.json';

export interface NPCSpawnData {
  id: string;
  x: number;
  y: number;
}

export class NPCManager {
  private npcs: NPC[] = [];
  private static npcDataCache: Record<string, NPCData> = {};

  constructor() {
    // Cache NPC data from JSON
    if (Object.keys(NPCManager.npcDataCache).length === 0) {
      const data = npcsData.npcs as Record<string, Omit<NPCData, 'x' | 'y'>>;
      Object.entries(data).forEach(([id, npcData]) => {
        NPCManager.npcDataCache[id] = {
          ...npcData,
          x: 0,
          y: 0,
        };
      });
    }
  }

  loadMapNPCs(spawns: NPCSpawnData[]): void {
    this.npcs = [];

    for (const spawn of spawns) {
      const baseData = NPCManager.npcDataCache[spawn.id];
      if (!baseData) {
        console.warn(`NPC data not found for id: ${spawn.id}`);
        continue;
      }

      const npcData: NPCData = {
        ...baseData,
        x: spawn.x,
        y: spawn.y,
      };

      this.npcs.push(new NPC(npcData));
    }
  }

  update(deltaTime: number): void {
    for (const npc of this.npcs) {
      npc.update(deltaTime);
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const npc of this.npcs) {
      npc.render(ctx, cameraX, cameraY);
    }
  }

  // Check if player is in range of any NPC and update highlights
  updatePlayerProximity(playerX: number, playerY: number): void {
    for (const npc of this.npcs) {
      npc.isHighlighted = npc.isInRange(playerX, playerY);
    }
  }

  // Get NPC at position (for interaction)
  getNPCAtPosition(playerX: number, playerY: number): NPC | null {
    for (const npc of this.npcs) {
      if (npc.isInRange(playerX, playerY)) {
        return npc;
      }
    }
    return null;
  }

  // Get all NPCs
  getNPCs(): NPC[] {
    return this.npcs;
  }

  // Get NPC by ID
  getNPCById(id: string): NPC | null {
    return this.npcs.find(npc => npc.id === id) || null;
  }
}
