import React, { useState } from 'react';
import { X, User as UserIcon, Lock, ShieldCheck, LogOut, CheckCircle2, AlertCircle, KeyRound, Mail, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { formatDateID } from '../../utils/formatters';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { resetToDefaultData } = useFinance();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  // Handle Update Profile Name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const res = await updateProfile(name);
    setIsSubmitting(false);

    if (res.success) {
      showToast('✅ Nama profil berhasil diperbarui!', 'success');
    } else {
      setErrorMsg(res.error || 'Gagal mengubah nama.');
      showToast(`❌ ${res.error || 'Gagal memperbarui nama.'}`, 'error');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      showToast('❌ Konfirmasi password baru tidak cocok.', 'error');
      return;
    }

    setIsSubmitting(true);
    const res = await changePassword(oldPassword, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      showToast('✅ Kata sandi berhasil diubah!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(res.error || 'Gagal mengubah password.');
      showToast(`❌ ${res.error || 'Gagal mengubah password.'}`, 'error');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat transaksi milik akun ini?')) {
      resetToDefaultData();
      showToast('🗑️ Data transaksi milik akun ini telah dibersihkan.', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in sm:items-center items-end">
      <div className="glass-panel w-full max-w-lg rounded-3xl sm:rounded-2xl border border-purple-500/30 p-6 relative shadow-neon-purple max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-[1px] shadow-neon-purple">
              <div className="w-full h-full bg-[#0b0f19] rounded-[15px] flex items-center justify-center text-white text-base font-black">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Pengaturan & Kelola Akun</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10 mb-5 text-xs">
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Edit Profil</span>
          </button>
          <button
            onClick={() => { setActiveTab('security'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ganti Sandi</span>
          </button>
          <button
            onClick={() => { setActiveTab('account'); setErrorMsg(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'account'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Info Akun</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: EDIT PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Tampilan Akun *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alamat Email (Permanen)
              </label>
              <div className="relative opacity-70">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-slate-400 bg-slate-900/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
              >
                Tutup
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan Nama</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi Saat Ini (Old Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi Baru (New Password) *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Konfirmasi Kata Sandi Baru *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Update Kata Sandi</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ACCOUNT INFO & ACTIONS */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-white/5 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400">ID Pengguna:</span>
                <span className="font-mono text-purple-300 font-bold">{user.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400">Alamat Email:</span>
                <span className="font-semibold text-white">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bergabung Sejak:</span>
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {formatDateID(user.createdAt)}
                </span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleClearData}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" /> Kosongkan Riwayat Transaksi Akun Ini
                </span>
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => { onClose(); logout(); }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-white/10"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-purple-400" /> Keluar dari Akun (Logout)
                </span>
                <span>Logout</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
