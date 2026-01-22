import React, { useState, useEffect } from 'react';
import { useGuildStore } from '../../stores/guildStore';
import { useAuthStore } from '../../stores/authStore';
import type { GuildMember, GuildRank } from '@shared/types';

// Job colors
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

// Rank colors
const RANK_COLORS: Record<GuildRank, string> = {
  leader: '#FFD700',
  officer: '#4CAF50',
  member: '#888888',
};

// Rank labels
const RANK_LABELS: Record<GuildRank, string> = {
  leader: '길드장',
  officer: '임원',
  member: '멤버',
};

interface GuildWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'members' | 'settings';

export const GuildWindow: React.FC<GuildWindowProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState('');
  const [guildDescription, setGuildDescription] = useState('');

  const { selectedCharacter } = useAuthStore();
  const {
    currentGuild,
    pendingInvites,
    isLeader,
    isOfficer,
    isLoading,
    error,
    loadGuildData,
    createGuild,
    leaveGuild,
    kickMember,
    promoteMember,
    disbandGuild,
    acceptInvite,
    declineInvite,
    clearGuild,
  } = useGuildStore();

  // Load guild data when window opens
  useEffect(() => {
    if (isOpen && selectedCharacter) {
      loadGuildData(selectedCharacter.id);
    }
  }, [isOpen, selectedCharacter, loadGuildData]);

  if (!isOpen) return null;

  const handleCreateGuild = async () => {
    if (!selectedCharacter || !guildName.trim()) return;

    await createGuild(selectedCharacter.id, guildName.trim(), guildDescription.trim());
    setShowCreateGuild(false);
    setGuildName('');
    setGuildDescription('');
  };

  const handleLeaveGuild = async () => {
    if (!selectedCharacter) return;
    if (window.confirm('정말 길드를 탈퇴하시겠습니까?')) {
      await leaveGuild(selectedCharacter.id);
    }
  };

  const handleDisbandGuild = async () => {
    if (window.confirm('정말 길드를 해산하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      await disbandGuild();
    }
  };

  const handleKickMember = async (memberId: string) => {
    if (window.confirm('정말 이 멤버를 추방하시겠습니까?')) {
      await kickMember(memberId);
    }
  };

  const handlePromoteMember = async (memberId: string, currentRank: GuildRank) => {
    if (currentRank === 'leader') return;
    const newRank = currentRank === 'member' ? 'officer' : 'member';
    await promoteMember(memberId, newRank);
  };

  const renderMemberRow = (member: GuildMember) => {
    const isMe = member.characterId === selectedCharacter?.id;
    const canManage = (isLeader || isOfficer) && !isMe && member.rank !== 'leader';

    return (
      <div
        key={member.characterId}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          borderBottom: '1px solid #3a3a5a',
          backgroundColor: isMe ? 'rgba(100, 150, 100, 0.2)' : 'transparent',
        }}
      >
        {/* Online indicator */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: member.isOnline ? '#4CAF50' : '#666',
            marginRight: '10px',
          }}
        />

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: '#fff',
              fontSize: '13px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {member.name}
            {isMe && <span style={{ color: '#888', marginLeft: '4px' }}>(나)</span>}
          </div>
        </div>

        {/* Level */}
        <div style={{ width: '50px', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
          Lv.{member.level}
        </div>

        {/* Job */}
        <div
          style={{
            width: '70px',
            textAlign: 'center',
            color: JOB_COLORS[member.job] || '#888',
            fontSize: '11px',
          }}
        >
          {member.job}
        </div>

        {/* Rank */}
        <div
          style={{
            width: '50px',
            textAlign: 'center',
            color: RANK_COLORS[member.rank],
            fontSize: '11px',
            fontWeight: member.rank === 'leader' ? 'bold' : 'normal',
          }}
        >
          {RANK_LABELS[member.rank]}
        </div>

        {/* Actions */}
        {canManage && (
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {isLeader && (
              <button
                onClick={() => handlePromoteMember(member.characterId, member.rank)}
                style={{
                  backgroundColor: 'rgba(100, 150, 200, 0.5)',
                  border: 'none',
                  borderRadius: '3px',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '3px 6px',
                  cursor: 'pointer',
                }}
              >
                {member.rank === 'member' ? '임원' : '강등'}
              </button>
            )}
            <button
              onClick={() => handleKickMember(member.characterId)}
              style={{
                backgroundColor: 'rgba(200, 100, 100, 0.5)',
                border: 'none',
                borderRadius: '3px',
                color: '#fff',
                fontSize: '10px',
                padding: '3px 6px',
                cursor: 'pointer',
              }}
            >
              추방
            </button>
          </div>
        )}
      </div>
    );
  };

  // Sort members: leaders first, then officers, then by online status
  const sortedMembers = currentGuild
    ? [...currentGuild.members].sort((a, b) => {
        const rankOrder = { leader: 0, officer: 1, member: 2 };
        if (rankOrder[a.rank] !== rankOrder[b.rank]) {
          return rankOrder[a.rank] - rankOrder[b.rank];
        }
        if (a.isOnline !== b.isOnline) {
          return a.isOnline ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(30, 30, 45, 0.95)',
        border: '2px solid #5a5a7a',
        borderRadius: '12px',
        width: '450px',
        maxHeight: '80vh',
        zIndex: 1000,
        color: '#fff',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: 'rgba(60, 60, 90, 0.8)',
          borderBottom: '1px solid #5a5a7a',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '16px', color: '#FFD700' }}>
          {currentGuild ? currentGuild.name : '길드'}
        </h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 4px',
          }}
        >
          X
        </button>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div style={{ padding: '12px', borderBottom: '1px solid #3a3a5a' }}>
          <div style={{ color: '#FFD700', fontSize: '12px', marginBottom: '8px' }}>
            대기 중인 초대
          </div>
          {pendingInvites.map((invite) => (
            <div
              key={invite.guildId}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                backgroundColor: 'rgba(60, 80, 100, 0.5)',
                borderRadius: '4px',
                marginBottom: '4px',
              }}
            >
              <span>
                <span style={{ color: '#4a9eff' }}>{invite.guildName || invite.inviterName}</span>
                에서 초대
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => selectedCharacter && acceptInvite(invite.guildId, selectedCharacter.id)}
                  style={{
                    backgroundColor: '#4CAF50',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#fff',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  수락
                </button>
                <button
                  onClick={() => declineInvite(invite.guildId)}
                  style={{
                    backgroundColor: '#666',
                    border: 'none',
                    borderRadius: '3px',
                    color: '#fff',
                    padding: '4px 10px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(200, 50, 50, 0.3)',
            color: '#ff8888',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>로딩 중...</div>
      )}

      {/* No guild - show create option */}
      {!isLoading && !currentGuild && (
        <div style={{ padding: '20px' }}>
          {showCreateGuild ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                  길드 이름
                </label>
                <input
                  type="text"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  maxLength={30}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'rgba(50, 50, 70, 0.8)',
                    border: '1px solid #5a5a7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '14px',
                  }}
                  placeholder="길드 이름 입력"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                  길드 설명 (선택사항)
                </label>
                <textarea
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                  maxLength={200}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'rgba(50, 50, 70, 0.8)',
                    border: '1px solid #5a5a7a',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '13px',
                    resize: 'none',
                  }}
                  placeholder="길드에 대한 설명을 입력하세요"
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCreateGuild}
                  disabled={!guildName.trim()}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: guildName.trim() ? '#4CAF50' : '#444',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: guildName.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                  }}
                >
                  길드 생성
                </button>
                <button
                  onClick={() => setShowCreateGuild(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#666',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#888', marginBottom: '16px' }}>
                소속된 길드가 없습니다.
              </p>
              <button
                onClick={() => setShowCreateGuild(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4a6eff',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                길드 생성하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guild content */}
      {!isLoading && currentGuild && (
        <>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #3a3a5a',
            }}
          >
            <button
              onClick={() => setActiveTab('members')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: activeTab === 'members' ? 'rgba(80, 80, 120, 0.5)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'members' ? '2px solid #4a6eff' : '2px solid transparent',
                color: activeTab === 'members' ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              멤버 ({currentGuild.members.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: activeTab === 'settings' ? 'rgba(80, 80, 120, 0.5)' : 'transparent',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '2px solid #4a6eff' : '2px solid transparent',
                color: activeTab === 'settings' ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              설정
            </button>
          </div>

          {/* Tab content */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activeTab === 'members' && (
              <div>
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(50, 50, 70, 0.5)',
                    borderBottom: '1px solid #3a3a5a',
                    fontSize: '11px',
                    color: '#888',
                  }}
                >
                  <div style={{ width: '18px' }}></div>
                  <div style={{ flex: 1 }}>이름</div>
                  <div style={{ width: '50px', textAlign: 'center' }}>레벨</div>
                  <div style={{ width: '70px', textAlign: 'center' }}>직업</div>
                  <div style={{ width: '50px', textAlign: 'center' }}>계급</div>
                  {(isLeader || isOfficer) && <div style={{ width: '80px' }}></div>}
                </div>
                {/* Member list */}
                {sortedMembers.map(renderMemberRow)}
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ padding: '16px' }}>
                {/* Guild description */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '8px' }}>길드 설명</div>
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(50, 50, 70, 0.5)',
                      borderRadius: '4px',
                      color: '#ccc',
                      fontSize: '13px',
                      minHeight: '60px',
                    }}
                  >
                    {currentGuild.description || '설명이 없습니다.'}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!isLeader && (
                    <button
                      onClick={handleLeaveGuild}
                      style={{
                        padding: '12px',
                        backgroundColor: '#c94444',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      길드 탈퇴
                    </button>
                  )}
                  {isLeader && (
                    <button
                      onClick={handleDisbandGuild}
                      style={{
                        padding: '12px',
                        backgroundColor: '#881111',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      길드 해산
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GuildWindow;
