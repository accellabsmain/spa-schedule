import { Schedule, Task, IngestedScheduleJSON } from './types';
import { supabase } from './supabase';

const generateUUID = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const storage = {
  // Fetch from Supabase
  getScheduleByDate: async (dateStr: string): Promise<{ schedule: Schedule | null; tasks: Task[] }> => {
    const { data: schedule } = await supabase.from('schedules').select('*').eq('date', dateStr).maybeSingle();
    if (!schedule) return { schedule: null, tasks: [] };

    const { data: tasks } = await supabase.from('tasks').select('*').eq('schedule_id', schedule.id);
    return { schedule, tasks: tasks || [] };
  },

  saveScheduleJSON: async (json: IngestedScheduleJSON): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Pengguna tidak terautentikasi. Silakan login kembali.');

    // Group tasks by their date
    const tasksByDate: { [key: string]: typeof json.tasks } = {};
    for (const task of json.tasks) {
      const taskDate = task.date || json.date;
      if (!tasksByDate[taskDate]) {
        tasksByDate[taskDate] = [];
      }
      tasksByDate[taskDate].push(task);
    }

    // Process each date group
    for (const [dateStr, tasks] of Object.entries(tasksByDate)) {
      let { data: schedule } = await supabase.from('schedules').select('*').eq('date', dateStr).maybeSingle();
      
      if (schedule) {
        await supabase.from('schedules').update({ created_at: new Date().toISOString() }).eq('id', schedule.id);
      } else {
        const newSchedule = { 
          id: 'sched-' + generateUUID(), 
          user_id: userId,
          date: dateStr, 
          created_at: new Date().toISOString() 
        };
        const { data, error } = await supabase.from('schedules').insert([newSchedule]).select().single();
        if (error) throw new Error(`Gagal membuat jadwal baru untuk tanggal ${dateStr}: ${error.message}`);
        schedule = data;
      }

      if (!schedule) {
        throw new Error(`Gagal memproses jadwal untuk tanggal ${dateStr}.`);
      }

      const newTasks = tasks.map((t, idx) => ({
        id: `task-${schedule!.id}-${idx}-${generateUUID()}`,
        user_id: userId,
        schedule_id: schedule!.id,
        task_name: t.task_name,
        target_time: t.target_time,
        category: t.category || 'Lainnya',
        notes: t.notes || '',
        is_done: false,
        tingkat_kesulitan: t.tingkat_kesulitan || 'Sedang'
      }));

      const { error: tasksError } = await supabase.from('tasks').insert(newTasks);
      if (tasksError) throw new Error(`Gagal menyimpan daftar tugas untuk tanggal ${dateStr}: ${tasksError.message}`);
    }
  },

  addTask: async (dateStr: string, taskData: Omit<Task, 'id' | 'schedule_id' | 'is_done' | 'completed_time'>): Promise<Task> => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Pengguna tidak terautentikasi. Silakan login kembali.');

    let { data: schedule } = await supabase.from('schedules').select('*').eq('date', dateStr).maybeSingle();
    if (!schedule) {
      const newSchedule = { 
        id: 'sched-' + generateUUID(), 
        user_id: userId,
        date: dateStr, 
        created_at: new Date().toISOString() 
      };
      const { data, error } = await supabase.from('schedules').insert([newSchedule]).select().single();
      if (error) throw new Error(`Gagal membuat jadwal baru: ${error.message}`);
      schedule = data;
    }

    if (!schedule) {
      throw new Error('Gagal memproses jadwal.');
    }

    const newTask = {
      ...taskData,
      id: `task-${schedule.id}-manual-${generateUUID()}`,
      user_id: userId,
      schedule_id: schedule.id,
      is_done: false
    };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
    if (error) throw new Error(`Gagal menambahkan tugas baru: ${error.message}`);
    return data;
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const { data } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
    return data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await supabase.from('tasks').delete().eq('id', taskId);
  },

  deleteAllTasksByDate: async (dateStr: string): Promise<void> => {
    const { data: schedule } = await supabase.from('schedules').select('id').eq('date', dateStr).maybeSingle();
    if (!schedule) return;

    await supabase.from('tasks').delete().eq('schedule_id', schedule.id);
  },

  toggleTask: async (task: Task): Promise<{ task: Task; adherenceBadge: 'On Time' | 'Delayed' | 'Late' | undefined }> => {
    const isDone = !task.is_done;
    let timeStr: string | undefined = undefined;
    let badge: 'On Time' | 'Delayed' | 'Late' | undefined = undefined;

    if (isDone) {
      const now = new Date();
      timeStr = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0'), String(now.getSeconds()).padStart(2, '0')].join(':');
      badge = storage.calculateAdherenceBadge(task.target_time, timeStr);
    }

    const { data: updatedTask } = await supabase.from('tasks').update({ 
      is_done: isDone, 
      completed_time: timeStr || null 
    }).eq('id', task.id).select().single();

    return { task: updatedTask, adherenceBadge: badge };
  },

  calculateAdherenceBadge: (targetTime: string, completedTime: string): 'On Time' | 'Delayed' | 'Late' => {
    const [tH, tM] = targetTime.split(':').map(Number);
    const [cH, cM] = completedTime.split(':').map(Number);
    const diff = (cH * 60 + cM) - (tH * 60 + tM);
    if (diff <= 5) return 'On Time';
    else if (diff <= 30) return 'Delayed';
    else return 'Late';
  },

  formatIndonesianDate: (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${day} ${months[date.getMonth()]} ${year}`;
  }
};
