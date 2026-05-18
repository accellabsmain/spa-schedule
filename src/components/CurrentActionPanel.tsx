'use client';

import React, { useState, useEffect } from 'react';
import { Task, DifficultyLevel } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, PlayCircle, ShieldAlert } from 'lucide-react';

interface CurrentActionPanelProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

const timeToMinutes = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2) return 0;
  return parts[0] * 60 + parts[1];
};

const getCurrentTimeStr = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export default function CurrentActionPanel({ tasks, onToggleTask }: CurrentActionPanelProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(getCurrentTimeStr());
    const timer = setInterval(() => setCurrentTime(getCurrentTimeStr()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!currentTime || tasks.length === 0) return null;

  const currentMinutes = timeToMinutes(currentTime);

  const overdueTasks = tasks.filter(t => {
    if (t.is_done) return false;
    const taskMinutes = timeToMinutes(t.target_time);
    return currentMinutes - taskMinutes > 5;
  });

  const sortedTasks = [...tasks].sort((a, b) => timeToMinutes(a.target_time) - timeToMinutes(b.target_time));

  let activeTask: Task | null = null;
  let nextTask: Task | null = null;

  for (let i = 0; i < sortedTasks.length; i++) {
    const taskMin = timeToMinutes(sortedTasks[i].target_time);
    const nextTaskMin = i < sortedTasks.length - 1 ? timeToMinutes(sortedTasks[i + 1].target_time) : 1440;

    if (currentMinutes >= taskMin && currentMinutes < nextTaskMin) {
      activeTask = sortedTasks[i];
      nextTask = i < sortedTasks.length - 1 ? sortedTasks[i + 1] : null;
      break;
    }
  }

  if (sortedTasks.length > 0 && currentMinutes < timeToMinutes(sortedTasks[0].target_time)) {
    nextTask = sortedTasks[0];
  }

  const getDifficultyColor = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Tinggi': return 'text-rose-600 bg-rose-100 border-rose-200';
      case 'Sedang': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'Rendah': return 'text-emerald-600 bg-emerald-100 border-emerald-200';
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm"
          >
            <div className="absolute top-0 left-0 bottom-0 w-[4px] bg-rose-500" />
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-1.5 rounded-lg bg-rose-100 text-rose-600 animate-pulse mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="flex-grow space-y-2">
                <h4 className="text-sm font-bold tracking-wide text-rose-800">
                  ⚠️ Ini Harus Dikerjain Dulu!
                </h4>
                <p className="text-xs text-rose-600 leading-relaxed font-medium">
                  Ada jadwal yang terlewatkan dan belum dicentang. Selesaikan segera:
                </p>
                <div className="space-y-1.5 pt-1">
                  {overdueTasks.map(ot => (
                    <div
                      key={ot.id}
                      onClick={() => onToggleTask(ot.id)}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white hover:bg-rose-100/50 border border-rose-100 cursor-pointer transition-all duration-200 active:scale-[0.98] shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          {ot.target_time.substring(0, 5)}
                        </span>
                        <span className="text-xs font-semibold text-rose-900 line-clamp-1">{ot.task_name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-400 flex-shrink-0">
                        Selesaikan ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-md shadow-zinc-200/50">
        <div className="absolute top-0 right-0 p-3 text-[10px] font-mono font-bold text-zinc-500 flex items-center gap-1.5 bg-zinc-50 rounded-bl-xl border-l border-b border-zinc-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          SYNC: {currentTime.substring(0, 5)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
              Harus Ngapain Saat Ini
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {activeTask ? (
              <motion.div
                key={activeTask.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2 pt-1"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-zinc-900 tracking-wide leading-snug">
                      {activeTask.task_name}
                    </h2>
                    {activeTask.notes && (
                      <p className="text-xs text-zinc-500 leading-relaxed max-w-[85%] font-medium">
                        {activeTask.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onToggleTask(activeTask!.id)}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm ${
                      activeTask.is_done
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-zinc-300 bg-white text-transparent hover:border-indigo-400'
                    }`}
                  >
                    ✓
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100">
                  <span className="text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    ⏱️ Target: {activeTask.target_time.substring(0, 5)}
                  </span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${getDifficultyColor(activeTask.tingkat_kesulitan)}`}>
                    💪 Kesulitan: {activeTask.tingkat_kesulitan}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                    🏷️ {activeTask.category}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-task"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center"
              >
                <Clock className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-500">
                  {nextTask 
                    ? `Tidak ada tugas aktif sekarang. Jadwal berikutnya jam ${nextTask.target_time.substring(0, 5)}.` 
                    : 'Semua jadwal tugas untuk hari ini telah selesai!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
