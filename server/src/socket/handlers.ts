import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerSyncData,
  MonsterSyncData,
  ChatMessage,
  Party,
  PartyMember,
  PartyInvite,
  GuildRank,
  TradeSession,
  TradeRequest,
  TradeItem,
} from '../../../shared/types.js';

interface GameState {
  players: Map<string, PlayerSyncData>;
  monsters: Map<number, MonsterSyncData>;
}

// Skill cooldown tracking (playerId -> { skillId -> lastUsedTime })
const playerSkillCooldowns = new Map<string, Map<string, number>>();

// Skill data (simplified - in production this should come from DB or config)
const SKILL_DATA: Record<string, { cooldown: number; mpCost: number }> = {
  'warrior_slash': { cooldown: 500, mpCost: 5 },
  'warrior_shield_bash': { cooldown: 3000, mpCost: 15 },
  'warrior_charge': { cooldown: 8000, mpCost: 25 },
  'archer_power_shot': { cooldown: 1000, mpCost: 10 },
  'archer_multishot': { cooldown: 5000, mpCost: 20 },
  'archer_rain_of_arrows': { cooldown: 10000, mpCost: 35 },
  'mage_fireball': { cooldown: 1500, mpCost: 15 },
  'mage_ice_spike': { cooldown: 2000, mpCost: 20 },
  'mage_meteor': { cooldown: 15000, mpCost: 50 },
  'thief_backstab': { cooldown: 800, mpCost: 10 },
  'thief_smoke_bomb': { cooldown: 5000, mpCost: 15 },
  'thief_shadow_step': { cooldown: 6000, mpCost: 25 },
};

// Room/Map management
const playerRooms = new Map<string, string>(); // playerId -> roomId (mapId)

// Party state management
const parties = new Map<string, Party>();
const playerParties = new Map<string, string>(); // playerId -> partyId
const pendingInvites = new Map<string, PartyInvite[]>(); // targetPlayerId -> invites

// Guild state (online status tracking)
const playerGuilds = new Map<string, string>(); // playerId -> guildId

// Trade state management
const tradeSessions = new Map<string, TradeSession>(); // sessionId -> TradeSession
const playerTrades = new Map<string, string>(); // playerId -> sessionId
const pendingTradeRequests = new Map<string, TradeRequest[]>(); // targetPlayerId -> requests

