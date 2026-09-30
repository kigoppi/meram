'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Fish, Tent, ShieldCheck, MapPin } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden px-4">
      {/* Arka Plan Görseli / Gradyan Efekti */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-slate-950 z-0" />
      
      {/* İçerik Konteyneri */}
      <div className="relative z-10 max-w-4xl w-full mx-auto text-center space-y-8">
        
        {/* Üst Logo ve Başlık */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sm font-medium text-emerald-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Topluluk Destekli Doğa Rehberi</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Doğayı Birlikte Keşfedin, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Güvenle Raporlayın</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
            Meralar, anlık hava/su raporları, güvenilir kamp alanları ve doğa tutkunlarının buluştuğu ikinci el pazarı tek platformda.
          </p>
        </div>

        {/* İki Ana Seçim Kartı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Balıkçılık Kartı */}
          <div 
            onClick={() => router.push('/fishing')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-blue-900/40 to-slate-900/80 border border-blue-500/30 p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/50"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-25 transition-opacity">
              <Fish className="w-32 h-32 text-blue-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Fish className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">Balıkçılık Dünyası</h2>
                <p className="text-sm text-slate-400">
                  Canlı mera raporları, su sıcaklığı, anlık av durumları ve topluluk onaylı balık avı noktaları.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-blue-400">
                <MapPin className="w-4 h-4" />
                <span>Meraları ve Raporları İncele &rarr;</span>
              </div>
            </div>
          </div>

          {/* Kampçılık Kartı */}
          <div 
            onClick={() => router.push('/camping')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-900/40 to-slate-900/80 border border-emerald-500/30 p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-900/50"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-25 transition-opacity">
              <Tent className="w-32 h-32 text-emerald-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Tent className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">Kampçılık Dünyası</h2>
                <p className="text-sm text-slate-400">
                  Su kaynakları, ateş yakma durumları, çadır alanları ve doğa yürüyüşü rotaları.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Kamp Alanlarını Keşfet &rarr;</span>
              </div>
            </div>
          </div>

        </div>

        {/* Alt Bilgi */}
        <div className="pt-6 text-xs text-slate-500 flex items-center justify-center gap-4">
          <span>Güven Puanı Sistemi</span>
          <span>•</span>
          <span>Topluluk Onaylı Raporlar</span>
          <span>•</span>
          <span>İkinci El Pazar Yeri</span>
        </div>

      </div>
    </main>
  );
}