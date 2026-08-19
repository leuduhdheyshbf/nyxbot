-- ============================================================
-- Nyx Bot V2 — Schema COMPLETO Supabase
-- Rode no SQL Editor (pode rodar mesmo se users/active_groups já existirem)
-- ============================================================

-- ---------- Grupos ativos ----------
CREATE TABLE IF NOT EXISTS active_groups (
  group_id   text PRIMARY KEY,
  active     boolean DEFAULT true,
  expires_at bigint,
  created_at timestamptz DEFAULT now()
);

-- ---------- Usuários (nível, coins, casamento) ----------
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

CREATE INDEX IF NOT EXISTS idx_users_level_xp ON users (level DESC, xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_spouse ON users (spouse) WHERE spouse IS NOT NULL;

-- ---------- VIP / Premium ----------
CREATE TABLE IF NOT EXISTS premium_users (
  jid        text PRIMARY KEY,
  added_at   bigint DEFAULT (extract(epoch from now()) * 1000)::bigint,
  added_by   text,
  expires_at bigint DEFAULT NULL,  -- null = permanente
  note       text DEFAULT ''
);

-- ---------- Donos extras (além do config.json) ----------
CREATE TABLE IF NOT EXISTS donos (
  jid        text PRIMARY KEY,
  nome       text DEFAULT '',
  added_at   bigint DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- ---------- Features globais do bot ----------
CREATE TABLE IF NOT EXISTS bot_features (
  key   text PRIMARY KEY,
  value boolean DEFAULT false
);

INSERT INTO bot_features (key, value) VALUES
  ('antidelete', true),
  ('viewonce', true),
  ('antilink', false),
  ('antiflood', false)
ON CONFLICT (key) DO NOTHING;

-- ---------- Warns ----------
CREATE TABLE IF NOT EXISTS warns (
  id         bigserial PRIMARY KEY,
  group_id   text NOT NULL,
  user_jid   text NOT NULL,
  reason     text DEFAULT '',
  by_jid     text,
  created_at bigint DEFAULT (extract(epoch from now()) * 1000)::bigint
);

CREATE INDEX IF NOT EXISTS idx_warns_group_user ON warns (group_id, user_jid);

-- ---------- Mutes ----------
CREATE TABLE IF NOT EXISTS mutes (
  group_id   text NOT NULL,
  user_jid   text NOT NULL,
  until_ts   bigint DEFAULT NULL,  -- null = mute permanente até unmute
  by_jid     text,
  reason     text DEFAULT '',
  PRIMARY KEY (group_id, user_jid)
);

-- ---------- AFK ----------
CREATE TABLE IF NOT EXISTS afk (
  jid        text PRIMARY KEY,
  reason     text DEFAULT '',
  since      bigint DEFAULT (extract(epoch from now()) * 1000)::bigint
);

-- ---------- Prefixos por grupo ----------
CREATE TABLE IF NOT EXISTS group_prefixes (
  group_id   text PRIMARY KEY,
  prefix     text NOT NULL
);

-- ---------- Trigger updated_at em users ----------
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

-- ---------- RLS + policies (bot precisa acessar) ----------
ALTER TABLE active_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE warns ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE afk ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_prefixes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'active_groups','users','premium_users','donos','bot_features',
    'warns','mutes','afk','group_prefixes'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS bot_all ON %I', t);
    EXECUTE format(
      'CREATE POLICY bot_all ON %I FOR ALL USING (true) WITH CHECK (true)',
      t
    );
  END LOOP;
END $$;

-- Conferir:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY 1;
