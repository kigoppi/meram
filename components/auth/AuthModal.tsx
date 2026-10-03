'use client';

import React, { useState } from 'react';
import { User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onLogin: (username: string) => void;
}

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; onLogin: (name: string) => void }) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    const cleanName = username.trim();
    localStorage.setItem('app_username', cleanName);
    onLogin(cleanName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#030712] border border-cyan-500/50 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl text-white space-y-4">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Avcı Kimliği Gerekiyor</h2>
          <p className="text-xs text-slate-400">Rapor ve yorum paylaşabilmek için lütfen bir rumuz (isim) belirleyin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input 
              type="text" 
              required
              placeholder="Örn: BoğazKurdu veya Ahmet Avcı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium text-center"
              maxLength={20}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
          >
            Sisteme Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}