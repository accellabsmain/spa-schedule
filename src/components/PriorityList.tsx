'use client';

import React from 'react';
import { Task, DifficultyLevel } from '../lib/types';
import { motion } from 'framer-motion';
import { Flame, Clock } from 'lucide-react';

interface PriorityListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
}

const difficultyWeight = (diff: DifficultyLevel): number => {
  switch (diff) {
    case 'Tinggi': return 3;
    case 'Sedang': return 2;
    case 'Rendah': return 1;
    default: return 0;
  }
};

const getDifficultyStyle = (diff: DifficultyLevel) => {
  switch (diff) {
    case 'Tinggi':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'Sedang':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'Rendah':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
};

export default function PriorityList({ tasks, onToggleTask }: PriorityListProps) {
  const remainingTasks = tasks.filter(t => !t.is_done);

  const sortedPriority = [...remainingTasks].sort((a, b) => {
    const diffWeightA = difficultyWeight(a.tingkat_kesulitan);
    const diffWeightB = difficultyWeight(b.tingkat_kesulitan);

    if (diffWeightB !== diffWeightA) {
      return diffWeightB - diffWeightA;
    }

    return a.target_time.localeCompare(b.target_time);
  });

  const topPriorities = sortedPriority.slice(0, 3);

  if (topPriorities.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-rose-500" />
        <h3 className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
          Fokus Prioritas Hari Ini
        </h3>
      </div>

      <div className="space-y-2">
        {topPriorities.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onToggleTask(task.id)}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 cursor-pointer transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border border-zinc-300 bg-white flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-bold text-zinc-600">{idx + 1}</span>
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-sm font-semibold text-zinc-800 tracking-wide line-clamp-1">
                  {task.task_name}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-0.5">
                    <Clock className="w-3 h-3 text-zinc-400" /> {task.target_time.substring(0, 5)}
                  </span>
                  <span className="text-[10px] text-zinc-300">•</span>
                  <span className="text-[10px] text-zinc-500 font-medium">{task.category}</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${getDifficultyStyle(task.tingkat_kesulitan)}`}>
                {task.tingkat_kesulitan}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
