import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerSyncData,
  MonsterSyncData,
  GameTime,
  TimeOfDay
} from '../../shared/types.js';
import { setupSocketHandlers, setupGuildHandlers, setupTradeHandlers } from './socket/handlers.js';

dotenv.config();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in production (serving static files)
const isProduction = process.env.NODE_ENV === 'production';

// Get allowed origins for CORS
function getAllowedOrigins(): string[] {
  const origins: string[] = ['http://localhost:3000'];

  if (process.env.CLIENT_URL) {
    // Support comma-separated multiple URLs
    const urls = process.env.CLIENT_URL.split(',').map(url => url.trim());
    origins.push(...urls);
  }

  return origins;
}

// ============================================
// Game Time Management
// ============================================
// 1 real minute = 1 game hour (24 real minutes = 1 game day)
const REAL_MS_PER_GAME_MINUTE = 1000; // 1 second = 1 game minute
const TIME_BROADCAST_INTERVAL = 5000; // Broadcast time every 5 seconds

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}

// Server-managed game time state
const gameTime: GameTime = {
  hour: 8,
  minute: 0,
  timeOfDay: 'day',
  dayNumber: 1,
};

// Tick game time every game minute
function tickGameTime(): void {
  gameTime.minute++;

  if (gameTime.minute >= 60) {
    gameTime.minute = 0;
    gameTime.hour++;
  }

  if (gameTime.hour >= 24) {
    gameTime.hour = 0;
    gameTime.dayNumber++;
  }

  gameTime.timeOfDay = getTimeOfDay(gameTime.hour);
}

const app = express();
const httpServer = createServer(app);

// Allowed origins for CORS
const allowedOrigins = getAllowedOrigins();

// Socket.io with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Game state
const gameState = {
  players: new Map<string, PlayerSyncData>(),
  monsters: new Map<number, MonsterSyncData>(),
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', players: gameState.players.size });
});

// Serve static files in production
if (isProduction) {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes and socket.io
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  console.log(`Serving static files from: ${clientDistPath}`);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Send current game time to newly connected player
  socket.emit('time:update', { ...gameTime });

  setupSocketHandlers(io, socket, gameState);
  setupGuildHandlers(io, socket, gameState);
  setupTradeHandlers(io, socket, gameState);

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameState.players.delete(socket.id);
    io.emit('player:left', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start game time tick (every game minute = 1 real second)
  setInterval(() => {
    tickGameTime();
  }, REAL_MS_PER_GAME_MINUTE);

  // Broadcast game time to all clients periodically
  setInterval(() => {
    io.emit('time:update', { ...gameTime });
  }, TIME_BROADCAST_INTERVAL);

  console.log(`Game time started at ${gameTime.hour}:${gameTime.minute} (Day ${gameTime.dayNumber})`);
});
