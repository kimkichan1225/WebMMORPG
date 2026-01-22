import React, { memo, useCallback, useMemo } from 'react';
import { usePartyStore } from '../stores/partyStore';
import { socketService } from '../services/socket';
import type { PartyMember } from '@shared/types';

// Job icons/colors for visual distinction
const JOB_COLORS: Record<string, string> = {
  Base: '#888888',
  Warrior: '#FF6B6B',
  Archer: '#6BCB77',
  Mage: '#4D96FF',
  Thief: '#9D4EDD',
  Swordsman: '#FF4444',
  Mace: '#CC6600',
  Polearm: '#FF8800',
  Gunner: '#00CC66',
  Bowmaster: '#44CC44',
  Crossbowman: '#228822',
  Elemental: '#6666FF',
  Holy: '#FFDD00',
  Dark: '#8800CC',
  Fighter: '#CC44CC',
  Dagger: '#AA22AA',
  Shuriken: '#660066',
};

interface PartyMemberCardProps {
  member: PartyMember;
  isLeader: boolean;
  isCurrentPlayer: boolean;
  canKick: boolean;
  onKick: () => void;
}

const PartyMemberCard: React.FC<PartyMemberCardProps> = memo(({
  member,
  isLeader,
  isCurrentPlayer,
  canKick,
  onKick,
}) => {
  const hpPercent = useMemo(() => (member.hp / member.maxHp) * 100, [member.hp, member.maxHp]);
  const jobColor = JOB_COLORS[member.job] || '#888';

  return (
    <div
      style={{
        backgroundColor: isCurrentPlayer
          ? 'rgba(100, 150, 100, 0.3)'
          : 'rgba(40, 40, 60, 0.8)',
        borderRadius: '6px',
        padding: '8px',
        marginBottom: '6px',
        border: `1px solid ${isCurrentPlayer ? '#4a6a4a' : '#3a3a5a'}`,
        position: 'relative',
      }}
    >
      {/* Leader crown icon */}
      {isLeader && (
        <span
          style={{
            position: 'absolute',
            top: '-6px',
            left: '8px',
            fontSize: '12px',
          }}
        >
          ^
        </span>
      )}

      {/* Kick button for leader */}
      {canKick && !isCurrentPlayer && (
        <button
          onClick={onKick}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: 'rgba(200, 50, 50, 0.6)',
            border: 'none',
            borderRadius: '3px',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          X
        </button>
      )}

      {/* Name and level */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
        }}
      >
        {/* Job indicator */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: jobColor,
          }}
        />
        <span
          style={{
            color: '#fff',
            fontSize: '12px',
            fontWeight: isLeader ? 'bold' : 'normal',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.name}
        </span>
        <span style={{ color: '#aaa', fontSize: '10px' }}>Lv.{member.level}</span>
      </div>

      {/* HP Bar */}
      <div
        style={{
          backgroundColor: '#333',
          borderRadius: '3px',
          height: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${hpPercent}%`,
            backgroundColor:
              hpPercent > 50 ? '#4CAF50' : hpPercent > 25 ? '#FFC107' : '#F44336',
            transition: 'width 0.3s, background-color 0.3s',
          }}
        />
      </div>
      <div
        style={{
          color: '#aaa',
          fontSize: '9px',
          textAlign: 'right',
          marginTop: '2px',
        }}
      >
        {member.hp}/{member.maxHp}
      </div>
    </div>
  );
});

interface PartyInviteNotificationProps {
  inviterName: string;
  partyId: string;
  onAccept: () => void;
  onDecline: () => void;
}

const PartyInviteNotification: React.FC<PartyInviteNotificationProps> = memo(({
  inviterName,
  onAccept,
  onDecline,
}) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(60, 80, 100, 0.95)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '10px',
        border: '2px solid #4a9eff',
        animation: 'pulse 1.5s infinite',
      }}
    >
      <div style={{ color: '#fff', fontSize: '12px', marginBottom: '8px' }}>
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{inviterName}</span>
        님이 파티에 초대했습니다.
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onAccept}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: '#4CAF50',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          수락
        </button>
        <button
          onClick={onDecline}
          style={{
            flex: 1,
            padding: '6px 12px',
            backgroundColor: '#666',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '11px',
          }}
        >
          거절
        </button>
      </div>
    </div>
  );
});

const PartyUIComponent: React.FC = () => {
  const { currentParty, pendingInvites, isLeader, leaveParty, kickMember, acceptInvite, declineInvite } =
    usePartyStore();

  const currentSocketId = socketService.getSocket()?.id;

  // No party and no invites - show nothing
  if (!currentParty && pendingInvites.length === 0) {
    return null;
  }

  return (
    <>
      {/* Pending Invites - Show in center of screen */}
      {pendingInvites.length > 0 && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
          }}
        >
          {pendingInvites.map((invite) => (
            <div
              key={invite.partyId}
              style={{
                backgroundColor: 'rgba(30, 40, 60, 0.98)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '10px',
                border: '3px solid #4a9eff',
                boxShadow: '0 0 30px rgba(74, 158, 255, 0.5)',
                minWidth: '280px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#4a9eff', fontSize: '14px', marginBottom: '12px', fontWeight: 'bold' }}>
                파티 초대
              </div>
              <div style={{ color: '#fff', fontSize: '15px', marginBottom: '16px' }}>
                <span style={{ color: '#FFD700', fontWeight: 'bold' }}>{invite.inviterName}</span>
                님이 파티에 초대했습니다.
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => acceptInvite(invite.partyId)}
                  style={{
                    padding: '10px 30px',
                    backgroundColor: '#4CAF50',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  수락
                </button>
                <button
                  onClick={() => declineInvite(invite.partyId)}
                  style={{
                    padding: '10px 30px',
                    backgroundColor: '#666',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Party Panel - Left side */}
      {currentParty && (
        <div
          style={{
            position: 'absolute',
            left: '10px',
            top: '120px',
            width: '180px',
            zIndex: 100,
            backgroundColor: 'rgba(20, 20, 30, 0.9)',
            borderRadius: '8px',
            border: '1px solid #4a4a6a',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: 'rgba(50, 50, 70, 0.8)',
              borderBottom: '1px solid #3a3a5a',
            }}
          >
            <span style={{ color: '#FFD700', fontSize: '12px', fontWeight: 'bold' }}>
              파티 ({currentParty.members.length}/4)
            </span>
            <button
              onClick={leaveParty}
              style={{
                backgroundColor: 'rgba(200, 50, 50, 0.6)',
                border: 'none',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '10px',
                padding: '3px 8px',
                cursor: 'pointer',
              }}
            >
              탈퇴
            </button>
          </div>

          {/* Members */}
          <div style={{ padding: '8px' }}>
            {currentParty.members.map((member) => (
              <PartyMemberCard
                key={member.id}
                member={member}
                isLeader={member.id === currentParty.leaderId}
                isCurrentPlayer={member.id === currentSocketId}
                canKick={isLeader}
                onKick={() => kickMember(member.id)}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 5px rgba(74, 158, 255, 0.5); }
          50% { box-shadow: 0 0 15px rgba(74, 158, 255, 0.8); }
          100% { box-shadow: 0 0 5px rgba(74, 158, 255, 0.5); }
        }
      `}</style>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export const PartyUI = memo(PartyUIComponent);
export default PartyUI;
