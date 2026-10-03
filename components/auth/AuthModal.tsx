'use client';

import React, { useState } from 'react';
import { User, Lock, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
  theme?: 'fishing' | 'mushroom'; // Tema seçimi eklendi
}

const FORBIDDEN_NAMES = ['admin', 'yonetici', 'yönetici', 'moderator', 'moderatör', 'root', 'sahip', 'owner', 'sistem'];

export default function AuthModal({ isOpen, onClose, onLogin, theme = 'fishing' }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Temaya göre renk sınıflarını belirliyoruz
  const isMushroom = theme === 'mushroom';
  const bgColor = isMushroom ? 'bg-[#1c140d]' : 'bg-[#030712]';
  const borderColor = isMushroom ? 'border-amber-700/50' : 'border-cyan-500/50';
  const iconBoxColor = isMushroom ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
  const inputBg = isMushroom ? 'bg-[#16110e] border-[#32261e] focus:border-amber-600' : 'bg-slate-950 border-slate-800 focus:border-cyan-500';
  const btnColor = isMushroom 
    ? 'bg-gradient-to-r from-amber-700 via-yellow-800 to-emerald-800 shadow-amber-950/50' 
    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 shadow-cyan-600/30';
  const linkColor = isMushroom ? 'text-amber-400' : 'text-cyan-400';
  const textColor = isMushroom ? 'text-[#f4eee6]' : 'text-white';
  const subTextColor = isMushroom ? 'text-[#a8998e]' : 'text-slate-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) return;

    const cleanUser = username.trim().toLowerCase();

    const isForbidden = FORBIDDEN_NAMES.some(forbidden => cleanUser.includes(forbidden));
    if (isRegister && isForbidden) {
      setErrorMsg('Bu kullanıcı adı (admin, yönetici vb.) sistem tarafından yasaklanmıştır.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { data: existing } = await supabase
          .from('app_users')
          .select('username')
          .eq('username', cleanUser)
          .single();

        if (existing) {
          setErrorMsg('Bu kullanıcı adı zaten alınmış. Başka bir tane seçin.');
          setLoading(false);
          return;
        }

        const { error } = await supabase.from('app_users').insert([{
          username: cleanUser,
          password: password,
          created_at: Date.now()
        }]);

        if (error) throw error;

        localStorage.setItem('app_username', cleanUser);
        onLogin(cleanUser);
        onClose();
      } else {
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .eq('username', cleanUser)
          .eq('password', password)
          .single();

        if (error || !data) {
          setErrorMsg('Kullanıcı adı veya şifre hatalı.');
          setLoading(false);
          return;
        }

        localStorage.setItem('app_username', cleanUser);
        onLogin(cleanUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg('Bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className={`${bgColor} border ${borderColor} w-full max-w-sm rounded-2xl p-6 relative shadow-2xl ${textColor} space-y-4`}>
        <div className="text-center space-y-1">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto mb-2 ${iconBoxColor}`}>
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">{isRegister ? 'Yeni Avcı Kaydı' : 'Avcı Girişi'}</h2>
          <p className={`text-xs ${subTextColor}`}>
            {isRegister ? 'Benzersiz bir kullanıcı adı ve şifre belirleyin.' : 'Kayıtlı bilgilerinizle giriş yapın.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <User className={`w-4 h-4 ${subTextColor} absolute left-3 top-3.5`} />
              <input 
                type="text" 
                required
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none font-medium ${inputBg}`}
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className={`w-4 h-4 ${subTextColor} absolute left-3 top-3.5`} />
              <input 
                type="password" 
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none font-medium ${inputBg}`}
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-400 text-center font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
              {errorMsg}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer disabled:opacity-50 ${btnColor}`}
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol ve Giriş Yap' : 'Giriş Yap')}
          </button>
        </form>

        <div className={`flex items-center justify-between pt-2 border-t ${isMushroom ? 'border-[#32261e]' : 'border-slate-800'} text-xs`}>
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            className={`${linkColor} hover:underline font-medium cursor-pointer`}
          >
            {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className={`${subTextColor} hover:text-white cursor-pointer`}
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}