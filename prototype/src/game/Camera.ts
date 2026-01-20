import { CONFIG } from '../types';

export class Camera {
  x: number = 0;
  y: number = 0;

  // 맵의 픽셀 크기
  private mapPixelWidth: number;
  private mapPixelHeight: number;

  constructor() {
    this.mapPixelWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
    this.mapPixelHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
  }

  follow(targetX: number, targetY: number): void {
    // 카메라 중심을 플레이어에 맞춤
    this.x = targetX - CONFIG.CANVAS_WIDTH / 2;
    this.y = targetY - CONFIG.CANVAS_HEIGHT / 2;

    // 맵 경계 제한
    this.x = Math.max(0, Math.min(this.x, this.mapPixelWidth - CONFIG.CANVAS_WIDTH));
    this.y = Math.max(0, Math.min(this.y, this.mapPixelHeight - CONFIG.CANVAS_HEIGHT));
  }
}