// Helper: Generate unique party ID
function generatePartyId(): string {
  return `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function setupSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  gameState: GameState
) {
  // Player join
  socket.on('player:join', (data) => {
    const player: PlayerSyncData = {
      id: socket.id,
      name: data.name,
      x: data.x,
      y: data.y,
      direction: 'down',
      isMoving: false,
      job: data.job,
      weapon: data.weapon || 'bone',
      level: data.level || 1,
      hp: data.hp || 100,
      maxHp: data.maxHp || 100,
      isAttacking: false,
    };

    // Send existing players to new player FIRST (before adding new player)
    const existingPlayers = Array.from(gameState.players.values());
    socket.emit('room:players', existingPlayers);

    // Add new player to game state
    gameState.players.set(socket.id, player);

    // Notify OTHER players about new player (not the joining player itself)
    socket.broadcast.emit('player:joined', player);
  });

  // Player movement
  socket.on('player:move', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.x = data.x;
      player.y = data.y;
      player.direction = data.direction;
      player.isMoving = data.isMoving;

      // Broadcast to other players
      socket.broadcast.emit('player:moved', {
        id: socket.id,
        x: data.x,
        y: data.y,
        direction: data.direction,
        isMoving: data.isMoving,
      });
    }
  });

  // Player attack
  socket.on('player:attack', (data) => {
    const player = gameState.players.get(socket.id);
    if (player) {
      player.isAttacking = true;

      // Broadcast attack to other players
      socket.broadcast.emit('player:attacked', {
        id: socket.id,
        direction: data.direction,
        x: player.x,
        y: player.y,
        targetX: data.targetX ?? player.x,
        targetY: data.targetY ?? player.y,
        attackType: data.attackType || 'melee',
      });

      // Process monster damage
      data.targetMonsterIds.forEach((monsterId) => {
        const monster = gameState.monsters.get(monsterId);
        if (monster && monster.isAlive) {
          const damage = 10 + player.level * 2; // Base damage calculation
          monster.hp -= damage;

          if (monster.hp <= 0) {
            monster.isAlive = false;
            io.emit('monster:killed', {
              monsterId,
              killerId: socket.id,
              exp: 25, // Base exp
            });
          } else {
            io.emit('monster:damaged', {
              monsterId,
              hp: monster.hp,
              damage,
              attackerId: socket.id,
            });
          }
        }
      });

      // Reset attack state after a short delay
      setTimeout(() => {
        if (player) {
          player.isAttacking = false;
        }
      }, 300);
    }
  });

  // Player damaged (self-report for party HP sync)
  socket.on('player:damaged_self', (data: { hp: number; maxHp: number; damage: number }) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // Update player HP in game state
    player.hp = data.hp;
    player.maxHp = data.maxHp;

    // Update party member HP if in a party
    updatePartyMemberHp(io, socket.id, data.hp, data.maxHp);

    // Broadcast to other players (for HP bar display)
    socket.broadcast.emit('player:damaged', {
      id: socket.id,
      hp: data.hp,
      damage: data.damage,
    });
  });

  // Player skill use with server-side cooldown validation
  socket.on('player:skill', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    const skillId = data.skillId;
    const skillData = SKILL_DATA[skillId];
    const now = Date.now();

    // Validate cooldown if skill data exists
    if (skillData) {
      let playerCooldowns = playerSkillCooldowns.get(socket.id);
      if (!playerCooldowns) {
        playerCooldowns = new Map();
        playerSkillCooldowns.set(socket.id, playerCooldowns);
      }

      const lastUsed = playerCooldowns.get(skillId) || 0;
      if (now - lastUsed < skillData.cooldown) {
        // Skill is on cooldown, ignore (client should also validate but server is authoritative)
        console.log(`Skill ${skillId} on cooldown for player ${socket.id}`);
        return;
      }

      // Update cooldown
      playerCooldowns.set(skillId, now);
    }

    // Broadcast skill to other players
    socket.broadcast.emit('player:skill', {
      id: socket.id,
      skillId: data.skillId,
      x: data.x,
      y: data.y,
      targetX: data.targetX,
      targetY: data.targetY,
      direction: data.direction,
    });
  });

  // Monster damage - broadcast to other players (client-authoritative)
  socket.on('monster:damage', (data: { monsterId: number; damage: number; newHp: number; killed: boolean; exp?: number }) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    if (data.killed) {
      // Broadcast monster killed to other players
      socket.broadcast.emit('monster:killed', {
        monsterId: data.monsterId,
        killerId: socket.id,
        exp: data.exp || 0,
      });
    } else {
      // Broadcast monster damage to other players
      socket.broadcast.emit('monster:damaged', {
        monsterId: data.monsterId,
        hp: data.newHp,
        damage: data.damage,
        attackerId: socket.id,
      });
    }
  });

  // Item dropped (from monster kill or player drop)
  socket.on('item:dropped', (item: any) => {
    // Broadcast to all other players
    socket.broadcast.emit('item:dropped', item);
  });

  // Item pickup
  socket.on('item:pickup', (data: { itemId: string }) => {
    // Broadcast to all players that item was picked up
    io.emit('item:picked_up', {
      itemId: data.itemId,
      playerId: socket.id,
    });
  });

  // Room/Map management
  socket.on('room:join', (data: { roomId: string }) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    const oldRoomId = playerRooms.get(socket.id);

    // Leave old room if exists
    if (oldRoomId) {
      socket.leave(`map:${oldRoomId}`);
      socket.to(`map:${oldRoomId}`).emit('player:left', socket.id);
    }

    // Join new room
    socket.join(`map:${data.roomId}`);
    playerRooms.set(socket.id, data.roomId);

    // Get all players in the new room
    const playersInRoom: PlayerSyncData[] = [];
    for (const [playerId, p] of gameState.players) {
      if (playerRooms.get(playerId) === data.roomId && playerId !== socket.id) {
        playersInRoom.push(p);
      }
    }

    // Send existing players in room to the joining player
    socket.emit('room:players', playersInRoom);
    socket.emit('room:joined', { roomId: data.roomId });

    // Notify other players in the room about the new player
    socket.to(`map:${data.roomId}`).emit('player:joined', player);
  });

  socket.on('room:leave', () => {
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      socket.leave(`map:${roomId}`);
      socket.to(`map:${roomId}`).emit('player:left', socket.id);
      playerRooms.delete(socket.id);
      socket.emit('room:left');
    }
  });

  // Chat messages
  socket.on('chat:send', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    const message: ChatMessage = {
      id: `${Date.now()}-${socket.id}`,
      senderId: socket.id,
      senderName: player.name,
      message: data.message,
      timestamp: Date.now(),
      channel: data.channel || 'global',
    };

    switch (data.channel) {
      case 'global':
        io.emit('chat:message', message);
        break;
      case 'whisper':
        if (data.targetId) {
          socket.emit('chat:message', message);
          io.to(data.targetId).emit('chat:message', message);
        }
        break;
      case 'party':
        // Send to party members only
        const partyId = playerParties.get(socket.id);
        if (partyId) {
          io.to(`party:${partyId}`).emit('chat:message', message);
        }
        break;
      case 'guild':
        // Send to guild members only
        const guildId = playerGuilds.get(socket.id);
        if (guildId) {
          io.to(`guild:${guildId}`).emit('chat:message', message);
        }
        break;
    }
  });

  // ============================================
  // Party System Handlers
  // ============================================

  // Create party
  socket.on('party:create', () => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // Check if already in a party
    if (playerParties.has(socket.id)) {
      return;
    }

    const partyId = generatePartyId();
    const member: PartyMember = {
      id: socket.id,
      name: player.name,
      job: player.job,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
    };

    const party: Party = {
      id: partyId,
      leaderId: socket.id,
      members: [member],
    };

    parties.set(partyId, party);
    playerParties.set(socket.id, partyId);
    socket.join(`party:${partyId}`);

    socket.emit('party:created', party);
  });

  // Invite player to party
  socket.on('party:invite', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // Check if inviter is in a party (create one if not)
    let partyId = playerParties.get(socket.id);
    if (!partyId) {
      // Auto-create party
      partyId = generatePartyId();
      const member: PartyMember = {
        id: socket.id,
        name: player.name,
        job: player.job,
        level: player.level,
        hp: player.hp,
        maxHp: player.maxHp,
      };

      const party: Party = {
        id: partyId,
        leaderId: socket.id,
        members: [member],
      };

      parties.set(partyId, party);
      playerParties.set(socket.id, partyId);
      socket.join(`party:${partyId}`);
      socket.emit('party:created', party);
    }

    const party = parties.get(partyId);
    if (!party) return;

    // Check if party is full (max 4 members)
    if (party.members.length >= 4) return;

    // Check if target is already in a party
    if (playerParties.has(data.targetId)) return;

    // Create invite
    const invite: PartyInvite = {
      partyId,
      inviterId: socket.id,
      inviterName: player.name,
    };

    // Store pending invite (with duplicate check)
    const targetInvites = pendingInvites.get(data.targetId) || [];

    // Check for duplicate invite from same party
    if (targetInvites.some(i => i.partyId === partyId)) return;

    targetInvites.push(invite);
    pendingInvites.set(data.targetId, targetInvites);

    // Send invite to target
    io.to(data.targetId).emit('party:invite_received', invite);
  });

  // Accept party invite
  socket.on('party:invite_accept', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // Check if already in a party
    if (playerParties.has(socket.id)) return;

    const party = parties.get(data.partyId);
    if (!party) return;

    // Check if party is full
    if (party.members.length >= 4) return;

    // Remove from pending invites
    const invites = pendingInvites.get(socket.id) || [];
    pendingInvites.set(
      socket.id,
      invites.filter((i) => i.partyId !== data.partyId)
    );

    // Add to party
    const member: PartyMember = {
      id: socket.id,
      name: player.name,
      job: player.job,
      level: player.level,
      hp: player.hp,
      maxHp: player.maxHp,
    };

    party.members.push(member);
    playerParties.set(socket.id, data.partyId);
    socket.join(`party:${data.partyId}`);

    // Notify all party members
    io.to(`party:${data.partyId}`).emit('party:member_joined', member);

    // Send full party data to new member
    socket.emit('party:created', party);
  });

  // Decline party invite
  socket.on('party:invite_decline', (data) => {
    const invites = pendingInvites.get(socket.id) || [];
    pendingInvites.set(
      socket.id,
      invites.filter((i) => i.partyId !== data.partyId)
    );
  });

  // Leave party
  socket.on('party:leave', () => {
    const partyId = playerParties.get(socket.id);
    if (!partyId) return;

    const party = parties.get(partyId);
    if (!party) return;

    // Remove from party
    party.members = party.members.filter((m) => m.id !== socket.id);
    playerParties.delete(socket.id);
    socket.leave(`party:${partyId}`);

    // Notify remaining members
    io.to(`party:${partyId}`).emit('party:member_left', socket.id);

    if (party.members.length === 0) {
      // Disband empty party
      parties.delete(partyId);
    } else if (party.leaderId === socket.id) {
      // Transfer leadership to next member
      party.leaderId = party.members[0].id;
      io.to(`party:${partyId}`).emit('party:leader_changed', party.leaderId);
    }

    socket.emit('party:disbanded');
  });

  // Kick member from party
  socket.on('party:kick', (data) => {
    const partyId = playerParties.get(socket.id);
    if (!partyId) return;

    const party = parties.get(partyId);
    if (!party) return;

    // Only leader can kick
    if (party.leaderId !== socket.id) return;

    // Can't kick yourself
    if (data.targetId === socket.id) return;

    // Remove target from party
    party.members = party.members.filter((m) => m.id !== data.targetId);
    playerParties.delete(data.targetId);

    // Get target socket and leave room
    const targetSocket = io.sockets.sockets.get(data.targetId);
    if (targetSocket) {
      targetSocket.leave(`party:${partyId}`);
      targetSocket.emit('party:disbanded');
    }

    // Notify remaining members
    io.to(`party:${partyId}`).emit('party:member_left', data.targetId);
  });

  // Transfer party leadership
  socket.on('party:transfer_leader', (data) => {
    const partyId = playerParties.get(socket.id);
    if (!partyId) return;

    const party = parties.get(partyId);
    if (!party) return;

    // Only leader can transfer
    if (party.leaderId !== socket.id) return;

    // Check if target is in party
    const targetMember = party.members.find((m) => m.id === data.targetId);
    if (!targetMember) return;

    party.leaderId = data.targetId;
    io.to(`party:${partyId}`).emit('party:leader_changed', data.targetId);
  });

  // Handle disconnect - clean up party
  socket.on('disconnect', () => {
    const player = gameState.players.get(socket.id);

    // Clean up party membership
    const partyId = playerParties.get(socket.id);
    if (partyId) {
      const party = parties.get(partyId);
      if (party) {
        party.members = party.members.filter((m) => m.id !== socket.id);
        playerParties.delete(socket.id);

        if (party.members.length === 0) {
          parties.delete(partyId);
        } else {
          io.to(`party:${partyId}`).emit('party:member_left', socket.id);

          if (party.leaderId === socket.id) {
            party.leaderId = party.members[0].id;
            io.to(`party:${partyId}`).emit('party:leader_changed', party.leaderId);
          }
        }
      }
    }

    // Clean up pending invites
    pendingInvites.delete(socket.id);

    // Clean up room/map membership
    const roomId = playerRooms.get(socket.id);
    if (roomId) {
      socket.to(`map:${roomId}`).emit('player:left', socket.id);
      playerRooms.delete(socket.id);
    }

    // Clean up skill cooldowns
    playerSkillCooldowns.delete(socket.id);

    // Remove player from game state
    if (player) {
      gameState.players.delete(socket.id);
      socket.broadcast.emit('player:left', socket.id);
    }
  });
}

// Helper function to update party member HP (called from player damage handling)
export function updatePartyMemberHp(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  playerId: string,
  hp: number,
  maxHp: number
) {
  const partyId = playerParties.get(playerId);
  if (!partyId) return;

  const party = parties.get(partyId);
  if (!party) return;

  const member = party.members.find((m) => m.id === playerId);
  if (member) {
    member.hp = hp;
    member.maxHp = maxHp;
    io.to(`party:${partyId}`).emit('party:member_updated', { id: playerId, hp, maxHp });
  }
}

// ============================================
// Guild System Handlers
// ============================================

// Guild invite storage (in-memory for real-time)
interface GuildInviteData {
  guildId: string;
  guildName: string;
  inviterId: string;
  inviterName: string;
}
const pendingGuildInvites = new Map<string, GuildInviteData[]>(); // targetPlayerId -> invites

export function setupGuildHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  gameState: { players: Map<string, PlayerSyncData> }
) {
  // Join guild room (for online status tracking)
  // This should be called when player loads their guild data from Supabase
  const joinGuildRoom = (guildId: string) => {
    socket.join(`guild:${guildId}`);
    playerGuilds.set(socket.id, guildId);
    // Notify other guild members that this player is online
    socket.to(`guild:${guildId}`).emit('guild:member_online', socket.id);
  };

  // Leave guild room
  const leaveGuildRoom = () => {
    const guildId = playerGuilds.get(socket.id);
    if (guildId) {
      socket.to(`guild:${guildId}`).emit('guild:member_offline', socket.id);
      socket.leave(`guild:${guildId}`);
      playerGuilds.delete(socket.id);
    }
  };

  // Send guild invite (real-time notification)
  socket.on('guild:invite', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    const guildId = playerGuilds.get(socket.id);
    if (!guildId) return;

    // Store pending invite
    const targetInvites = pendingGuildInvites.get(data.targetCharacterId) || [];

    // Check for duplicate invite
    if (targetInvites.some(i => i.guildId === guildId)) return;

    const invite: GuildInviteData = {
      guildId,
      guildName: '', // This should be fetched from DB or passed in
      inviterId: socket.id,
      inviterName: player.name,
    };

    targetInvites.push(invite);
    pendingGuildInvites.set(data.targetCharacterId, targetInvites);

    // Send invite to target player
    io.to(data.targetCharacterId).emit('guild:invite_received', {
      guildId: invite.guildId,
      guildName: invite.guildName,
      inviterId: invite.inviterId,
      inviterName: invite.inviterName,
    });
  });

  // Accept guild invite
  socket.on('guild:invite_accept', (data) => {
    // Remove from pending invites
    const invites = pendingGuildInvites.get(socket.id) || [];
    pendingGuildInvites.set(
      socket.id,
      invites.filter((i) => i.guildId !== data.guildId)
    );

    // Join guild room for online status
    joinGuildRoom(data.guildId);

    // Notify guild members (the actual DB operations happen on client)
    const player = gameState.players.get(socket.id);
    if (player) {
      io.to(`guild:${data.guildId}`).emit('guild:member_joined', {
        characterId: socket.id,
        name: player.name,
        job: player.job,
        level: player.level,
        rank: 'member',
        isOnline: true,
      });
    }
  });

  // Decline guild invite
  socket.on('guild:invite_decline', (data) => {
    const invites = pendingGuildInvites.get(socket.id) || [];
    pendingGuildInvites.set(
      socket.id,
      invites.filter((i) => i.guildId !== data.guildId)
    );
  });

  // Leave guild
  socket.on('guild:leave', () => {
    const guildId = playerGuilds.get(socket.id);
    if (guildId) {
      io.to(`guild:${guildId}`).emit('guild:member_left', socket.id);
      leaveGuildRoom();
    }
  });

  // Kick member from guild
  socket.on('guild:kick', (data) => {
    const guildId = playerGuilds.get(socket.id);
    if (!guildId) return;

    // Notify the kicked player
    const targetSocket = io.sockets.sockets.get(data.targetId);
    if (targetSocket) {
      targetSocket.emit('guild:disbanded');
      targetSocket.leave(`guild:${guildId}`);
      playerGuilds.delete(data.targetId);
    }

    // Notify guild members
    io.to(`guild:${guildId}`).emit('guild:member_left', data.targetId);
  });

  // Promote/demote member
  socket.on('guild:promote', (data) => {
    const guildId = playerGuilds.get(socket.id);
    if (!guildId) return;

    io.to(`guild:${guildId}`).emit('guild:rank_changed', {
      memberId: data.targetId,
      newRank: data.rank,
    });
  });

  // Disband guild
  socket.on('guild:disband', () => {
    const guildId = playerGuilds.get(socket.id);
    if (!guildId) return;

    // Notify all guild members
    io.to(`guild:${guildId}`).emit('guild:disbanded');

    // Remove all players from the guild room
    io.in(`guild:${guildId}`).socketsLeave(`guild:${guildId}`);

    // Clean up playerGuilds map
    for (const [playerId, pGuildId] of playerGuilds) {
      if (pGuildId === guildId) {
        playerGuilds.delete(playerId);
      }
    }
  });

  // Handle disconnect for guild
  socket.on('disconnect', () => {
    // Clean up guild membership
    leaveGuildRoom();
    pendingGuildInvites.delete(socket.id);
  });

  // Expose joinGuildRoom for external use
  return { joinGuildRoom, leaveGuildRoom };
}

// ============================================
// Trading System Handlers
// ============================================

function generateTradeId(): string {
  return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function setupTradeHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  gameState: { players: Map<string, PlayerSyncData> }
) {
  // Request trade
  socket.on('trade:request', (data) => {
    const player = gameState.players.get(socket.id);
    if (!player) return;

    // Check if either player is already in a trade
    if (playerTrades.has(socket.id) || playerTrades.has(data.targetId)) {
      return;
    }

    const request: TradeRequest = {
      fromId: socket.id,
      fromName: player.name,
      toId: data.targetId,
    };

    // Store pending request
    const targetRequests = pendingTradeRequests.get(data.targetId) || [];
    // Prevent duplicate requests
    if (targetRequests.some(r => r.fromId === socket.id)) return;

    targetRequests.push(request);
    pendingTradeRequests.set(data.targetId, targetRequests);

    // Send request to target
    io.to(data.targetId).emit('trade:request_received', request);
  });

  // Accept trade request
  socket.on('trade:accept', (data) => {
    const player = gameState.players.get(socket.id);
    const requester = gameState.players.get(data.fromId);
    if (!player || !requester) return;

    // Check if either player is already in a trade
    if (playerTrades.has(socket.id) || playerTrades.has(data.fromId)) {
      return;
    }

    // Remove from pending requests
    const requests = pendingTradeRequests.get(socket.id) || [];
    pendingTradeRequests.set(
      socket.id,
      requests.filter((r) => r.fromId !== data.fromId)
    );

    // Create trade session
    const sessionId = generateTradeId();
    const session: TradeSession = {
      id: sessionId,
      player1Id: data.fromId,
      player1Name: requester.name,
      player2Id: socket.id,
      player2Name: player.name,
      player1Offer: { items: [], gold: 0, confirmed: false },
      player2Offer: { items: [], gold: 0, confirmed: false },
      status: 'active',
    };

    tradeSessions.set(sessionId, session);
    playerTrades.set(data.fromId, sessionId);
    playerTrades.set(socket.id, sessionId);

    // Notify both players
    io.to(data.fromId).emit('trade:started', session);
    socket.emit('trade:started', session);
  });

  // Decline trade request
  socket.on('trade:decline', (data) => {
    const requests = pendingTradeRequests.get(socket.id) || [];
    pendingTradeRequests.set(
      socket.id,
      requests.filter((r) => r.fromId !== data.fromId)
    );

    // Notify requester that trade was declined
    io.to(data.fromId).emit('trade:cancelled', {
      sessionId: '',
      reason: '거래 요청이 거절되었습니다.',
    });
  });

  // Update trade offer
  socket.on('trade:update_offer', (data) => {
    const sessionId = playerTrades.get(socket.id);
    if (!sessionId) return;

    const session = tradeSessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    // Determine which player is updating
    const isPlayer1 = session.player1Id === socket.id;
    const offer = isPlayer1 ? session.player1Offer : session.player2Offer;

    // Reset confirm status when offer changes
    offer.items = data.items;
    offer.gold = data.gold;
    offer.confirmed = false;

    // Also reset the other player's confirm since offer changed
    if (isPlayer1) {
      session.player2Offer.confirmed = false;
    } else {
      session.player1Offer.confirmed = false;
    }

    // Notify both players
    io.to(session.player1Id).emit('trade:updated', session);
    io.to(session.player2Id).emit('trade:updated', session);
  });

  // Confirm trade
  socket.on('trade:confirm', () => {
    const sessionId = playerTrades.get(socket.id);
    if (!sessionId) return;

    const session = tradeSessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    // Set confirm status
    const isPlayer1 = session.player1Id === socket.id;
    if (isPlayer1) {
      session.player1Offer.confirmed = true;
    } else {
      session.player2Offer.confirmed = true;
    }

    // Check if both players confirmed
    if (session.player1Offer.confirmed && session.player2Offer.confirmed) {
      // Complete the trade
      session.status = 'completed';

      // Notify both players
      io.to(session.player1Id).emit('trade:completed', session);
      io.to(session.player2Id).emit('trade:completed', session);

      // Clean up
      tradeSessions.delete(sessionId);
      playerTrades.delete(session.player1Id);
      playerTrades.delete(session.player2Id);
    } else {
      // Notify both players of the update
      io.to(session.player1Id).emit('trade:updated', session);
      io.to(session.player2Id).emit('trade:updated', session);
    }
  });

  // Unconfirm trade
  socket.on('trade:unconfirm', () => {
    const sessionId = playerTrades.get(socket.id);
    if (!sessionId) return;

    const session = tradeSessions.get(sessionId);
    if (!session || session.status !== 'active') return;

    // Remove confirm status
    const isPlayer1 = session.player1Id === socket.id;
    if (isPlayer1) {
      session.player1Offer.confirmed = false;
    } else {
      session.player2Offer.confirmed = false;
    }

    // Notify both players
    io.to(session.player1Id).emit('trade:updated', session);
    io.to(session.player2Id).emit('trade:updated', session);
  });

  // Cancel trade
  socket.on('trade:cancel', () => {
    const sessionId = playerTrades.get(socket.id);
    if (!sessionId) return;

    const session = tradeSessions.get(sessionId);
    if (!session) return;

    session.status = 'cancelled';

    // Notify both players
    io.to(session.player1Id).emit('trade:cancelled', {
      sessionId,
      reason: '거래가 취소되었습니다.',
    });
    io.to(session.player2Id).emit('trade:cancelled', {
      sessionId,
      reason: '거래가 취소되었습니다.',
    });

    // Clean up
    tradeSessions.delete(sessionId);
    playerTrades.delete(session.player1Id);
    playerTrades.delete(session.player2Id);
  });

  // Handle disconnect - clean up trades
  socket.on('disconnect', () => {
    // Clean up pending requests
    pendingTradeRequests.delete(socket.id);

    // Clean up active trade
    const sessionId = playerTrades.get(socket.id);
    if (sessionId) {
      const session = tradeSessions.get(sessionId);
      if (session) {
        const otherId = session.player1Id === socket.id ? session.player2Id : session.player1Id;
        io.to(otherId).emit('trade:cancelled', {
          sessionId,
          reason: '상대방이 접속을 종료했습니다.',
        });
        tradeSessions.delete(sessionId);
        playerTrades.delete(otherId);
      }
      playerTrades.delete(socket.id);
    }
  });
}
