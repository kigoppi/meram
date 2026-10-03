'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
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
          <div className="flex gap-2 pt-1">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs uppercase shadow-lg shadow-cyan-600/30 cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}