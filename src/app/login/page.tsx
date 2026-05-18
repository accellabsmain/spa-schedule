'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Timer, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/');
      else setIsInitializing(false);
    });
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Registrasi berhasil! Silakan periksa kotak masuk email Anda untuk verifikasi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) setError(error.message);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-zinc-900 flex justify-center selection:bg-indigo-500/20 selection:text-indigo-900">
      <div className="w-full max-w-md flex flex-col justify-center px-6 bg-white border-x border-zinc-200 relative min-h-screen shadow-2xl shadow-zinc-200/50 overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center shadow-inner">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Timer className="w-8 h-8 text-indigo-600" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900">SPA Assistant</h1>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mt-1">Masuk untuk Sinkronisasi</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 hover:bg-zinc-50 py-3.5 rounded-2xl font-bold text-sm text-zinc-700 shadow-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">ATAU EMAIL</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-emerald-700 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>{message}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Alamat Email"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata Sandi (min. 6 karakter)"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {isLogin ? 'Masuk Sekarang' : 'Daftar Akun Baru'}
              </button>
            </form>

            <p className="text-center text-xs font-medium text-zinc-500 pt-4">
              {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? "Daftar di sini" : "Masuk di sini"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
