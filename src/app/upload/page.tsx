'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage, getLocalDateString } from '../../lib/storage';
import { IngestedScheduleJSON } from '../../lib/types';
import LoadingScreen from '../../components/LoadingScreen';
import { motion } from 'framer-motion';
import { ChevronLeft, UploadCloud, FileJson, AlertTriangle, ArrowRight, Sparkles, FileText } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const todayStr = getLocalDateString(0);
  const sampleJSONText = `{
  "date": "${todayStr}",
  "tasks": [
    {
      "task_name": "Meditasi Pagi & Jurnal Harian",
      "target_time": "06:00:00",
      "category": "Morning Routine",
      "notes": "Fokus pada pernapasan perut selama 10 menit, lalu tulis 3 hal yang disyukuri.",
      "tingkat_kesulitan": "Rendah"
    },
    {
      "task_name": "Deep Work: Desain Arsitektur MVP",
      "target_time": "08:30:00",
      "category": "Deep Work",
      "notes": "Selesaikan rancangan UI Mobile-First dan integrasi data engine.",
      "tingkat_kesulitan": "Tinggi"
    },
    {
      "task_name": "Evaluasi & Sync dengan Tim Bisnis",
      "target_time": "11:00:00",
      "category": "Collaboration",
      "notes": "Bahas feedback dari presentasi proposal akselerasi.",
      "tingkat_kesulitan": "Sedang"
    },
    {
      "task_name": "Istirahat Siang / Power Nap",
      "target_time": "13:00:00",
      "category": "Rest",
      "notes": "Tidur sejenak selama 15-20 menit untuk menyegarkan stamina pikiran.",
      "tingkat_kesulitan": "Rendah"
    },
    {
      "task_name": "Coding Refinement & Bug Fixing",
      "target_time": "14:30:00",
      "category": "Deep Work",
      "notes": "Sempurnakan modul parser JSON agar tahan terhadap input salah format.",
      "tingkat_kesulitan": "Sedang"
    },
    {
      "task_name": "Olahraga Sore / Light Cardio",
      "target_time": "17:00:00",
      "category": "Rest",
      "notes": "Jogging santai di sekitar taman komplek atau stretching.",
      "tingkat_kesulitan": "Rendah"
    }
  ]
}`;

  const handleUseSample = () => {
    const blob = new Blob([sampleJSONText], { type: 'application/json' });
    const file = new File([blob], "contoh_jadwal_ai.json", { type: 'application/json' });
    setSelectedFile(file);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError("Format salah: Mohon unggah berkas berekstensi .json");
      setSelectedFile(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!selectedFile) throw new Error('Mohon pilih atau tarik berkas JSON terlebih dahulu.');
      
      const fileText = await selectedFile.text();
      
      let parsedData: IngestedScheduleJSON;
      try {
        parsedData = JSON.parse(fileText);
      } catch (err) {
        throw new SyntaxError();
      }

      if (!parsedData.date) throw new Error('Format salah: Properti "date" (YYYY-MM-DD) wajib dicantumkan dalam JSON.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(parsedData.date)) throw new Error('Format salah: Tanggal harus berformat "YYYY-MM-DD" (contoh: 2026-05-18).');
      if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) throw new Error('Format salah: Properti "tasks" harus berupa daftar array.');
      if (parsedData.tasks.length === 0) throw new Error('Format salah: Daftar "tasks" minimal harus berisi 1 tugas.');

      parsedData.tasks.forEach((t, idx) => {
        if (!t.task_name) throw new Error(`Tugas indeks ke-${idx}: "task_name" wajib ada.`);
        if (!t.target_time) throw new Error(`Tugas "${t.task_name}": "target_time" (HH:mm:ss) wajib ada.`);
        if (!/^\d{2}:\d{2}:\d{2}$/.test(t.target_time)) throw new Error(`Tugas "${t.task_name}": "target_time" harus berformat "HH:mm:ss".`);
        if (!t.tingkat_kesulitan) throw new Error(`Tugas "${t.task_name}": "tingkat_kesulitan" (Tinggi / Sedang / Rendah) wajib ada.`);
        if (!['Tinggi', 'Sedang', 'Rendah'].includes(t.tingkat_kesulitan)) throw new Error(`Tugas "${t.task_name}": "tingkat_kesulitan" harus berisi 'Tinggi', 'Sedang', atau 'Rendah'.`);
      });

      setIsLoading(true);
      setTimeout(() => {
        storage.saveScheduleJSON(parsedData);
        setIsLoading(false);
        router.push('/');
      }, 2000);
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setError('Isi berkas JSON tidak valid. Periksa penulisan tanda koma, kurung, atau petik ganda.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat memproses berkas.');
      }
    }
  };

  if (isLoading) return <LoadingScreen message="Membaca berkas & menyesuaikan jadwalmu..." />;

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex justify-center selection:bg-indigo-500/20 selection:text-indigo-900">
      <div className="w-full max-w-md flex flex-col bg-white border-x border-zinc-200 relative min-h-screen shadow-xl shadow-zinc-200/50">
        <div className="absolute top-0 left-0 right-0 h-[220px] bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none" />

        <header className="px-5 py-4 flex items-center justify-between border-b border-zinc-200 sticky top-0 bg-white/90 backdrop-blur-md z-20 shadow-sm">
          <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors py-1.5">
            <ChevronLeft className="w-4 h-4" /> Kembali
          </Link>
          <h1 className="text-sm font-bold tracking-wider text-zinc-800 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-indigo-600" /> UNGGAH JADWAL
          </h1>
          <div className="w-10 h-6" />
        </header>

        <div className="flex-grow px-5 py-6 overflow-y-auto space-y-6 z-10">
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-900">Unggah Berkas Jadwal AI</h2>
            <p className="text-xs font-medium text-zinc-500 leading-relaxed">
              Pilih atau tarik berkas <code className="bg-zinc-100 text-zinc-700 px-1 py-0.5 rounded font-mono text-[10px]">.json</code> hasil bentukan asisten kecerdasan buatan Anda untuk memetakan agenda ke dalam dasbor.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5 text-zinc-400" /> Area Unggah Berkas
                </label>
                <button
                  type="button"
                  onClick={handleUseSample}
                  className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full transition-all shadow-sm"
                >
                  <Sparkles className="w-3 h-3" /> Buatkan File Mock
                </button>
              </div>

              {/* Drag and Drop File Input Area */}
              <div 
                className={`w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-sm ${
                  isDragging ? 'border-indigo-500 bg-indigo-50 scale-[0.99]' : 
                  selectedFile ? 'border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/50' : 
                  'border-zinc-300 bg-zinc-50 hover:bg-zinc-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".json,application/json" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                
                {selectedFile ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3 text-indigo-600 shadow-sm border border-indigo-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-indigo-900 leading-tight max-w-[200px] truncate">{selectedFile.name}</p>
                    <p className="text-[10px] font-mono font-medium text-indigo-600/70 mt-1">{(selectedFile.size / 1024).toFixed(2)} KB • Siap Diproses</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 text-zinc-400 shadow-sm border border-zinc-200">
                      <UploadCloud className={`w-6 h-6 ${isDragging ? 'text-indigo-500 animate-bounce' : ''}`} />
                    </div>
                    <p className="text-sm font-bold text-zinc-700">Tarik & Lepas berkas di sini</p>
                    <p className="text-[10px] font-medium text-zinc-500 mt-1">atau klik untuk menelusuri <code className="font-mono">.json</code></p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex gap-2.5 items-start text-xs font-semibold text-rose-700 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-500 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className={`w-full rounded-2xl py-3.5 font-bold text-sm tracking-wide text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                selectedFile 
                  ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-indigo-600/30 cursor-pointer' 
                  : 'bg-zinc-300 text-zinc-100 shadow-none cursor-not-allowed'
              }`}
            >
              Baca Berkas JSON <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <footer className="py-6 text-center border-t border-zinc-200 bg-zinc-50">
          <p className="text-[10px] text-zinc-400 tracking-wider font-mono font-medium">
            SPA MVP • PRIVACY-FIRST LOCAL STORAGE ENGINE
          </p>
        </footer>
      </div>
    </div>
  );
}
