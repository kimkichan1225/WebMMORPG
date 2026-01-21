import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface LoginScreenProps {
  onSwitchToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await signIn(email, password);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="game-title">
          <h1>Skeleton MMORPG</h1>
          <p>해골 대모험</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>로그인</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>

          <p className="switch-text">
            계정이 없으신가요?{' '}
            <button type="button" onClick={onSwitchToSignup} disabled={isLoading}>
              회원가입
            </button>
          </p>
        </form>
      </div>

      <style>{`
        .auth-screen {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-container {
          text-align: center;
        }

        .game-title {
          margin-bottom: 30px;
        }

        .game-title h1 {
          font-size: 48px;
          color: #fff;
          text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
          margin: 0;
        }

        .game-title p {
          font-size: 18px;
          color: #aaa;
          margin: 10px 0 0 0;
        }

        .auth-form {
          background: rgba(30, 30, 50, 0.9);
          padding: 30px 40px;
          border-radius: 12px;
          border: 1px solid #4a4a6a;
          min-width: 350px;
        }

        .auth-form h2 {
          color: #fff;
          margin: 0 0 20px 0;
          font-size: 24px;
        }

        .error-message {
          background: rgba(200, 50, 50, 0.3);
          border: 1px solid #c33;
          padding: 10px;
          border-radius: 6px;
          color: #faa;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 15px;
          text-align: left;
        }

        .form-group label {
          display: block;
          color: #aaa;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          background: rgba(20, 20, 40, 0.8);
          border: 1px solid #4a4a6a;
          border-radius: 6px;
          color: #fff;
          font-size: 16px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #6a8aaa;
        }

        .form-group input:disabled {
          opacity: 0.6;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(180deg, #4a6a8a, #3a5a7a);
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #5a7a9a, #4a6a8a);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .switch-text {
          margin-top: 20px;
          color: #888;
          font-size: 14px;
        }

        .switch-text button {
          background: none;
          border: none;
          color: #6a9aca;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
        }

        .switch-text button:hover {
          color: #8abaea;
        }
      `}</style>
    </div>
  );
};
