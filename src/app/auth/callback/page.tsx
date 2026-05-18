'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Loader2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase akan memproses token OAuth dari URL secara otomatis di klien.
    // Kita hanya mendengarkan status login, jika terdeteksi, lempar ke Dashboard.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        router.push('/');
      }
    });

    // Fallback darurat jika jaringan lambat / gagal parsing
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) router.push('/');
        else router.push('/login');
      });
    }, 4000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex flex-col items-center justify-center selection:bg-indigo-500/20">
      <div className="text-center space-y-6 flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl bg-white border border-indigo-100 flex items-center justify-center shadow-2xl shadow-indigo-200/50 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-3xl border-2 border-indigo-500 border-t-transparent border-l-transparent"
          />
          <Compass className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black tracking-tight text-zinc-900">Mengautentikasi...</h2>
          <p className="text-xs font-semibold text-zinc-500 tracking-wide animate-pulse">
            Menyinkronkan sesi dari Google
          </p>
        </div>
      </div>
    </div>
  );
}
