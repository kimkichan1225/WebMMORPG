import React, { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';
import { useMultiplayerStore, ChatMessage } from '../../stores/multiplayerStore';
import { usePartyStore } from '../../stores/partyStore';
import { useGuildStore } from '../../stores/guildStore';
import { socketService } from '../../services/socket';

type ChatChannel = 'global' | 'party' | 'guild';

interface ChatBoxProps {
  isOpen: boolean;
  onToggle: () => void;
}

// Channel colors
const CHANNEL_COLORS: Record<ChatChannel, string> = {
  global: '#fff',
  party: '#4FC3F7',
  guild: '#81C784',
};

const CHANNEL_LABELS: Record<ChatChannel, string> = {
  global: '전체',
  party: '파티',
  guild: '길드',
};

const ChatBoxComponent: React.FC<ChatBoxProps> = ({ isOpen, onToggle }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('global');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use selectors for better performance
  const messages = useMultiplayerStore((state) => state.messages);
  const isConnected = useMultiplayerStore((state) => state.isConnected);
  const currentParty = usePartyStore((state) => state.currentParty);
  const currentGuild = useGuildStore((state) => state.currentGuild);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset to global if party/guild disbands
  useEffect(() => {
    if (activeChannel === 'party' && !currentParty) {
      setActiveChannel('global');
    }
    if (activeChannel === 'guild' && !currentGuild) {
      setActiveChannel('global');
    }
  }, [currentParty, currentGuild, activeChannel]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('chat:send', {
        message: inputValue.trim(),
        channel: activeChannel,
      });
    }

    setInputValue('');
  }, [inputValue, isConnected, activeChannel]);

  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const getMessageColor = useCallback((msg: ChatMessage) => {
    if (msg.type === 'system') return '#aaa';
    if (msg.type === 'whisper') return '#e8a';
    // Color by channel from server response
    const channel = (msg as any).channel as ChatChannel | undefined;
    if (channel && CHANNEL_COLORS[channel]) {
      return CHANNEL_COLORS[channel];
    }
    return '#fff';
  }, []);

  const getChannelPrefix = useCallback((msg: ChatMessage) => {
    const channel = (msg as any).channel as ChatChannel | undefined;
    if (channel === 'party') return '[파티] ';
    if (channel === 'guild') return '[길드] ';
    return '';
  }, []);

  // Memoize filtered messages to avoid recalculation on every render
  const filteredMessages = useMemo(() => messages.filter((msg) => {
    // System messages always show
    if (msg.type === 'system') return true;
    // Whispers always show
    if (msg.type === 'whisper') return true;

    const channel = (msg as any).channel as ChatChannel | undefined;

    // In global view, show everything
    if (activeChannel === 'global') return true;

    // In party/guild view, show matching channel only
    return channel === activeChannel;
  }), [messages, activeChannel]);

  const canSendToChannel = useCallback((channel: ChatChannel): boolean => {
    if (channel === 'party') return !!currentParty;
    if (channel === 'guild') return !!currentGuild;
    return true;
  }, [currentParty, currentGuild]);

  return (
    <div className={`chat-box ${isOpen ? 'open' : 'minimized'}`}>
      <div className="chat-header" onClick={onToggle}>
        <span>채팅</span>
        <span className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '연결됨' : '연결 끊김'}
        </span>
        <button className="toggle-btn">{isOpen ? '▼' : '▲'}</button>
      </div>

      {isOpen && (
        <>
          {/* Channel tabs */}
          <div className="channel-tabs">
            {(['global', 'party', 'guild'] as ChatChannel[]).map((channel) => (
              <button
                key={channel}
                className={`channel-tab ${activeChannel === channel ? 'active' : ''} ${
                  !canSendToChannel(channel) ? 'disabled' : ''
                }`}
                onClick={() => canSendToChannel(channel) && setActiveChannel(channel)}
                disabled={!canSendToChannel(channel)}
                style={{
                  color: activeChannel === channel ? CHANNEL_COLORS[channel] : '#888',
                  borderBottomColor:
                    activeChannel === channel ? CHANNEL_COLORS[channel] : 'transparent',
                }}
              >
                {CHANNEL_LABELS[channel]}
              </button>
            ))}
          </div>

          <div className="messages">
            {filteredMessages.length === 0 ? (
              <p className="empty-msg">메시지가 없습니다.</p>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type}`}
                  style={{ color: getMessageColor(msg) }}
                >
                  <span className="time">[{formatTime(msg.timestamp)}]</span>
                  <span className="channel-prefix">{getChannelPrefix(msg)}</span>
                  {msg.type !== 'system' && (
                    <span className="sender">{msg.senderName}:</span>
                  )}
                  <span className="text">{msg.message}</span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={handleSubmit}>
            <div
              className="channel-indicator"
              style={{ color: CHANNEL_COLORS[activeChannel] }}
            >
              [{CHANNEL_LABELS[activeChannel]}]
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                isConnected
                  ? canSendToChannel(activeChannel)
                    ? '메시지 입력...'
                    : `${CHANNEL_LABELS[activeChannel]} 채널 없음`
                  : '연결 안됨'
              }
              disabled={!isConnected || !canSendToChannel(activeChannel)}
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputValue.trim() || !canSendToChannel(activeChannel)}
            >
              전송
            </button>
          </form>
        </>
      )}

      <style>{`
        .chat-box {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 380px;
          background: rgba(20, 20, 30, 0.9);
          border: 1px solid #4a4a6a;
          border-radius: 8px;
          z-index: 500;
          color: white;
          font-size: 13px;
        }

        .chat-box.minimized {
          width: 150px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(40, 40, 60, 0.8);
          border-bottom: 1px solid #3a3a5a;
          cursor: pointer;
          border-radius: 8px 8px 0 0;
        }

        .chat-box.minimized .chat-header {
          border-radius: 8px;
          border-bottom: none;
        }

        .status {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .status.connected {
          background: rgba(50, 150, 50, 0.4);
          color: #8f8;
        }

        .status.disconnected {
          background: rgba(150, 50, 50, 0.4);
          color: #f88;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          font-size: 10px;
          padding: 2px 5px;
        }

        .channel-tabs {
          display: flex;
          border-bottom: 1px solid #3a3a5a;
          background: rgba(30, 30, 50, 0.5);
        }

        .channel-tab {
          flex: 1;
          padding: 8px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #888;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .channel-tab:hover:not(.disabled) {
          background: rgba(60, 60, 80, 0.5);
        }

        .channel-tab.active {
          font-weight: bold;
        }

        .channel-tab.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .messages {
          height: 180px;
          overflow-y: auto;
          padding: 10px;
        }

        .empty-msg {
          color: #666;
          text-align: center;
          margin-top: 70px;
        }

        .message {
          margin-bottom: 5px;
          line-height: 1.4;
          word-break: break-word;
        }

        .message.system {
          font-style: italic;
        }

        .message .time {
          color: #666;
          font-size: 10px;
          margin-right: 5px;
        }

        .message .channel-prefix {
          font-size: 11px;
          margin-right: 3px;
        }

        .message .sender {
          color: #6ac;
          margin-right: 5px;
        }

        .chat-input {
          display: flex;
          padding: 8px;
          border-top: 1px solid #3a3a5a;
          gap: 5px;
          align-items: center;
        }

        .channel-indicator {
          font-size: 11px;
          white-space: nowrap;
          font-weight: bold;
        }

        .chat-input input {
          flex: 1;
          padding: 8px;
          background: rgba(30, 30, 50, 0.8);
          border: 1px solid #4a4a6a;
          border-radius: 4px;
          color: #fff;
          font-size: 13px;
        }

        .chat-input input:disabled {
          opacity: 0.5;
        }

        .chat-input button {
          padding: 8px 12px;
          background: #4a6;
          border: none;
          border-radius: 4px;
          color: #fff;
          cursor: pointer;
        }

        .chat-input button:disabled {
          background: #444;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ChatBox = memo(ChatBoxComponent);
