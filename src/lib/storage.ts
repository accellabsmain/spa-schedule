import { Schedule, Task, IngestedScheduleJSON, DifficultyLevel } from './types';

// Helper to generate UUIDs
const generateUUID = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Key Names for localStorage
const SCHEDULES_KEY = 'spa_schedules';
const TASKS_KEY = 'spa_tasks';

// Get today and tomorrow dates in local YYYY-MM-DD format
export const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Seed Mock Data
const seedMockData = () => {
  const todayStr = getLocalDateString(0);
  const tomorrowStr = getLocalDateString(1);

  const mockSchedules: Schedule[] = [
    {
      id: 'sched-today',
      date: todayStr,
      overall_badge: 'On Time',
      created_at: new Date().toISOString()
    },
    {
      id: 'sched-tomorrow',
      date: tomorrowStr,
      created_at: new Date().toISOString()
    }
  ];

  const mockTasks: Task[] = [
    // Today's Tasks
    {
      id: 'task-1',
      schedule_id: 'sched-today',
      task_name: 'Meditasi Pagi & Jurnal Harian',
      target_time: '06:00:00',
      category: 'Morning Routine',
      notes: 'Fokus pada pernapasan perut selama 10 menit, lalu tulis 3 hal yang disyukuri.',
      is_done: true,
      completed_time: '06:03:00',
      tingkat_kesulitan: 'Rendah'
    },
    {
      id: 'task-2',
      schedule_id: 'sched-today',
      task_name: 'Deep Work: Desain Arsitektur MVP',
      target_time: '08:30:00',
      category: 'Deep Work',
      notes: 'Selesaikan rancangan UI Mobile-First dan integrasi data engine.',
      is_done: false,
      tingkat_kesulitan: 'Tinggi'
    },
    {
      id: 'task-3',
      schedule_id: 'sched-today',
      task_name: 'Evaluasi & Sync dengan Tim Bisnis',
      target_time: '11:00:00',
      category: 'Collaboration',
      notes: 'Bahas feedback dari presentasi proposal akselerasi.',
      is_done: false,
      tingkat_kesulitan: 'Sedang'
    },
    {
      id: 'task-4',
      schedule_id: 'sched-today',
      task_name: 'Istirahat Siang / Power Nap',
      target_time: '13:00:00',
      category: 'Rest',
      notes: 'Tidur sejenak selama 15-20 menit untuk menyegarkan stamina pikiran.',
      is_done: false,
      tingkat_kesulitan: 'Rendah'
    },
    {
      id: 'task-5',
      schedule_id: 'sched-today',
      task_name: 'Coding Refinement & Bug Fixing',
      target_time: '14:30:00',
      category: 'Deep Work',
      notes: 'Sempurnakan modul parser JSON agar tahan terhadap input salah format.',
      is_done: false,
      tingkat_kesulitan: 'Sedang'
    },
    {
      id: 'task-6',
      schedule_id: 'sched-today',
      task_name: 'Olahraga Sore / Light Cardio',
      target_time: '17:00:00',
      category: 'Rest',
      notes: 'Jogging santai di sekitar taman komplek atau stretching.',
      is_done: false,
      tingkat_kesulitan: 'Rendah'
    },
    // Tomorrow's Tasks
    {
      id: 'task-t1',
      schedule_id: 'sched-tomorrow',
      task_name: 'Morning Workout & Breakfast',
      target_time: '06:30:00',
      category: 'Morning Routine',
      notes: 'Stretching dinamis, plank 3 set, disusul sarapan kaya protein.',
      is_done: false,
      tingkat_kesulitan: 'Rendah'
    },
    {
      id: 'task-t2',
      schedule_id: 'sched-tomorrow',
      task_name: 'Deep Work: Implementasi Landing Page',
      target_time: '09:00:00',
      category: 'Deep Work',
      notes: 'Tulis CSS modular untuk komponen visual premium di mobile viewport.',
      is_done: false,
      tingkat_kesulitan: 'Tinggi'
    },
    {
      id: 'task-t3',
      schedule_id: 'sched-tomorrow',
      task_name: 'Review Code & Pull Requests',
      target_time: '14:00:00',
      category: 'Collaboration',
      notes: 'Periksa PR dari modul auth dan berikan catatan konstruktif.',
      is_done: false,
      tingkat_kesulitan: 'Sedang'
    }
  ];

  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(mockSchedules));
  localStorage.setItem(TASKS_KEY, JSON.stringify(mockTasks));
};

