'use client';

import React, { useState, useEffect } from 'react';
import { Task, DifficultyLevel } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Clock, Tag, Target, FileText } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'schedule_id' | 'is_done' | 'completed_time'>, dateStr: string) => void;
  activeDate: string;
  initialData?: Task;
}

export default function TaskModal({ isOpen, onClose, onSave, activeDate, initialData }: TaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [category, setCategory] = useState('');
  const [tingkatKesulitan, setTingkatKesulitan] = useState<DifficultyLevel>('Sedang');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(activeDate);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTaskName(initialData.task_name);
        setTargetTime(initialData.target_time.substring(0, 5));
        setCategory(initialData.category);
        setTingkatKesulitan(initialData.tingkat_kesulitan);
        setNotes(initialData.notes || '');
        setSelectedDate(activeDate);
      } else {
        setTaskName('');
        setTargetTime('09:00');
        setCategory('Morning Routine');
        setTingkatKesulitan('Sedang');
        setNotes('');
        setSelectedDate(activeDate);
      }
    }
  }, [isOpen, initialData, activeDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !targetTime || !category) return;

    onSave({
      task_name: taskName,
      target_time: targetTime.includes(':') && targetTime.length === 5 ? `${targetTime}:00` : targetTime,
      category,
      tingkat_kesulitan: tingkatKesulitan,
      notes
    }, selectedDate);
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" 
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <h2 className="text-base font-bold text-zinc-800">
              {initialData ? 'Ubah Jadwal Tugas' : 'Tambah Jadwal Baru'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" /> Nama Tugas
              </label>
              <input 
                required
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Misal: Meeting Klien"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Tanggal
                </label>
                <input 
                  required
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={!!initialData}
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm outline-none transition-all ${initialData ? 'opacity-50 cursor-not-allowed' : 'focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Jam (Target)
                </label>
                <input 
                  required
                  type="time"
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-500" /> Kategori
                </label>
                <input 
                  required
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Misal: Deep Work"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                  💪 Kesulitan
                </label>
                <select 
                  value={tingkatKesulitan}
                  onChange={(e) => setTingkatKesulitan(e.target.value as DifficultyLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" /> Catatan Tambahan
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Deskripsi singkat atau sub-tugas..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
              <Save className="w-4 h-4" /> Simpan Jadwal
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
