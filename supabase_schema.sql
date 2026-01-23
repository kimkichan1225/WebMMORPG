-- =====================================================
-- Web-MMORPG Supabase Schema
-- 새 Supabase 프로젝트에서 SQL Editor에 복사하여 실행하세요
-- =====================================================

-- UUID 확장 활성화 (이미 활성화되어 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. Characters 테이블 (캐릭터 정보)
-- =====================================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL UNIQUE,
  job VARCHAR(20) NOT NULL DEFAULT 'Base',
  level INTEGER NOT NULL DEFAULT 1,
  exp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  hp INTEGER NOT NULL DEFAULT 100,
  mp INTEGER NOT NULL DEFAULT 50,
  max_hp INTEGER NOT NULL DEFAULT 100,
  max_mp INTEGER NOT NULL DEFAULT 50,
  attack INTEGER NOT NULL DEFAULT 10,
  defense INTEGER NOT NULL DEFAULT 5,
  x REAL NOT NULL DEFAULT 400,
  y REAL NOT NULL DEFAULT 300,
  map_id VARCHAR(50) NOT NULL DEFAULT 'starter_village',
  str INTEGER NOT NULL DEFAULT 5,
  dex INTEGER NOT NULL DEFAULT 5,
  int INTEGER NOT NULL DEFAULT 5,
  vit INTEGER NOT NULL DEFAULT 5,
  luk INTEGER NOT NULL DEFAULT 5,
  stat_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Characters 인덱스
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);

-- =====================================================
-- 2. Inventory 테이블 (인벤토리)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_id VARCHAR(100) NOT NULL,
  item_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  slot INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(character_id, item_id)
);

-- Inventory 인덱스
CREATE INDEX IF NOT EXISTS idx_inventory_character_id ON inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item_id ON inventory(item_id);

-- =====================================================
-- 3. Equipment 테이블 (장착 장비)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  slot VARCHAR(20) NOT NULL,
  item_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(character_id, slot)
);

-- Equipment 인덱스
CREATE INDEX IF NOT EXISTS idx_equipment_character_id ON equipment(character_id);

-- =====================================================
-- 4. Character Quests 테이블 (퀘스트 진행)
-- =====================================================
CREATE TABLE IF NOT EXISTS character_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  quest_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  progress JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(character_id, quest_id)
);

-- Character Quests 인덱스
CREATE INDEX IF NOT EXISTS idx_character_quests_character_id ON character_quests(character_id);
CREATE INDEX IF NOT EXISTS idx_character_quests_status ON character_quests(status);

-- =====================================================
-- 5. Guilds 테이블 (길드)
-- =====================================================
CREATE TABLE IF NOT EXISTS guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Guilds 인덱스
CREATE INDEX IF NOT EXISTS idx_guilds_name ON guilds(name);
CREATE INDEX IF NOT EXISTS idx_guilds_leader_id ON guilds(leader_id);

-- =====================================================
-- 6. Guild Members 테이블 (길드 멤버)
-- =====================================================
CREATE TABLE IF NOT EXISTS guild_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  rank VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(character_id)
);

-- Guild Members 인덱스
CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_character_id ON guild_members(character_id);

-- =====================================================
-- Row Level Security (RLS) 정책
-- =====================================================

-- Characters RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters" ON characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own characters" ON characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON characters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own characters" ON characters
  FOR DELETE USING (auth.uid() = user_id);

-- Inventory RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory" ON inventory
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own inventory" ON inventory
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own inventory" ON inventory
  FOR UPDATE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own inventory" ON inventory
  FOR DELETE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Equipment RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own equipment" ON equipment
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own equipment" ON equipment
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own equipment" ON equipment
  FOR UPDATE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own equipment" ON equipment
  FOR DELETE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Character Quests RLS
ALTER TABLE character_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests" ON character_quests
  FOR SELECT USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own quests" ON character_quests
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own quests" ON character_quests
  FOR UPDATE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own quests" ON character_quests
  FOR DELETE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Guilds RLS
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guilds" ON guilds
  FOR SELECT USING (true);

CREATE POLICY "Users can create guilds" ON guilds
  FOR INSERT WITH CHECK (
    leader_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Guild leaders can update guild" ON guilds
  FOR UPDATE USING (
    leader_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Guild leaders can delete guild" ON guilds
  FOR DELETE USING (
    leader_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Guild Members RLS
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guild members" ON guild_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join guilds" ON guild_members
  FOR INSERT WITH CHECK (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can leave guilds" ON guild_members
  FOR DELETE USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
    OR
    guild_id IN (
      SELECT g.id FROM guilds g
      JOIN characters c ON g.leader_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Guild leaders can update member ranks" ON guild_members
  FOR UPDATE USING (
    guild_id IN (
      SELECT g.id FROM guilds g
      JOIN characters c ON g.leader_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

-- =====================================================
-- 자동 updated_at 업데이트 함수 및 트리거
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 완료!
-- =====================================================
-- 이 스크립트 실행 후:
-- 1. Supabase Dashboard > Settings > API에서 URL과 anon key 복사
-- 2. .env 파일에 다음 환경변수 설정:
--    VITE_SUPABASE_URL=your_supabase_url
--    VITE_SUPABASE_ANON_KEY=your_anon_key
-- =====================================================
