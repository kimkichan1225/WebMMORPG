import { useState, useMemo, useEffect, useCallback } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { usePlayerStore } from '../stores/playerStore';
import { useMapStore } from '../stores/mapStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useEquipmentStore } from '../stores/equipmentStore';
import { useQuestStore } from '../stores/questStore';
import { useLifeSkillStore } from '../stores/lifeSkillStore';
import { useAuthStore } from '../stores/authStore';
import { usePartyStore } from '../stores/partyStore';
import { useGuildStore } from '../stores/guildStore';
import { useTradeStore } from '../stores/tradeStore';
import { useDroppedItemStore } from '../stores/droppedItemStore';
import { useGameTimeStore } from '../stores/gameTimeStore';
import { ToolSelect } from './ToolSelect';
import { HUD } from './HUD';
import { StatWindow } from './windows/StatWindow';
import { Inventory } from './windows/Inventory';
import { JobChangeUI } from './windows/JobChangeUI';
import { ToolChangeUI } from './windows/ToolChangeUI';
import { NPCDialog } from './windows/NPCDialog';
import { ShopWindow } from './windows/ShopWindow';
import { EquipmentWindow } from './windows/EquipmentWindow';
import { GuildWindow } from './windows/GuildWindow';
import { TradeWindow } from './windows/TradeWindow';
import { QuestTracker } from './QuestTracker';
import { TradeRequestNotification } from './TradeRequestNotification';
import { DayNightOverlay } from './DayNightOverlay';
import SkillBar from './SkillBar';
import { BuffDisplay } from './BuffDisplay';
import { PartyUI } from './PartyUI';
import { PlayerContextMenu } from './PlayerContextMenu';
import { NPC } from '../game/entities/NPC';
import { useSkillStore } from '../stores/skillStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';
import { FishingGameOverlay } from './windows/FishingUI';
import { CONFIG, TileType, type WeaponType } from '@shared/types';
import { JOB_WEAPONS } from '../game/weapons';
import mapsData from '../data/maps.json';

// Character-specific save key prefix
const SAVE_KEY_PREFIX = 'skeleton-mmorpg-char-';

// Map data interface
interface MapDataJSON {
  width: number;
  height: number;
  bgColor: string;
  tileTypes: Record<string, { color: string; walkable: boolean }>;
  zones: { type: string; x: number; y: number; width: number; height: number }[];
  portals: { x: number; y: number; width: number; height: number; name: string }[];
  npcs: { id: string; x: number; y: number }[];
}

