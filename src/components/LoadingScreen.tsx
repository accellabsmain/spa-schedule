'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Kami sedang menyesuaikan jadwalmu...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fdfdfd] px-6 text-zinc-900 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#6366f1]/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col items-center max-w-xs text-center z-10">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border border-indigo-200 bg-indigo-50"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />

          <div className="absolute inset-4 bg-white border border-zinc-100 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg shadow-zinc-200">
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="w-7 h-7 text-indigo-600" />
            </motion.div>
          </div>
        </div>

        <motion.h3
          className="text-lg font-bold tracking-wide text-zinc-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {message}
        </motion.h3>

        <motion.p
          className="text-xs text-zinc-400 font-mono font-semibold tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Menyusun AI Schedule...
        </motion.p>
      </div>
    </div>
  );
}
