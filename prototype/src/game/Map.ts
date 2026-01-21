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
        // Default is grass
        let tile: TileType = TileType.GRASS;

        // Map borders are walls
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          tile = TileType.WALL;
        }
        // Center dirt path (vertical)
        else if (x >= 18 && x <= 21) {
          tile = TileType.DIRT;
        }
        // Center dirt path (horizontal)
        else if (y >= 18 && y <= 21) {
          tile = TileType.DIRT;
        }
        // Tree zone (top-left) - darker dirt
        else if (x >= 2 && x <= 9 && y >= 2 && y <= 9) {
          tile = TileType.DIRT;
        }
        // Rock zone (top-right) - dirt
        else if (x >= 30 && x <= 37 && y >= 2 && y <= 9) {
          tile = TileType.DIRT;
        }
        // Herb zone (bottom-left) - grass with water nearby
        else if (x >= 2 && x <= 9 && y >= 28 && y <= 37) {
          tile = TileType.GRASS;
        }
        // Pond (bottom area)
        else if (x >= 5 && x <= 8 && y >= 35 && y <= 38) {
          tile = TileType.WATER;
        }
        // Pond (right area)
        else if (x >= 32 && x <= 36 && y >= 25 && y <= 29) {
          tile = TileType.WATER;
        }
        // Random dirt patches
        else if (Math.random() < 0.03) {
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
