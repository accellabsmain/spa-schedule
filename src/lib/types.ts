export interface Schedule {
  id: string;
  date: string; // Format: YYYY-MM-DD
  overall_badge?: string; // e.g., "On Time", "Delayed", "Late"
  created_at: string;
}

export type DifficultyLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export interface Task {
  id: string;
  schedule_id: string;
  task_name: string;
  target_time: string; // Format: HH:mm:ss
  completed_time?: string; // Format: HH:mm:ss
  category: string;
  notes?: string;
  is_done: boolean;
  tingkat_kesulitan: DifficultyLevel;
}

export interface IngestedTask {
  task_name: string;
  target_time: string; // Format: HH:mm:ss
  category: string;
  notes?: string;
  tingkat_kesulitan: DifficultyLevel;
}

export interface IngestedScheduleJSON {
  date: string; // Format: YYYY-MM-DD
  tasks: IngestedTask[];
}
