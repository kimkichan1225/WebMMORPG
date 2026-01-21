import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerSyncData,
  MonsterSyncData,
  ChatMessage,
} from '../../../shared/types';

interface GameState {
  players: Map<string, PlayerSyncData>;
  monsters: Map<number, MonsterSyncData>;
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
      weapon: 'bone',
      level: 1,
      hp: 100,
      maxHp: 100,
      isAttacking: false,
    };

    gameState.players.set(socket.id, player);

    // Notify all players about new player
    io.emit('player:joined', player);

    // Send current state to new player
    socket.emit('sync:state', {
      players: Array.from(gameState.players.values()),
      monsters: Array.from(gameState.monsters.values()),
    });
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

  // Monster damage (alternative handler)
  socket.on('monster:damage', (data) => {
    const monster = gameState.monsters.get(data.monsterId);
    const player = gameState.players.get(socket.id);

    if (monster && monster.isAlive && player) {
      monster.hp -= data.damage;

      if (monster.hp <= 0) {
        monster.isAlive = false;
        io.emit('monster:killed', {
          monsterId: data.monsterId,
          killerId: socket.id,
          exp: 25,
        });
      } else {
        io.emit('monster:damaged', {
          monsterId: data.monsterId,
          hp: monster.hp,
          damage: data.damage,
          attackerId: socket.id,
        });
      }
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
      channel: data.channel,
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
        // TODO: Implement party system
        io.emit('chat:message', message);
        break;
    }
  });
}
