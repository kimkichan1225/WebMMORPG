import { usePlayerStore } from '../../stores/playerStore';
import type { ToolType } from '@shared/types';

interface ToolChangeUIProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ToolInfo {
  id: ToolType;
  name: string;
  nameKo: string;
  description: string;
  color: string;
  icon: string;
  skillName: string;
  resourceTypes: string[];
}

const TOOLS: ToolInfo[] = [
  {
    id: 'axe',
    name: 'Axe',
    nameKo: '도끼',
    description: '나무를 벌목할 수 있습니다. 나무, 단단한 나무를 채집합니다.',
    color: '#8B4513',
    icon: '🪓',
    skillName: '벌목',
    resourceTypes: ['나무', '단단한 나무'],
  },
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    nameKo: '곡괭이',
    description: '광물을 채광할 수 있습니다. 돌, 철광석, 금광석을 채집합니다.',
    color: '#708090',
    icon: '⛏️',
    skillName: '채광',
    resourceTypes: ['돌', '철광석', '금광석'],
  },
  {
    id: 'sickle',
    name: 'Sickle',
    nameKo: '낫',
    description: '약초를 채집할 수 있습니다. 허브, 마나꽃, 희귀약초를 채집합니다.',
    color: '#228B22',
    icon: '🌾',
    skillName: '채집',
    resourceTypes: ['허브', '마나꽃', '희귀약초'],
  },
];

export function ToolChangeUI({ isOpen, onClose }: ToolChangeUIProps) {
  const { tool, setTool } = usePlayerStore();

  if (!isOpen) return null;

  const handleToolSelect = (toolId: ToolType) => {
    setTool(toolId);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1a2e',
        border: '2px solid #444',
        borderRadius: '12px',
        padding: '20px',
        minWidth: '400px',
        maxWidth: '500px',
        zIndex: 100,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <h2 style={{ color: '#fff', margin: 0, fontFamily: 'Arial, sans-serif' }}>
          도구 변경
        </h2>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
          }}
        >
          X
        </button>
      </div>

      {/* Current Tool */}
      <div
        style={{
          backgroundColor: '#2a2a4a',
          padding: '10px 15px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <span style={{ color: '#aaa' }}>현재 도구: </span>
        <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
          {tool ? TOOLS.find(t => t.id === tool)?.nameKo || tool : '없음'}
        </span>
      </div>

      {/* Description */}
      <div
        style={{
          backgroundColor: '#222',
          padding: '10px',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '12px',
          color: '#aaa',
        }}
      >
        도구를 선택하면 해당 자원을 채집할 수 있습니다.
        <br />
        자원을 많이 채집하면 생활 스킬 레벨이 올라갑니다.
      </div>

      {/* Tool List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TOOLS.map((toolInfo) => {
          const isCurrentTool = tool === toolInfo.id;

          return (
            <div
              key={toolInfo.id}
              style={{
                backgroundColor: isCurrentTool ? '#3a3a6a' : '#2a2a4a',
                border: `2px solid ${isCurrentTool ? '#FFD700' : '#444'}`,
                borderRadius: '10px',
                padding: '15px',
                opacity: isCurrentTool ? 0.8 : 1,
                cursor: isCurrentTool ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => !isCurrentTool && handleToolSelect(toolInfo.id)}
              onMouseEnter={(e) => {
                if (!isCurrentTool) {
                  e.currentTarget.style.borderColor = '#666';
                  e.currentTarget.style.backgroundColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCurrentTool) {
                  e.currentTarget.style.borderColor = '#444';
                  e.currentTarget.style.backgroundColor = '#2a2a4a';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                {/* Tool Icon */}
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: toolInfo.color,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    marginRight: '15px',
                  }}
                >
                  {toolInfo.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '16px' }}>
                    {toolInfo.nameKo}
                    <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                      ({toolInfo.name})
                    </span>
                  </h3>
                  <div style={{ color: '#4CAF50', fontSize: '12px' }}>
                    스킬: {toolInfo.skillName}
                  </div>
                </div>

                {isCurrentTool && (
                  <div
                    style={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    장착중
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ color: '#aaa', fontSize: '12px', margin: '0 0 8px 0' }}>
                {toolInfo.description}
              </p>

              {/* Resource Types */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {toolInfo.resourceTypes.map((resource) => (
                  <span
                    key={resource}
                    style={{
                      backgroundColor: '#333',
                      color: '#ccc',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {resource}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div
        style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#2a3a2a',
          borderRadius: '6px',
          color: '#8f8',
          fontSize: '11px',
          textAlign: 'center',
        }}
      >
        Tip: E 키를 누른 채로 자원 근처에 가면 채집할 수 있습니다
      </div>
    </div>
  );
}
