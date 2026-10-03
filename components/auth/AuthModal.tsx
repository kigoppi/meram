'use client';

import React, { useState } from 'react';
import { User, Lock, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

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

    const cleanUser = username.trim();
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
      <div className="bg-[#030712] border border-cyan-500/50 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl text-white space-y-4">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">{isRegister ? 'Yeni Avcı Kaydı' : 'Avcı Girişi'}</h2>
          <p className="text-xs text-slate-400">
            {isRegister ? 'Benzersiz bir kullanıcı adı ve şifre belirleyin.' : 'Kayıtlı bilgilerinizle giriş yapın.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="text" 
                required
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input 
                type="password" 
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium"
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol ve Giriş Yap' : 'Giriş Yap')}
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(''); }}
            className="text-cyan-400 hover:underline font-medium cursor-pointer"
          >
            {isRegister ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}