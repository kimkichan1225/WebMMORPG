import { usePlayerStore } from '../stores/playerStore';
import type { ToolType } from '../stores/playerStore';
import { drawWeapon } from '../game/weapons';
import { useRef, useEffect } from 'react';

const TOOLS: { type: ToolType; name: string; description: string }[] = [
  { type: 'axe', name: '도끼', description: '나무를 벨 수 있습니다' },
  { type: 'pickaxe', name: '곡괭이', description: '광석을 캘 수 있습니다' },
  { type: 'sickle', name: '낫', description: '약초를 수확할 수 있습니다' },
];

function ToolPreview({ tool }: { tool: ToolType }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 80, 80);
    drawWeapon(ctx, tool, 40, 50, 0, 0.8);
  }, [tool]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={80}
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
}

export function ToolSelect() {
  const { setTool, toolSelected } = usePlayerStore();

  if (toolSelected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          color: '#fff',
          marginBottom: '10px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        도구 선택
      </h1>
      <p
        style={{
          color: '#aaa',
          marginBottom: '40px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        게임에서 사용할 도구를 선택하세요
      </p>

      <div
        style={{
          display: 'flex',
          gap: '30px',
        }}
      >
        {TOOLS.map((tool) => (
          <button
            key={tool.type}
            onClick={() => setTool(tool.type)}
            style={{
              padding: '20px',
              backgroundColor: '#2a2a4a',
              border: '2px solid #444',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '150px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3a3a6a';
              e.currentTarget.style.borderColor = '#666';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2a2a4a';
              e.currentTarget.style.borderColor = '#444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <ToolPreview tool={tool.type} />
            <h3
              style={{
                color: '#fff',
                margin: '10px 0 5px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {tool.name}
            </h3>
            <p
              style={{
                color: '#888',
                fontSize: '12px',
                margin: 0,
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {tool.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
