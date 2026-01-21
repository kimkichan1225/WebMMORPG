import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PlayerSyncData,
  MonsterSyncData
} from '../../shared/types';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  setupSocketHandlers(io, socket, gameState);

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
});
