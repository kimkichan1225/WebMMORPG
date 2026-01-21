import { CONFIG, TileType } from '@shared/types';
import mapsData from '../../data/maps.json';

export interface Portal {
  x: number;
  y: number;
  width: number;
  height: number;
  targetMap: string;
  targetX: number;
  targetY: number;
  name: string;
}

export interface MapZone {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapData {
  id: string;
  name: string;
  nameEn: string;
  width: number;
  height: number;
  bgColor: string;
  ambientColor: string;
  tileTypes: Record<string, { color: string; walkable: boolean }>;
  zones: MapZone[];
  portals: Portal[];
  npcs: { id: string; x: number; y: number }[];
  monsterSpawns: { type: string; x: number; y: number; count: number; isBoss?: boolean }[];
  resourceSpawns: { type: string; x: number; y: number; count: number }[];
}

export class GameMap {
  width: number;
  height: number;
  tiles: number[][];
  mapId: string;
  mapData: MapData;
  portals: Portal[];

  private tileTypeMap: Map<string, number> = new Map();
  private tileConfigs: { color: string; walkable: boolean }[] = [];

  // Default tile colors (fallback)
  private defaultTileColors: Record<number, string> = {
    [TileType.GRASS]: '#7ec850',
    [TileType.DIRT]: '#c4a484',
    [TileType.WATER]: '#4a90d9',
    [TileType.WALL]: '#555555',
  };

  constructor(mapId: string = 'town') {
    this.mapId = mapId;
    const maps = mapsData.maps as Record<string, MapData>;
    this.mapData = maps[mapId] || maps['town'];

    this.width = this.mapData.width;
    this.height = this.mapData.height;
    this.portals = this.mapData.portals || [];

    this.initializeTileTypes();
    this.tiles = this.generateMap();
  }

  private initializeTileTypes(): void {
    this.tileTypeMap.clear();
    this.tileConfigs = [];

    // Add default types first
    const defaultTypes = ['grass', 'dirt', 'water', 'wall'];
    defaultTypes.forEach((type, index) => {
      this.tileTypeMap.set(type, index);
      this.tileConfigs[index] = {
        color: this.defaultTileColors[index] || '#888888',
        walkable: index !== TileType.WATER && index !== TileType.WALL,
      };
    });

    // Add map-specific tile types
    if (this.mapData.tileTypes) {
      let nextIndex = this.tileConfigs.length;
      Object.entries(this.mapData.tileTypes).forEach(([typeName, config]) => {
        if (!this.tileTypeMap.has(typeName)) {
          this.tileTypeMap.set(typeName, nextIndex);
          this.tileConfigs[nextIndex] = config;
          nextIndex++;
        } else {
          const existingIndex = this.tileTypeMap.get(typeName)!;
          this.tileConfigs[existingIndex] = config;
        }
      });
    }
  }

  private generateMap(): number[][] {
    const map: number[][] = [];

    // Get default tile type - use first tile type defined in map data
    const tileTypeNames = Object.keys(this.mapData.tileTypes || {});
    const defaultTileName = tileTypeNames[0] || 'grass';
    const defaultTileIndex = this.tileTypeMap.get(defaultTileName) ?? TileType.GRASS;

    // Initialize with default tile (sand for desert, grass for forest, stone for cave, etc.)
    for (let y = 0; y < this.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push(defaultTileIndex);
      }
      map.push(row);
    }

    // Apply zones
    if (this.mapData.zones) {
      for (const zone of this.mapData.zones) {
        const tileIndex = this.tileTypeMap.get(zone.type);
        if (tileIndex === undefined) continue;

        for (let dy = 0; dy < zone.height; dy++) {
          for (let dx = 0; dx < zone.width; dx++) {
            const mapX = zone.x + dx;
            const mapY = zone.y + dy;
            if (mapX >= 0 && mapX < this.width && mapY >= 0 && mapY < this.height) {
              map[mapY][mapX] = tileIndex;
            }
          }
        }
      }
    }

    // Add some random variety (only for grass-based maps)
    if (defaultTileName === 'grass') {
      const dirtIndex = this.tileTypeMap.get('dirt');
      if (dirtIndex !== undefined) {
        for (let y = 1; y < this.height - 1; y++) {
          for (let x = 1; x < this.width - 1; x++) {
            if (map[y][x] === defaultTileIndex && Math.random() < 0.02) {
              map[y][x] = dirtIndex;
            }
          }
        }
      }
    }

    return map;
  }

  loadMap(mapId: string): void {
    const maps = mapsData.maps as Record<string, MapData>;
    if (!maps[mapId]) {
      console.warn(`Map ${mapId} not found, using town`);
      mapId = 'town';
    }

    this.mapId = mapId;
    this.mapData = maps[mapId];
    this.width = this.mapData.width;
    this.height = this.mapData.height;
    this.portals = this.mapData.portals || [];

    this.initializeTileTypes();
    this.tiles = this.generateMap();
  }

