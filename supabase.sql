-- Buat tabel schedules
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  overall_badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat tabel tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  target_time TIME NOT NULL,
  category TEXT DEFAULT 'Lainnya',
  notes TEXT,
  is_done BOOLEAN DEFAULT false,
  completed_time TIME,
  tingkat_kesulitan TEXT DEFAULT 'Sedang'
);

-- Matikan RLS agar kita bisa langsung baca/tulis tanpa sistem login (untuk keperluan MVP)
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
