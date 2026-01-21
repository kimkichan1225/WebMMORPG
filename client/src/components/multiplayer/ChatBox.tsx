import React, { useState, useRef, useEffect } from 'react';
import { useMultiplayerStore, ChatMessage } from '../../stores/multiplayerStore';

interface ChatBoxProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isOpen, onToggle }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, isConnected } = useMultiplayerStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageColor = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system': return '#aaa';
      case 'whisper': return '#e8a';
      default: return '#fff';
    }
  };

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
          <div className="messages">
            {messages.length === 0 ? (
              <p className="empty-msg">메시지가 없습니다.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type}`}
                  style={{ color: getMessageColor(msg.type) }}
                >
                  <span className="time">[{formatTime(msg.timestamp)}]</span>
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
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isConnected ? '메시지 입력...' : '연결 안됨'}
              disabled={!isConnected}
              maxLength={200}
            />
            <button type="submit" disabled={!isConnected || !inputValue.trim()}>
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
          width: 350px;
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

        .messages {
          height: 200px;
          overflow-y: auto;
          padding: 10px;
        }

        .empty-msg {
          color: #666;
          text-align: center;
          margin-top: 80px;
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

        .message .sender {
          color: #6ac;
          margin-right: 5px;
        }

        .chat-input {
          display: flex;
          padding: 8px;
          border-top: 1px solid #3a3a5a;
          gap: 5px;
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
