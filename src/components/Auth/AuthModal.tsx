import React, { useState } from 'react';
import { Wallet, Lock, Mail, User as UserIcon, LogIn, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    if (mode === 'register') {
      const res = await register({ name, email, password });
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mendaftar.');
      }
    } else {
      const res = await login({ email, password });
      if (!res.success) {
        setErrorMsg(res.error || 'Gagal login.');
      }
    }

    setIsLoading(false);
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    await register({ name: 'Pengguna Demo', email: 'demo@finpulse.com', password: 'demopassword123' });
    await login({ email: 'demo@finpulse.com', password: 'demopassword123' });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-purple-500/30 p-6 sm:p-8 relative shadow-neon-purple overflow-hidden">

        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-neon-purple mb-3">
            <div className="w-full h-full bg-[#0b0f19] rounded-[15px] flex items-center justify-center">
              <Wallet className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white font-space tracking-tight">
            Fin<span className="text-gradient-purple">Pulse</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' ? 'Masuk ke Akun Keuangan Anda' : 'Buat Akun Keuangan Baru'}
          </p>
        </div>

        {/* Auth Mode Toggle Pills */}
        <div className="flex p-1 rounded-xl bg-slate-900/90 border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'register'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                : 'text-slate-400 hover:text-white'
              }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Yusron Al Ghoni"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kata Sandi (Password) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 font-bold text-xs rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-neon-purple active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Memproses...' : mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}</span>
          </button>

        </form>

        {/* Demo Quick Login */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="text-xs text-slate-400 hover:text-cyan-300 underline font-semibold transition-colors"
          >
            Masuk Cepat Sebagai Akun Demo
          </button>
        </div>

      </div>
    </div>
  );
};
