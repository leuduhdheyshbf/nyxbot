-- ============================================================
-- Nyx Bot V2 — Schema Supabase
-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query)
-- ============================================================

-- 1) Grupos ativos (já existia)
CREATE TABLE IF NOT EXISTS active_groups (
  group_id   text PRIMARY KEY,
  active     boolean DEFAULT true,
  expires_at bigint,
  created_at timestamptz DEFAULT now()
);

-- 2) Usuários (níveis, economia, casamento, etc.)
CREATE TABLE IF NOT EXISTS users (
  jid           text PRIMARY KEY,
  nome          text DEFAULT '',
  coins         integer DEFAULT 0,
  xp            integer DEFAULT 0,
  level         integer DEFAULT 1,
  daily         bigint DEFAULT 0,
  wins          integer DEFAULT 0,
  losses        integer DEFAULT 0,
  achievements  jsonb DEFAULT '[]'::jsonb,
  inventory     jsonb DEFAULT '[]'::jsonb,
  spouse        text DEFAULT NULL,
  married_at    bigint DEFAULT NULL,
  created_at    bigint DEFAULT (extract(epoch from now()) * 1000)::bigint,
  updated_at    timestamptz DEFAULT now()
);

-- Índices úteis para rank e casamento
CREATE INDEX IF NOT EXISTS idx_users_level_xp ON users (level DESC, xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_spouse ON users (spouse) WHERE spouse IS NOT NULL;

-- 3) Trigger para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4) RLS (opcional — se usar anon key no bot, libere leitura/escrita)
-- ATENÇÃO: no bot usamos a service/anon key no servidor.
-- Se a tabela estiver com RLS ON sem policy, as queries falham.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_groups ENABLE ROW LEVEL SECURITY;

-- Policy permissiva para o bot (ajuste se usar service_role)
DROP POLICY IF EXISTS "bot_users_all" ON users;
CREATE POLICY "bot_users_all" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "bot_groups_all" ON active_groups;
CREATE POLICY "bot_groups_all" ON active_groups
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Conferir:
-- SELECT * FROM users LIMIT 5;
-- SELECT * FROM active_groups LIMIT 5;
