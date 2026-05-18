-- Buat tabel schedules (Dengan Auth User ID)
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  overall_badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buat tabel tasks (Dengan Auth User ID)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  target_time TIME NOT NULL,
  category TEXT DEFAULT 'Lainnya',
  notes TEXT,
  is_done BOOLEAN DEFAULT false,
  completed_time TIME,
  tingkat_kesulitan TEXT DEFAULT 'Sedang'
);

-- AKTIFKAN RLS (Row Level Security) agar aman
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 🛡️ POLICIES UNTUK SCHEDULES (Hanya pengguna login yang bisa melihat jadwal miliknya)
CREATE POLICY "Schedules Select" ON schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Schedules Insert" ON schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Schedules Update" ON schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Schedules Delete" ON schedules FOR DELETE USING (auth.uid() = user_id);

-- 🛡️ POLICIES UNTUK TASKS (Hanya pengguna login yang bisa melihat tugas miliknya)
CREATE POLICY "Tasks Select" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Tasks Insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tasks Update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Tasks Delete" ON tasks FOR DELETE USING (auth.uid() = user_id);
