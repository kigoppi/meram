'use client';

import React, { useState } from 'react';
import { User, Lock, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

// Yasaklı kullanıcı adı kelimeleri
const FORBIDDEN_NAMES = ['admin', 'yonetici', 'yönetici', 'moderator', 'moderatör', 'root', 'sahip', 'owner', 'sistem'];

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password.trim()) return;

    const cleanUser = username.trim().toLowerCase();

    // Sahiplik/Yetki içeren kelime kontrolü
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
      <div className="bg-[#1c140d] border border-amber-700/50 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl text-[#f4eee6] space-y-4">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">{isRegister ? 'Yeni Avcı Kaydı' : 'Avcı Girişi'}</h2>
          <p className="text-xs text-[#a8998e]">
            {isRegister ? 'Benzersiz bir kullanıcı adı ve şifre belirleyin.' : 'Kayıtlı bilgilerinizle giriş yapın.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <User className="w-4 h-4 text-[#a8998e] absolute left-3 top-3.5" />
              <input 
                type="text" 
                required
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-600 font-medium"
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#a8998e] absolute left-3 top-3.5" />
              <input 
                type="password" 
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-amber-600 font-medium"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-700 via-yellow-800 to-emerald-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol ve Giriş Yap' : 'Giriş Yap')}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-[#32261e] text-xs">
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            className="text-amber-400 hover:underline font-medium cursor-pointer"
          >
            {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="text-[#a8998e] hover:text-white cursor-pointer"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}