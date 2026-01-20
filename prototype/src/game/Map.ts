import { CONFIG, TileType } from '../types';

export class GameMap {
  width: number;
  height: number;
  tiles: TileType[][];

  // 타일 색상
  private tileColors: Record<TileType, string> = {
    [TileType.GRASS]: '#7ec850',
    [TileType.DIRT]: '#c4a484',
    [TileType.WATER]: '#4a90d9',
    [TileType.WALL]: '#555555',
  };

  constructor() {
    this.width = CONFIG.MAP_WIDTH;
    this.height = CONFIG.MAP_HEIGHT;
    this.tiles = this.generateMap();
  }

  private generateMap(): TileType[][] {
    const map: TileType[][] = [];

    for (let y = 0; y < this.height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < this.width; x++) {
        // 기본은 잔디
        let tile = TileType.GRASS;

        // 맵 가장자리는 벽
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          tile = TileType.WALL;
        }
        // 중앙에 흙길
        else if (x >= 13 && x <= 16) {
          tile = TileType.DIRT;
        }
        // 작은 연못 (오른쪽 상단)
        else if (x >= 20 && x <= 24 && y >= 5 && y <= 9) {
          tile = TileType.WATER;
        }
        // 작은 연못 (왼쪽 하단)
        else if (x >= 5 && x <= 8 && y >= 20 && y <= 23) {
          tile = TileType.WATER;
        }
        // 랜덤하게 흙 패치 추가
        else if (Math.random() < 0.05) {
          tile = TileType.DIRT;
        }

        row.push(tile);
      }
      map.push(row);
    }

    return map;
  }

  getTile(x: number, y: number): TileType {
    const tileX = Math.floor(x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(y / CONFIG.TILE_SIZE);

    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return TileType.WALL;
    }

    return this.tiles[tileY][tileX];
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== TileType.WATER && tile !== TileType.WALL;
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const startTileX = Math.floor(cameraX / CONFIG.TILE_SIZE);
    const startTileY = Math.floor(cameraY / CONFIG.TILE_SIZE);
    const tilesX = Math.ceil(CONFIG.CANVAS_WIDTH / CONFIG.TILE_SIZE) + 2;
    const tilesY = Math.ceil(CONFIG.CANVAS_HEIGHT / CONFIG.TILE_SIZE) + 2;

    for (let y = startTileY - 1; y < startTileY + tilesY; y++) {
      for (let x = startTileX - 1; x < startTileX + tilesX; x++) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

        const tile = this.tiles[y][x];
        const screenX = x * CONFIG.TILE_SIZE - cameraX;
        const screenY = y * CONFIG.TILE_SIZE - cameraY;

        // 타일 그리기
        ctx.fillStyle = this.tileColors[tile];
        ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // 타일 테두리 (약간 어둡게)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
      }
    }
  }
}