// Minimap component
function Minimap() {
  const { x, y } = usePlayerStore();
  const { currentMapId, currentMapName } = useMapStore();
  const otherPlayers = useMultiplayerStore((state) => state.otherPlayers);

  const MINIMAP_SIZE = 150;

  // Get current map data
  const currentMapData = useMemo(() => {
    const maps = mapsData.maps as Record<string, MapDataJSON>;
    return maps[currentMapId] || maps['town'];
  }, [currentMapId]);

  const mapWidth = currentMapData.width;
  const mapHeight = currentMapData.height;
  const TILE_PIXEL = MINIMAP_SIZE / Math.max(mapWidth, mapHeight);

  // Generate map tiles based on current map data
  const generateMapTiles = useMemo(() => {
    const tiles: { x: number; y: number; color: string }[] = [];
    const tileTypes = currentMapData.tileTypes;

    // Get default color from first tile type (sand for desert, grass for forest, etc.)
    const tileTypeNames = Object.keys(tileTypes || {});
    const firstTileType = tileTypeNames[0];
    const defaultColor = firstTileType ? tileTypes[firstTileType]?.color : '#7ec850';

    // Initialize with default color
    for (let row = 0; row < mapHeight; row++) {
      for (let col = 0; col < mapWidth; col++) {
        tiles.push({ x: col, y: row, color: defaultColor });
      }
    }

    // Apply zones
    if (currentMapData.zones) {
      for (const zone of currentMapData.zones) {
        const tileConfig = tileTypes[zone.type];
        const color = tileConfig?.color || '#888888';
        for (let dy = 0; dy < zone.height; dy++) {
          for (let dx = 0; dx < zone.width; dx++) {
            const mapX = zone.x + dx;
            const mapY = zone.y + dy;
            if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
              const idx = mapY * mapWidth + mapX;
              tiles[idx].color = color;
            }
          }
        }
      }
    }

    return tiles;
  }, [currentMapData, mapWidth, mapHeight]);

  const playerTileX = x / CONFIG.TILE_SIZE;
  const playerTileY = y / CONFIG.TILE_SIZE;

  return (
    <div
      style={{
        width: MINIMAP_SIZE,
        height: MINIMAP_SIZE,
        border: '2px solid #444',
        borderRadius: '4px',
        backgroundColor: '#222',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg width={MINIMAP_SIZE} height={MINIMAP_SIZE}>
        {/* Map tiles */}
        {generateMapTiles.map((tile, idx) => (
          <rect
            key={idx}
            x={tile.x * TILE_PIXEL}
            y={tile.y * TILE_PIXEL}
            width={TILE_PIXEL + 0.5}
            height={TILE_PIXEL + 0.5}
            fill={tile.color}
          />
        ))}

        {/* Portals (blue) */}
        {currentMapData.portals?.map((portal, idx) => (
          <rect
            key={`portal-${idx}`}
            x={portal.x * TILE_PIXEL}
            y={portal.y * TILE_PIXEL}
            width={portal.width * TILE_PIXEL}
            height={portal.height * TILE_PIXEL}
            fill="#4080ff"
            opacity={0.8}
          />
        ))}

        {/* NPCs (yellow) */}
        {currentMapData.npcs?.map((npc, idx) => (
          <circle
            key={`npc-${idx}`}
            cx={(npc.x / CONFIG.TILE_SIZE) * TILE_PIXEL}
            cy={(npc.y / CONFIG.TILE_SIZE) * TILE_PIXEL}
            r={3}
            fill="#ffcc00"
            stroke="#996600"
            strokeWidth={1}
          />
        ))}

        {/* Other players (green) */}
        {Array.from(otherPlayers.values()).map((player) => (
          <circle
            key={`player-${player.id}`}
            cx={(player.x / CONFIG.TILE_SIZE) * TILE_PIXEL}
            cy={(player.y / CONFIG.TILE_SIZE) * TILE_PIXEL}
            r={3}
            fill="#00ff00"
            stroke="#006600"
            strokeWidth={1}
          />
        ))}

        {/* Player position (red) */}
        <circle
          cx={playerTileX * TILE_PIXEL}
          cy={playerTileY * TILE_PIXEL}
          r={4}
          fill="#ff0000"
          stroke="#ffffff"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

// Controls help
function ControlsHelp() {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#aaa',
      }}
    >
      <div style={{ marginBottom: '5px', color: '#fff', fontWeight: 'bold' }}>조작법</div>
      <div>WASD / 방향키 - 이동</div>
      <div>Shift - 대시</div>
      <div>Space - 공격</div>
      <div>1~6 - 스킬 사용</div>
      <div style={{ color: '#FFD700' }}>마우스 - 조준 (원거리)</div>
      <div>E (꾹) - 채집</div>
      <div style={{ color: '#4FC3F7' }}>R - 낚시</div>
      <div>F - NPC 대화</div>
      <div>Tab - 스탯창</div>
      <div>I - 인벤토리</div>
      <div>U - 장비창</div>
      <div style={{ color: '#81C784' }}>G - 길드</div>
      <div>J - 전직</div>
      <div style={{ color: '#888', marginTop: '3px' }}>우클릭 - 플레이어 메뉴</div>
    </div>
  );
}

// Save game data interface
interface SaveData {
  player: {
    x: number;
    y: number;
    level: number;
    exp: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    str: number;
    dex: number;
    int: number;
    vit: number;
    luk: number;
    statPoints: number;
    gold: number;
    job: string;
    tool: string | null;
  };
  inventory: Array<{ id: string; name: string; type: string; quantity: number }>;
  equipment: {
    weapon: string | null;
    head: string | null;
    body: string | null;
    accessory: string | null;
  };
  lifeSkills: Record<string, { level: number; exp: number }>;
  quests: {
    active: Record<string, any>;
    completed: string[];
  };
  map: { currentMapId: string };
  savedAt: number;
}

