import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { signUp, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setLocalError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    const success = await signUp(email, password);
    if (success) {
      // Successfully signed up, will redirect automatically
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="game-title">
          <h1>Skeleton MMORPG</h1>
          <p>해골 대모험</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>회원가입</h2>

          {displayError && <div className="error-message">{displayError}</div>}

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
              placeholder="6자 이상"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 재입력"
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>

          <p className="switch-text">
            이미 계정이 있으신가요?{' '}
            <button type="button" onClick={onSwitchToLogin} disabled={isLoading}>
              로그인
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
          background: linear-gradient(180deg, #4a8a6a, #3a7a5a);
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
          background: linear-gradient(180deg, #5a9a7a, #4a8a6a);
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
