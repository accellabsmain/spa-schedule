'use client';

import React, { useState } from 'react';
import { Task, DifficultyLevel } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sunrise, Brain, Users, Moon, CheckCircle2, ChevronDown, ChevronUp, FileText, Edit3, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';

interface TaskAccordionProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

const getCategoryIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes('morning') || norm.includes('pagi') || norm.includes('rutinitas')) {
    return <Sunrise className="w-4 h-4 text-amber-500" />;
  }
  if (norm.includes('deep') || norm.includes('work') || norm.includes('coding') || norm.includes('fokus')) {
    return <Brain className="w-4 h-4 text-indigo-500" />;
  }
  if (norm.includes('team') || norm.includes('collaboration') || norm.includes('kolaborasi') || norm.includes('sync')) {
    return <Users className="w-4 h-4 text-sky-500" />;
  }
  if (norm.includes('rest') || norm.includes('istirahat') || norm.includes('nap') || norm.includes('tidur')) {
    return <Moon className="w-4 h-4 text-rose-500" />;
  }
  return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
};

export default function TaskAccordion({ tasks, onToggleTask, onEditTask, onDeleteTask }: TaskAccordionProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Morning Routine': true,
    'Deep Work': true,
    'Collaboration': true,
    'Rest': true,
    'Lainnya': true
  });
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const categoriesMap: Record<string, Task[]> = {};
  tasks.forEach(t => {
    const cat = t.category || 'Lainnya';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(t);
  });

  const categories = Object.keys(categoriesMap);

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleTaskExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const getBadgeStyle = (targetTime: string, completedTime?: string) => {
    if (!completedTime) return null;
    const badge = storage.calculateAdherenceBadge(targetTime, completedTime);

    switch (badge) {
      case 'On Time':
        return { label: 'On Time', style: 'bg-emerald-100 border-emerald-200 text-emerald-700' };
      case 'Delayed':
        return { label: 'Delayed', style: 'bg-amber-100 border-amber-200 text-amber-700' };
      case 'Late':
        return { label: 'Late', style: 'bg-rose-100 border-rose-200 text-rose-700' };
    }
  };

  const getDifficultyBadge = (diff: DifficultyLevel) => {
    switch (diff) {
      case 'Tinggi':
        return 'text-rose-600 border-rose-200 bg-rose-50';
      case 'Sedang':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      case 'Rendah':
        return 'text-emerald-600 border-emerald-200 bg-emerald-50';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50">
        <p className="text-sm text-zinc-500">Belum ada jadwal yang diunggah untuk hari ini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      {categories.map(cat => {
        const catTasks = categoriesMap[cat];
        const isOpen = openCategories[cat] !== false;
        const completedCount = catTasks.filter(t => t.is_done).length;

        return (
          <div key={cat} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300">
            <div
              onClick={() => toggleCategory(cat)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 active:bg-zinc-100 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-zinc-100 border border-zinc-200">
                  {getCategoryIcon(cat)}
                </span>
                <span className="text-sm font-semibold tracking-wide text-zinc-800">{cat}</span>
                <span className="text-[10px] font-medium font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                  {completedCount}/{catTasks.length}
                </span>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-zinc-100 bg-zinc-50/50"
                >
                  <div className="p-2 space-y-1.5">
                    {catTasks.map(task => {
                      const badgeInfo = getBadgeStyle(task.target_time, task.completed_time);
                      const isExpanded = expandedTasks[task.id];

                      return (
                        <div
                          key={task.id}
                          className={`relative overflow-hidden rounded-xl border p-3 flex flex-col gap-2 transition-all duration-200 shadow-sm ${
                            task.is_done
                              ? 'bg-zinc-50 border-zinc-200 opacity-70'
                              : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-grow cursor-pointer" onClick={() => onToggleTask(task.id)}>
                              <button
                                className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                                  task.is_done
                                    ? 'border-indigo-500 bg-indigo-500 text-white'
                                    : 'border-zinc-300 bg-white hover:border-indigo-400'
                                }`}
                              >
                                {task.is_done && <span className="text-[10px] font-bold">✓</span>}
                              </button>

                              <div className="space-y-0.5">
                                <span className={`text-sm font-semibold tracking-wide block ${
                                  task.is_done ? 'line-through text-zinc-400' : 'text-zinc-800'
                                }`}>
                                  {task.task_name}
                                </span>
                                
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  <span className="text-[10px] font-mono text-zinc-500">
                                    ⏱️ {task.target_time.substring(0, 5)}
                                  </span>
                                  {task.completed_time && (
                                    <span className="text-[10px] font-mono text-zinc-500">
                                      ✓ {task.completed_time.substring(0, 5)}
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-mono font-medium border rounded px-1.5 py-0.5 leading-none ${getDifficultyBadge(task.tingkat_kesulitan)}`}>
                                    {task.tingkat_kesulitan}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {badgeInfo && (
                                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border tracking-wide ${badgeInfo.style}`}>
                                  {badgeInfo.label}
                                </span>
                              )}
                              <button
                                onClick={(e) => toggleTaskExpand(task.id, e)}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isExpanded ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                                }`}
                              >
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-8 pt-2 mt-1 border-t border-zinc-100">
                                  {task.notes && (
                                    <div className="text-xs text-zinc-600 mb-3 flex items-start gap-1.5">
                                      <FileText className="w-3.5 h-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                      <p className="leading-relaxed">{task.notes}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onEditTask?.(task); }} 
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-zinc-200 shadow-sm text-zinc-600 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 active:scale-95"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" /> Ubah
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task.id); }} 
                                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 border border-rose-200 shadow-sm text-rose-600 hover:bg-rose-100 transition-colors flex items-center gap-1.5 active:scale-95"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