// Core Storage API
export const storage = {
  // Initialize and Seed if empty
  initialize: (): void => {
    if (typeof window === 'undefined') return;
    const currentSchedules = localStorage.getItem(SCHEDULES_KEY);
    const currentTasks = localStorage.getItem(TASKS_KEY);
    if (!currentSchedules || !currentTasks) {
      seedMockData();
    }
  },

  // Get all Schedules
  getSchedules: (): Schedule[] => {
    if (typeof window === 'undefined') return [];
    storage.initialize();
    const data = localStorage.getItem(SCHEDULES_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get all Tasks
  getAllTasks: (): Task[] => {
    if (typeof window === 'undefined') return [];
    storage.initialize();
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Get Tasks for a specific Schedule ID
  getTasksForSchedule: (scheduleId: string): Task[] => {
    const allTasks = storage.getAllTasks();
    return allTasks.filter(t => t.schedule_id === scheduleId);
  },

  // Get Schedule and Tasks by Date (YYYY-MM-DD)
  getScheduleByDate: (dateStr: string): { schedule: Schedule | null; tasks: Task[] } => {
    const schedules = storage.getSchedules();
    const foundSchedule = schedules.find(s => s.date === dateStr);
    if (!foundSchedule) {
      return { schedule: null, tasks: [] };
    }
    const tasks = storage.getTasksForSchedule(foundSchedule.id);
    return { schedule: foundSchedule, tasks };
  },

  // Save/Ingest a schedule from JSON
  saveScheduleJSON: (json: IngestedScheduleJSON): Schedule => {
    const schedules = storage.getSchedules();
    const allTasks = storage.getAllTasks();

    // Check if schedule for this date already exists
    const existingIndex = schedules.findIndex(s => s.date === json.date);
    let scheduleId: string;
    let newSchedule: Schedule;

    if (existingIndex >= 0) {
      // Overwrite / Update
      scheduleId = schedules[existingIndex].id;
      newSchedule = {
        ...schedules[existingIndex],
        created_at: new Date().toISOString()
      };
      schedules[existingIndex] = newSchedule;
    } else {
      // Create new
      scheduleId = 'sched-' + generateUUID();
      newSchedule = {
        id: scheduleId,
        date: json.date,
        created_at: new Date().toISOString()
      };
      schedules.push(newSchedule);
    }

    // Filter out old tasks of this schedule
    const filteredTasks = allTasks.filter(t => t.schedule_id !== scheduleId);

    // Add new tasks
    const newTasks: Task[] = json.tasks.map((t, idx) => ({
      id: `task-${scheduleId}-${idx}-${generateUUID()}`,
      schedule_id: scheduleId,
      task_name: t.task_name,
      target_time: t.target_time,
      category: t.category || 'Lainnya',
      notes: t.notes || '',
      is_done: false,
      tingkat_kesulitan: t.tingkat_kesulitan || 'Sedang'
    }));

    // Update localStorage
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
    localStorage.setItem(TASKS_KEY, JSON.stringify([...filteredTasks, ...newTasks]));

    return newSchedule;
  },

  // Add a new task manually
  addTask: (dateStr: string, taskData: Omit<Task, 'id' | 'schedule_id' | 'is_done' | 'completed_time'>): Task => {
    const schedules = storage.getSchedules();
    let schedule = schedules.find(s => s.date === dateStr);
    
    // If schedule doesn't exist for the day, create it
    if (!schedule) {
      schedule = {
        id: 'sched-' + generateUUID(),
        date: dateStr,
        created_at: new Date().toISOString()
      };
      schedules.push(schedule);
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
    }

    const newTask: Task = {
      ...taskData,
      id: `task-${schedule.id}-manual-${generateUUID()}`,
      schedule_id: schedule.id,
      is_done: false
    };

    const allTasks = storage.getAllTasks();
    allTasks.push(newTask);
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));

    return newTask;
  },

  // Update an existing task
  updateTask: (taskId: string, updates: Partial<Task>): Task => {
    const allTasks = storage.getAllTasks();
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Tugas tidak ditemukan.');

    const updatedTask = { ...allTasks[taskIndex], ...updates };
    allTasks[taskIndex] = updatedTask;
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    return updatedTask;
  },

  // Delete a task
  deleteTask: (taskId: string): void => {
    let allTasks = storage.getAllTasks();
    allTasks = allTasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
  },

  // Toggle Task Completion State
  toggleTask: (taskId: string): { task: Task; adherenceBadge: 'On Time' | 'Delayed' | 'Late' | undefined } => {
    const allTasks = storage.getAllTasks();
    const taskIndex = allTasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Tugas tidak ditemukan.');
    }

    const task = allTasks[taskIndex];
    task.is_done = !task.is_done;

    let badge: 'On Time' | 'Delayed' | 'Late' | undefined = undefined;

    if (task.is_done) {
      // Record completed time in HH:mm:ss local time
      const now = new Date();
      const timeStr = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
      ].join(':');
      
      task.completed_time = timeStr;

      // Calculate time difference in minutes
      badge = storage.calculateAdherenceBadge(task.target_time, timeStr);
    } else {
      task.completed_time = undefined;
    }

    allTasks[taskIndex] = task;
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));

    // Update overall schedule badge if all tasks are completed
    storage.updateScheduleOverallBadge(task.schedule_id);

    return { task, adherenceBadge: badge };
  },

  // Calculate adherence badge based on target time and completed time
  calculateAdherenceBadge: (targetTime: string, completedTime: string): 'On Time' | 'Delayed' | 'Late' => {
    // Parse times
    const [tH, tM, tS] = targetTime.split(':').map(Number);
    const [cH, cM, cS] = completedTime.split(':').map(Number);

    const targetMinutes = tH * 60 + tM;
    const completedMinutes = cH * 60 + cM;

    const diff = completedMinutes - targetMinutes;

    if (diff <= 5) {
      // Included if checked early
      return 'On Time';
    } else if (diff <= 30) {
      return 'Delayed';
    } else {
      return 'Late';
    }
  },

  // Update schedule overall status
  updateScheduleOverallBadge: (scheduleId: string) => {
    const schedules = storage.getSchedules();
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) return;

    const tasks = storage.getTasksForSchedule(scheduleId);
    const completedTasks = tasks.filter(t => t.is_done);

    if (completedTasks.length === 0) {
      schedules[scheduleIndex].overall_badge = undefined;
    } else {
      // Calculate overall score: percentage of On Time
      let onTimeCount = 0;
      let delayedCount = 0;
      let totalCount = completedTasks.length;

      completedTasks.forEach(t => {
        if (t.completed_time) {
          const badge = storage.calculateAdherenceBadge(t.target_time, t.completed_time);
          if (badge === 'On Time') onTimeCount++;
          if (badge === 'Delayed') delayedCount++;
        }
      });

      const score = ((onTimeCount + 0.5 * delayedCount) / totalCount) * 100;
      if (score >= 80) {
        schedules[scheduleIndex].overall_badge = 'On Time';
      } else if (score >= 50) {
        schedules[scheduleIndex].overall_badge = 'Delayed';
      } else {
        schedules[scheduleIndex].overall_badge = 'Late';
      }
    }

    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
  },

  // Helper to format date string to human-readable Indonesian format
  formatIndonesianDate: (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${days[date.getDay()]}, ${day} ${months[date.getMonth()]} ${year}`;
  }
};
