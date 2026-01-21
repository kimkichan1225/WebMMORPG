import { CONFIG } from '@shared/types';

export class Camera {
  x: number = 0;
  y: number = 0;

  // Map pixel size
  private mapPixelWidth: number;
  private mapPixelHeight: number;

  constructor() {
    this.mapPixelWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
    this.mapPixelHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
  }

  // Update map bounds when map changes
  setMapBounds(widthInTiles: number, heightInTiles: number): void {
    this.mapPixelWidth = widthInTiles * CONFIG.TILE_SIZE;
    this.mapPixelHeight = heightInTiles * CONFIG.TILE_SIZE;
  }

  follow(targetX: number, targetY: number): void {
    // Center camera on player
    this.x = targetX - CONFIG.CANVAS_WIDTH / 2;
    this.y = targetY - CONFIG.CANVAS_HEIGHT / 2;

    // Map boundary limits
    this.x = Math.max(0, Math.min(this.x, this.mapPixelWidth - CONFIG.CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.mapPixelHeight - CONFIG.CANVAS_HEIGHT));
  }
}