  getTile(x: number, y: number): number {
    const tileX = Math.floor(x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(y / CONFIG.TILE_SIZE);

    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return TileType.WALL;
    }

    return this.tiles[tileY][tileX];
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    const config = this.tileConfigs[tile];
    return config ? config.walkable : false;
  }

  checkPortalCollision(x: number, y: number): Portal | null {
    const tileX = Math.floor(x / CONFIG.TILE_SIZE);
    const tileY = Math.floor(y / CONFIG.TILE_SIZE);

    for (const portal of this.portals) {
      if (
        tileX >= portal.x &&
        tileX < portal.x + portal.width &&
        tileY >= portal.y &&
        tileY < portal.y + portal.height
      ) {
        return portal;
      }
    }
    return null;
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

        // Draw tile
        const config = this.tileConfigs[tile];
        ctx.fillStyle = config ? config.color : '#888888';
        ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);

        // Tile border (slightly darker)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
      }
    }

    // Draw portals
    this.renderPortals(ctx, cameraX, cameraY);
  }

  private renderPortals(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    for (const portal of this.portals) {
      const screenX = portal.x * CONFIG.TILE_SIZE - cameraX;
      const screenY = portal.y * CONFIG.TILE_SIZE - cameraY;
      const width = portal.width * CONFIG.TILE_SIZE;
      const height = portal.height * CONFIG.TILE_SIZE;

      // Skip if off screen
      if (
        screenX + width < 0 ||
        screenX > CONFIG.CANVAS_WIDTH ||
        screenY + height < 0 ||
        screenY > CONFIG.CANVAS_HEIGHT
      ) {
        continue;
      }

      // Portal glow effect
      const time = Date.now() / 500;
      const glowIntensity = 0.5 + Math.sin(time) * 0.2;

      // Outer glow
      ctx.fillStyle = `rgba(100, 150, 255, ${glowIntensity * 0.3})`;
      ctx.fillRect(screenX - 4, screenY - 4, width + 8, height + 8);

      // Inner portal
      const gradient = ctx.createRadialGradient(
        screenX + width / 2,
        screenY + height / 2,
        0,
        screenX + width / 2,
        screenY + height / 2,
        Math.max(width, height) / 2
      );
      gradient.addColorStop(0, `rgba(150, 200, 255, ${glowIntensity})`);
      gradient.addColorStop(0.5, `rgba(100, 150, 255, ${glowIntensity * 0.7})`);
      gradient.addColorStop(1, `rgba(50, 100, 200, ${glowIntensity * 0.5})`);

      ctx.fillStyle = gradient;
      ctx.fillRect(screenX, screenY, width, height);

      // Swirl effect
      ctx.strokeStyle = `rgba(255, 255, 255, ${glowIntensity * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const centerX = screenX + width / 2;
      const centerY = screenY + height / 2;
      for (let i = 0; i < 3; i++) {
        const angle = time + (i * Math.PI * 2) / 3;
        const radius = Math.min(width, height) / 3;
        ctx.moveTo(centerX, centerY);
        ctx.arc(
          centerX,
          centerY,
          radius,
          angle,
          angle + Math.PI / 2
        );
      }
      ctx.stroke();

      // Portal border
      ctx.strokeStyle = '#4080ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX, screenY, width, height);

      // Portal name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(portal.name, centerX, screenY - 8);
      ctx.fillText(portal.name, centerX, screenY - 8);
    }
  }

  getMapPixelWidth(): number {
    return this.width * CONFIG.TILE_SIZE;
  }

  getMapPixelHeight(): number {
    return this.height * CONFIG.TILE_SIZE;
  }

  getMapName(): string {
    return this.mapData.name;
  }

  getMonsterSpawns(): MapData['monsterSpawns'] {
    return this.mapData.monsterSpawns || [];
  }

  getResourceSpawns(): MapData['resourceSpawns'] {
    return this.mapData.resourceSpawns || [];
  }

  getNpcSpawns(): MapData['npcs'] {
    return this.mapData.npcs || [];
  }
}

// Static helper to get all available maps
export function getAvailableMaps(): { id: string; name: string; nameEn: string }[] {
  const maps = mapsData.maps as Record<string, MapData>;
  return Object.entries(maps).map(([id, data]) => ({
    id,
    name: data.name,
    nameEn: data.nameEn,
  }));
}

// Get starting map and position
export function getStartingMap(): { mapId: string; x: number; y: number } {
  return {
    mapId: mapsData.startMap,
    x: mapsData.startPosition.x,
    y: mapsData.startPosition.y,
  };
}
