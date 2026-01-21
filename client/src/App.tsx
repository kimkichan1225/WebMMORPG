import { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignupScreen } from './components/auth/SignupScreen';
import { CharacterSelect } from './components/auth/CharacterSelect';
import { Game } from './components/Game';
import './index.css';

type ScreenType = 'login' | 'signup' | 'character-select' | 'game';

function App() {
  const [screen, setScreen] = useState<ScreenType>('login');
  const { user, selectedCharacter, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (user) {
      if (selectedCharacter) {
        setScreen('game');
      } else {
        setScreen('character-select');
      }
    } else {
      setScreen('login');
    }
  }, [user, selectedCharacter]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>Skeleton MMORPG</h1>
          <p>로딩 중...</p>
          <div className="spinner"></div>
        </div>
        <style>{`
          .loading-screen {
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
          }
          .loading-content {
            text-align: center;
          }
          .loading-content h1 {
            font-size: 48px;
            margin: 0;
            text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
          }
          .loading-content p {
            color: #aaa;
            margin: 20px 0;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(100, 200, 255, 0.3);
            border-top-color: #6ac;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  switch (screen) {
    case 'login':
      return <LoginScreen onSwitchToSignup={() => setScreen('signup')} />;
    case 'signup':
      return <SignupScreen onSwitchToLogin={() => setScreen('login')} />;
    case 'character-select':
      return <CharacterSelect onStartGame={() => setScreen('game')} />;
    case 'game':
      return <Game />;
    default:
      return <LoginScreen onSwitchToSignup={() => setScreen('signup')} />;
  }
}

export default App;
