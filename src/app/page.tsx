'use client';

import React, { useState, useEffect } from 'react';
import { storage, getLocalDateString } from '../lib/storage';
import { Schedule, Task } from '../lib/types';
import CurrentActionPanel from '../components/CurrentActionPanel';
import PriorityList from '../components/PriorityList';
import TaskAccordion from '../components/TaskAccordion';
import LoadingScreen from '../components/LoadingScreen';
import TaskModal from '../components/TaskModal';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, Plus, ChevronLeft, ChevronRight, Timer, Sparkles, RefreshCw, Loader2, LogOut, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [activeDate, setActiveDate] = useState<string>('');
  const [activeDateOffset, setActiveDateOffset] = useState<number>(0);
  const [scheduleData, setScheduleData] = useState<{ schedule: Schedule | null; tasks: Task[] }>({
    schedule: null,
    tasks: []
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [viewMode, setViewMode] = useState<'category' | 'time'>('category');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        const todayStr = getLocalDateString(0);
        setActiveDate(todayStr);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.push('/login');
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    if (confirm('Keluar dari sesi Anda?')) {
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    if (!activeDate) return;
    const fetchSupabase = async () => {
      setIsFetching(true);
      const data = await storage.getScheduleByDate(activeDate);
      setScheduleData(data);
      setIsInitializing(false);
      setIsFetching(false);
    };
    fetchSupabase();
  }, [activeDate]);

  const changeDay = (direction: 'prev' | 'next') => {
    const offsetChange = direction === 'next' ? 1 : -1;
    const nextOffset = activeDateOffset + offsetChange;
    setSlideDirection(direction === 'next' ? 'left' : 'right');
    setActiveDateOffset(nextOffset);
    setActiveDate(getLocalDateString(nextOffset));
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 80;
    if (info.offset.x < -swipeThreshold) changeDay('next');
    else if (info.offset.x > swipeThreshold) changeDay('prev');
  };

  const handleToggleTask = async (taskId: string) => {
    const task = scheduleData.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic Update
    setScheduleData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, is_done: !t.is_done } : t)
    }));

    await storage.toggleTask(task);
    const data = await storage.getScheduleByDate(activeDate);
    setScheduleData(data);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'schedule_id' | 'is_done' | 'completed_time'>, dateStr: string) => {
    setIsFetching(true);
    if (editingTask) {
      await storage.updateTask(editingTask.id, taskData);
    } else {
      await storage.addTask(dateStr, taskData);
    }
    const data = await storage.getScheduleByDate(activeDate);
    setScheduleData(data);
    setIsFetching(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Yakin ingin menghapus jadwal ini secara permanen?')) {
      setIsFetching(true);
      await storage.deleteTask(taskId);
      const data = await storage.getScheduleByDate(activeDate);
      setScheduleData(data);
      setIsFetching(false);
    }
  };

  const handleDeleteAllTasks = async () => {
    if (confirm('Yakin ingin menghapus SEMUA jadwal pada hari ini? Tindakan ini tidak dapat dibatalkan.')) {
      setIsFetching(true);
      await storage.deleteAllTasksByDate(activeDate);
      const data = await storage.getScheduleByDate(activeDate);
      setScheduleData(data);
      setIsFetching(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const calculateAnalytics = () => {
    const tasks = scheduleData.tasks;
    if (tasks.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = tasks.filter(t => t.is_done);
    const score = Math.round((completed.length / tasks.length) * 100);
    return { percent: score, completed: completed.length, total: tasks.length };
  };

  const { percent, completed, total } = calculateAnalytics();

  if (isInitializing) {
    return <LoadingScreen message="Loading Your Schedule..." />;
  }

  const slideVariants = {
    enter: (dir: 'left' | 'right') => ({ x: dir === 'left' ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 'left' | 'right') => ({ x: dir === 'left' ? -300 : 300, opacity: 0 })
  };

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex justify-center selection:bg-indigo-500/20 selection:text-indigo-900 relative overflow-hidden">
      <div className="w-full max-w-md flex flex-col bg-white border-x border-zinc-200 relative min-h-screen shadow-2xl shadow-zinc-200/50">
        <div className="absolute top-0 left-0 right-0 h-[260px] bg-gradient-to-b from-indigo-50 via-violet-50/50 to-transparent pointer-events-none" />

        <header className="px-5 py-4 flex items-center justify-between border-b border-zinc-200 sticky top-0 bg-white/80 backdrop-blur-md z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Timer className="w-4 h-4 text-indigo-600" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-zinc-900 leading-none flex items-center gap-1.5">
                SPA {isFetching && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
              </h1>
              <span className="text-[9px] font-semibold tracking-wider text-zinc-500 uppercase font-mono">
                Personal Schedule App
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveDateOffset(0);
                setActiveDate(getLocalDateString(0));
              }}
              title="Refresh Hari Ini"
              className="p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/upload"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold tracking-wide text-white transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upload
            </Link>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-200 flex items-center justify-between z-10">
          <button onClick={() => changeDay('prev')} className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 shadow-sm">
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase font-bold flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" />
              {activeDateOffset === 0 ? 'HARI INI' : activeDateOffset === 1 ? 'BESOK' : activeDateOffset === -1 ? 'KEMARIN' : `HARI ${activeDateOffset > 0 ? '+' : ''}${activeDateOffset}`}
            </span>
            <h2 className="text-xs font-bold text-zinc-800 mt-0.5">
              {activeDate ? storage.formatIndonesianDate(activeDate) : 'Memuat Tanggal...'}
            </h2>
          </div>

          <button onClick={() => changeDay('next')} className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 shadow-sm">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4} onDragEnd={handleDragEnd} className="flex-grow overflow-y-auto px-5 py-6 space-y-6 z-10 active:cursor-grabbing select-none">
          <AnimatePresence custom={slideDirection} mode="wait">
            <motion.div key={activeDate} custom={slideDirection} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="space-y-6">

              <div className="flex flex-col py-5 px-6 bg-white rounded-3xl border border-zinc-200 shadow-sm backdrop-blur-md">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-zinc-800 tracking-wide uppercase">Skor Kepatuhan</h3>
                    <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{completed}/{total} Tugas Selesai</p>
                  </div>
                  <span className="text-3xl font-black text-zinc-900 leading-none tracking-tight">{percent}%</span>
                </div>

                <div className="h-3.5 w-full bg-zinc-100/80 rounded-full overflow-hidden mb-4 shadow-inner border border-zinc-200/50">
                  <motion.div className={`h-full rounded-full shadow-sm ${percent === 100 ? 'bg-indigo-500' : percent >= 90 ? 'bg-emerald-500' : percent >= 70 ? 'bg-teal-400' : percent >= 20 ? 'bg-amber-400' : 'bg-rose-500'}`} initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.8 }} />
                </div>

                <div className="text-center px-2 py-2.5 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-700">
                    {total === 0 ? '☕ Belum ada agenda. Tekan + untuk menambah!' : percent === 100 ? 'Sigma Rizz 🗿' : percent >= 90 ? 'Manteb 🔥' : percent >= 70 ? 'okeyy cukup baik 👍' : percent >= 20 ? 'Apalah, Ga Konsisten 🥴' : 'EMang lemah 💀'}
                  </p>
                </div>
              </div>

              <CurrentActionPanel tasks={scheduleData.tasks} onToggleTask={handleToggleTask} />
              <PriorityList tasks={scheduleData.tasks} onToggleTask={handleToggleTask} />

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('category')}
                      className={`text-xs font-bold tracking-wider uppercase pb-0.5 border-b-2 transition-all ${
                        viewMode === 'category' ? 'text-indigo-600 border-indigo-600' : 'text-zinc-400 border-transparent hover:text-zinc-500'
                      }`}
                    >
                      Kategori
                    </button>
                    <span className="text-zinc-300 text-xs">|</span>
                    <button
                      onClick={() => setViewMode('time')}
                      className={`text-xs font-bold tracking-wider uppercase pb-0.5 border-b-2 transition-all ${
                        viewMode === 'time' ? 'text-indigo-600 border-indigo-600' : 'text-zinc-400 border-transparent hover:text-zinc-500'
                      }`}
                    >
                      Urut Waktu
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-mono font-medium">Total: {scheduleData.tasks.length}</span>
                    {scheduleData.tasks.length > 0 && (
                      <button
                        onClick={handleDeleteAllTasks}
                        className="flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-600 font-bold bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-md transition-colors border border-rose-100"
                        title="Hapus Semua Tugas"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Semua
                      </button>
                    )}
                  </div>
                </div>
                <TaskAccordion 
                  tasks={scheduleData.tasks} 
                  onToggleTask={handleToggleTask} 
                  onEditTask={handleEditTask} 
                  onDeleteTask={handleDeleteTask} 
                  viewMode={viewMode}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <button onClick={handleOpenAddModal} className="absolute bottom-6 right-6 w-[52px] h-[52px] bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center justify-center text-white hover:bg-indigo-500 active:scale-[0.9] transition-all z-40 border border-indigo-400">
          <Plus className="w-7 h-7" />
        </button>

      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} activeDate={activeDate} initialData={editingTask} />
    </div>
  );
}
