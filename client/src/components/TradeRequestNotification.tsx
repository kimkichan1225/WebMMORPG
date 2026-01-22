import React from 'react';
import { useTradeStore } from '../stores/tradeStore';

export const TradeRequestNotification: React.FC = () => {
  const { pendingRequests, acceptRequest, declineRequest } = useTradeStore();

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1200,
      }}
    >
      {pendingRequests.map((request) => (
        <div
          key={request.fromId}
          style={{
            backgroundColor: 'rgba(30, 40, 60, 0.98)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '10px',
            border: '3px solid #FFD700',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
            minWidth: '280px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: '#FFD700',
              fontSize: '14px',
              marginBottom: '12px',
              fontWeight: 'bold',
            }}
          >
            거래 요청
          </div>
          <div style={{ color: '#fff', fontSize: '15px', marginBottom: '16px' }}>
            <span style={{ color: '#4a9eff', fontWeight: 'bold' }}>
              {request.fromName}
            </span>
            님이 거래를 요청했습니다.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => acceptRequest(request.fromId)}
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
              onClick={() => declineRequest(request.fromId)}
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
  );
};

export default TradeRequestNotification;