export function Game() {
  const { toolSelected } = usePlayerStore();
  const { selectedCharacter } = useAuthStore();
  const { isTradeOpen, setTradeOpen } = useTradeStore();

  const [isStatWindowOpen, setStatWindowOpen] = useState(false);
  const [isInventoryOpen, setInventoryOpen] = useState(false);
  const [isJobChangeOpen, setJobChangeOpen] = useState(false);
  const [isToolChangeOpen, setToolChangeOpen] = useState(false);
  const [isEquipmentOpen, setEquipmentOpen] = useState(false);
  const [isNPCDialogOpen, setNPCDialogOpen] = useState(false);
  const [isShopOpen, setShopOpen] = useState(false);
  const [isGuildWindowOpen, setGuildWindowOpen] = useState(false);
  const [currentNPC, setCurrentNPC] = useState<NPC | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Context menu state for right-clicking players
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    playerId: string;
    playerName: string;
    x: number;
    y: number;
  }>({ isOpen: false, playerId: '', playerName: '', x: 0, y: 0 });

  // 캐릭터별 저장 키
  const getSaveKey = useCallback(() => {
    return selectedCharacter ? `${SAVE_KEY_PREFIX}${selectedCharacter.id}` : 'skeleton-mmorpg-save-default';
  }, [selectedCharacter]);

  // 게임 저장 함수
  const saveGame = useCallback(() => {
    const playerState = usePlayerStore.getState();
    const inventoryState = useInventoryStore.getState();
    const equipmentState = useEquipmentStore.getState();
    const questState = useQuestStore.getState();
    const lifeSkillState = useLifeSkillStore.getState();
    const mapState = useMapStore.getState();

    const saveData: SaveData = {
      player: {
        x: playerState.x,
        y: playerState.y,
        level: playerState.level,
        exp: playerState.exp,
        hp: playerState.hp,
        maxHp: playerState.maxHp,
        mp: playerState.mp,
        maxMp: playerState.maxMp,
        str: playerState.str,
        dex: playerState.dex,
        int: playerState.int,
        vit: playerState.vit,
        luk: playerState.luk,
        statPoints: playerState.statPoints,
        gold: playerState.gold,
        job: playerState.job,
        tool: playerState.tool,
      },
      inventory: inventoryState.items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        quantity: item.quantity,
      })),
      equipment: {
        weapon: equipmentState.equipped.weapon?.id || null,
        head: equipmentState.equipped.head?.id || null,
        body: equipmentState.equipped.body?.id || null,
        accessory: equipmentState.equipped.accessory?.id || null,
      },
      lifeSkills: Object.fromEntries(
        Object.entries(lifeSkillState.skills).map(([id, skill]) => [
          id,
          { level: skill.level, exp: skill.exp },
        ])
      ),
      quests: {
        active: questState.activeQuests,
        completed: questState.completedQuests,
      },
      map: { currentMapId: mapState.currentMapId },
      savedAt: Date.now(),
    };

    localStorage.setItem(getSaveKey(), JSON.stringify(saveData));
    setLastSaved(new Date());
    console.log('게임 저장됨:', new Date().toLocaleTimeString(), '캐릭터:', selectedCharacter?.name);

    // Supabase에도 주요 데이터 동기화
    if (selectedCharacter) {
      useAuthStore.getState().saveCharacterProgress({
        level: playerState.level,
        exp: playerState.exp,
        gold: playerState.gold,
        hp: playerState.hp,
        mp: playerState.mp,
        max_hp: playerState.maxHp,
        max_mp: playerState.maxMp,
        x: playerState.x,
        y: playerState.y,
        job: playerState.job,
        str: playerState.str,
        dex: playerState.dex,
        int: playerState.int,
        vit: playerState.vit,
        luk: playerState.luk,
        stat_points: playerState.statPoints,
      });
    }
  }, [getSaveKey, selectedCharacter]);

  // 선택된 캐릭터 데이터로 초기화
  const initializeFromCharacter = useCallback(() => {
    if (!selectedCharacter) return;

    console.log('캐릭터 데이터로 초기화:', selectedCharacter.name, 'Lv.', selectedCharacter.level);

    // 플레이어 상태를 선택된 캐릭터로 설정
    const characterJob = selectedCharacter.job || 'Base';
    usePlayerStore.setState({
      x: selectedCharacter.x || 400,
      y: selectedCharacter.y || 300,
      level: selectedCharacter.level || 1,
      exp: selectedCharacter.exp || 0,
      hp: selectedCharacter.hp || selectedCharacter.max_hp || 100,
      maxHp: selectedCharacter.max_hp || 100,
      mp: selectedCharacter.mp || selectedCharacter.max_mp || 50,
      maxMp: selectedCharacter.max_mp || 50,
      str: selectedCharacter.str || 5,
      dex: selectedCharacter.dex || 5,
      int: selectedCharacter.int || 5,
      vit: selectedCharacter.vit || 5,
      luk: selectedCharacter.luk || 5,
      statPoints: selectedCharacter.stat_points || 0,
      gold: selectedCharacter.gold || 100,
      job: characterJob as any,
      weapon: (JOB_WEAPONS[characterJob] || 'bone') as WeaponType,
      tool: null,
      toolSelected: false,
      isDead: false,
    });

    // 맵 설정
    useMapStore.getState().setCurrentMap(
      selectedCharacter.map_id || 'town',
      selectedCharacter.x || 400,
      selectedCharacter.y || 300
    );
  }, [selectedCharacter]);

  // 게임 불러오기 함수 (로컬 저장 데이터)
  const loadGame = useCallback(() => {
    // 먼저 캐릭터 데이터로 초기화
    initializeFromCharacter();

    // 로컬 저장 데이터가 있으면 덮어쓰기 (더 최신 데이터일 수 있음)
    const savedJson = localStorage.getItem(getSaveKey());
    if (!savedJson) {
      console.log('로컬 저장 데이터 없음, 서버 캐릭터 데이터 사용');
      return false;
    }

    try {
      const saveData: SaveData = JSON.parse(savedJson);

      // 로컬 저장이 더 최신인 경우에만 적용
      // (서버 데이터와 로컬 데이터의 timestamp 비교)
      console.log('로컬 저장 데이터 발견, 적용 중...');

      // 플레이어 상태 복원
      const savedJob = saveData.player.job || 'Base';
      usePlayerStore.setState({
        x: saveData.player.x,
        y: saveData.player.y,
        level: saveData.player.level,
        exp: saveData.player.exp,
        hp: saveData.player.hp,
        maxHp: saveData.player.maxHp,
        mp: saveData.player.mp,
        maxMp: saveData.player.maxMp,
        str: saveData.player.str,
        dex: saveData.player.dex,
        int: saveData.player.int,
        vit: saveData.player.vit,
        luk: saveData.player.luk,
        statPoints: saveData.player.statPoints,
        gold: saveData.player.gold,
        job: savedJob as any,
        weapon: (JOB_WEAPONS[savedJob] || 'bone') as WeaponType,
        tool: saveData.player.tool as any,
        toolSelected: saveData.player.tool !== null,
      });

      // 인벤토리 복원
      useInventoryStore.setState({
        items: saveData.inventory.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as any,
          quantity: item.quantity,
        })),
      });

      // 맵 복원
      useMapStore.getState().setCurrentMap(
        saveData.map.currentMapId,
        saveData.player.x,
        saveData.player.y
      );

      console.log('게임 불러오기 완료');
      return true;
    } catch (error) {
      console.error('게임 불러오기 실패:', error);
      return false;
    }
  }, [getSaveKey, initializeFromCharacter]);

  // 캐릭터 변경 시 데이터 로드
  useEffect(() => {
    if (selectedCharacter) {
      loadGame();
    }
  }, [selectedCharacter, loadGame]);

  // 실시간 저장 - 중요한 상태 변경 시 저장
  useEffect(() => {
    if (!toolSelected) return;

    // Subscribe to player store changes
    const unsubscribe = usePlayerStore.subscribe(
      (state, prevState) => {
        // Save when important values change
        if (
          state.level !== prevState.level ||
          state.exp !== prevState.exp ||
          state.gold !== prevState.gold ||
          state.hp !== prevState.hp ||
          state.mp !== prevState.mp ||
          state.job !== prevState.job ||
          state.str !== prevState.str ||
          state.dex !== prevState.dex ||
          state.int !== prevState.int ||
          state.vit !== prevState.vit ||
          state.luk !== prevState.luk ||
          state.statPoints !== prevState.statPoints
        ) {
          saveGame();
        }
      }
    );

    return () => unsubscribe();
  }, [toolSelected, saveGame]);

  // 페이지 닫을 때 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  // U 키로 장비창 토글, G 키로 길드창 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!toolSelected) return;

      if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setEquipmentOpen(prev => !prev);
      }
      if (e.key.toLowerCase() === 'g') {
        e.preventDefault();
        setGuildWindowOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toolSelected]);

  // Multiplayer connection - must connect first, then initialize party/guild/trade listeners
  useEffect(() => {
    if (selectedCharacter && toolSelected) {
      // Connect first
      useMultiplayerStore.getState().connect(selectedCharacter.id, selectedCharacter.name);

      // Wait for socket to connect, then initialize listeners
      const initTimer = setTimeout(() => {
        usePartyStore.getState().initializePartyListeners();
        useGuildStore.getState().initializeGuildListeners();
        useGuildStore.getState().loadGuildData(selectedCharacter.id);
        useTradeStore.getState().initializeListeners();
        useDroppedItemStore.getState().initializeListeners();
      }, 500);

      return () => {
        clearTimeout(initTimer);
        useMultiplayerStore.getState().disconnect();
      };
    }
  }, [selectedCharacter, toolSelected]);

  // Game time - sync with server for consistent time across all players
  useEffect(() => {
    if (toolSelected) {
      useGameTimeStore.getState().initializeSync();
      return () => {
        useGameTimeStore.getState().stopSync();
      };
    }
  }, [toolSelected]);

  const handleNPCInteract = (npc: NPC) => {
    setCurrentNPC(npc);
    setNPCDialogOpen(true);
  };

  const handleOpenShop = () => {
    setNPCDialogOpen(false);
    setShopOpen(true);
  };

  const handleOpenToolChange = () => {
    setNPCDialogOpen(false);
    setToolChangeOpen(true);
  };

  // Handle right-click on other players
  const handlePlayerRightClick = useCallback(
    (playerId: string, playerName: string, screenX: number, screenY: number) => {
      setContextMenu({
        isOpen: true,
        playerId,
        playerName,
        x: screenX,
        y: screenY,
      });
    },
    []
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 스킬 사용 핸들러 (SkillBar에서 호출됨)
  const handleUseSkill = useCallback((skillId: string) => {
    const skillStore = useSkillStore.getState();
    skillStore.useSkill(skillId);
  }, []);

  // 아이템 사용 핸들러 (SkillBar에서 호출됨)
  const handleUseItem = useCallback((itemId: string) => {
    console.log(`Used item: ${itemId}`);
    // Item usage is handled in SkillBar component via useConsumable
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#1a1a2e',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          color: '#fff',
          marginBottom: '20px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        Skeleton MMORPG
      </h1>

      {/* Tool selection overlay */}
      <ToolSelect />

      {/* Main game container */}
      <div style={{ position: 'relative' }}>
        {/* HUD (HP/MP/Level) */}
        {toolSelected && <HUD />}

        {/* Quest Tracker (below HUD) */}
        {toolSelected && <QuestTracker />}

        {/* Skill Bar (bottom center) */}
        {toolSelected && <SkillBar onUseSkill={handleUseSkill} onUseItem={handleUseItem} />}

        {/* Minimap (bottom-right) */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                color: '#FFD700',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '2px',
                textAlign: 'center',
              }}
            >
              {useMapStore.getState().currentMapName}
            </div>
            <div
              style={{
                color: '#aaa',
                fontSize: '10px',
                marginBottom: '4px',
                textAlign: 'center',
              }}
            >
              ({Math.floor(usePlayerStore.getState().x / CONFIG.TILE_SIZE)},{' '}
              {Math.floor(usePlayerStore.getState().y / CONFIG.TILE_SIZE)})
            </div>
            <Minimap />
            <div
              style={{
                marginTop: '4px',
                fontSize: '9px',
                color: '#888',
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span><span style={{ color: '#ff0000' }}>●</span> You</span>
              <span><span style={{ color: '#00ff00' }}>●</span> Player</span>
              <span><span style={{ color: '#ffcc00' }}>●</span> NPC</span>
              <span><span style={{ color: '#4080ff' }}>■</span> Portal</span>
            </div>
          </div>
        )}

        {/* Controls help (top-right) */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
            }}
          >
            <ControlsHelp />
          </div>
        )}

        {/* Buff Display (top-right, below controls) */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              top: '220px',
              right: '10px',
              zIndex: 10,
            }}
          >
            <BuffDisplay />
          </div>
        )}

        {/* Game Canvas */}
        <GameCanvas
          onToggleStatWindow={() => setStatWindowOpen(prev => !prev)}
          onToggleInventory={() => setInventoryOpen(prev => !prev)}
          onToggleJobChange={() => setJobChangeOpen(prev => !prev)}
          onNPCInteract={handleNPCInteract}
          onPlayerRightClick={handlePlayerRightClick}
        />

        {/* Day/Night Overlay */}
        {toolSelected && <DayNightOverlay />}

        {/* Fishing Mini-game Overlay */}
        {toolSelected && <FishingGameOverlay />}

        {/* Multiplayer connection status */}
        {toolSelected && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: useMultiplayerStore.getState().isConnected ? '#4CAF50' : '#F44336',
              }}
            />
            <span style={{ color: '#AAA' }}>
              {useMultiplayerStore.getState().isConnected ? '온라인' : '오프라인'}
            </span>
          </div>
        )}

        {/* Party UI */}
        {toolSelected && <PartyUI />}
      </div>

      {/* UI Windows */}
      <StatWindow isOpen={isStatWindowOpen} onClose={() => setStatWindowOpen(false)} />
      <Inventory isOpen={isInventoryOpen} onClose={() => setInventoryOpen(false)} />
      <JobChangeUI isOpen={isJobChangeOpen} onClose={() => setJobChangeOpen(false)} />
      <ToolChangeUI isOpen={isToolChangeOpen} onClose={() => setToolChangeOpen(false)} />
      <NPCDialog
        isOpen={isNPCDialogOpen}
        onClose={() => setNPCDialogOpen(false)}
        npc={currentNPC}
        onOpenShop={handleOpenShop}
        onOpenJobChange={() => {
          setNPCDialogOpen(false);
          setJobChangeOpen(true);
        }}
        onOpenToolChange={handleOpenToolChange}
      />
      <ShopWindow
        isOpen={isShopOpen}
        onClose={() => setShopOpen(false)}
        npc={currentNPC}
      />
      <EquipmentWindow
        isOpen={isEquipmentOpen}
        onClose={() => setEquipmentOpen(false)}
      />
      <GuildWindow
        isOpen={isGuildWindowOpen}
        onClose={() => setGuildWindowOpen(false)}
      />

      {/* Trade Window */}
      {isTradeOpen && (
        <TradeWindow onClose={() => setTradeOpen(false)} />
      )}

      {/* Trade Request Notification */}
      <TradeRequestNotification />

      {/* Player Context Menu */}
      <PlayerContextMenu
        isOpen={contextMenu.isOpen}
        playerId={contextMenu.playerId}
        playerName={contextMenu.playerName}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleCloseContextMenu}
      />

      {/* Footer info */}
      {toolSelected && (
        <div
          style={{
            marginTop: '20px',
            color: '#666',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <p>Tab: 스탯 | I: 인벤토리 | U: 장비 | G: 길드 | J: 전직 | 1~6: 스킬</p>
          {lastSaved && (
            <p style={{ color: '#4a4', marginTop: '5px' }}>
              마지막 저장: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
