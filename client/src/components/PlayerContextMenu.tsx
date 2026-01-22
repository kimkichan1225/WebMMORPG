import React, { useEffect, useRef } from 'react';
import { usePartyStore } from '../stores/partyStore';
import { useTradeStore } from '../stores/tradeStore';

interface PlayerContextMenuProps {
  isOpen: boolean;
  playerId: string;
  playerName: string;
  x: number;
  y: number;
  onClose: () => void;
  onWhisper?: (playerId: string, playerName: string) => void;
}

export const PlayerContextMenu: React.FC<PlayerContextMenuProps> = ({
  isOpen,
  playerId,
  playerName,
  x,
  y,
  onClose,
  onWhisper,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentParty, invitePlayer } = usePartyStore();
  const { requestTrade, currentTrade } = useTradeStore();

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close menu on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInviteToParty = () => {
    invitePlayer(playerId);
    onClose();
  };

  const handleWhisper = () => {
    if (onWhisper) {
      onWhisper(playerId, playerName);
    }
    onClose();
  };

  const handleTrade = () => {
    requestTrade(playerId);
    onClose();
  };

  // Check if player is already in the party
  const isInParty = currentParty?.members.some((m) => m.id === playerId);
  const canInvite = !isInParty && (!currentParty || currentParty.members.length < 4);

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        backgroundColor: 'rgba(30, 30, 45, 0.95)',
        border: '2px solid #5a5a7a',
        borderRadius: '8px',
        minWidth: '150px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(60, 60, 90, 0.8)',
          borderBottom: '1px solid #5a5a7a',
          color: '#FFD700',
          fontWeight: 'bold',
          fontSize: '13px',
        }}
      >
        {playerName}
      </div>

      {/* Menu Options */}
      <div style={{ padding: '4px 0' }}>
        {/* Party Invite */}
        <button
          onClick={handleInviteToParty}
          disabled={!canInvite}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: canInvite ? '#fff' : '#666',
            cursor: canInvite ? 'pointer' : 'not-allowed',
            fontSize: '13px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (canInvite) {
              e.currentTarget.style.backgroundColor = 'rgba(100, 100, 150, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '8px' }}>+</span>
          파티 초대
          {isInParty && <span style={{ color: '#888', marginLeft: '8px' }}>(이미 파티원)</span>}
        </button>

        {/* Whisper */}
        <button
          onClick={handleWhisper}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(100, 100, 150, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '8px' }}>@</span>
          귓속말
        </button>

        {/* Trade */}
        <button
          onClick={handleTrade}
          disabled={!!currentTrade}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 16px',
            textAlign: 'left',
            backgroundColor: 'transparent',
            border: 'none',
            color: currentTrade ? '#666' : '#FFD700',
            cursor: currentTrade ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!currentTrade) {
              e.currentTarget.style.backgroundColor = 'rgba(100, 100, 150, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <span style={{ marginRight: '8px' }}>$</span>
          거래
          {currentTrade && <span style={{ color: '#888', marginLeft: '8px' }}>(거래 중)</span>}
        </button>
      </div>
    </div>
  );
};

export default PlayerContextMenu;
