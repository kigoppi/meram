'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Fish, Compass, ArrowRight, Sparkles, Waves, Trees } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-cyan-500 selection:text-black">
      
      {/* Üst Başlık */}
      <div className="text-center space-y-3 mb-8 sm:mb-12 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Paylaşım Platformu</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          FİSHMUSH
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
          Avını herkesle paylaş, paylaşımlarla etkileşimde bulun.
        </p>
      </div>

      {/* İkiye Bölünmüş Ana Ekran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl">
        
        {/* SOL TARAF: Balıkçılık */}
        <div 
          onClick={() => router.push('/fishing')}
          className="group relative bg-[#0b1329] border border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          {/* Arka Plan Görseli (Daha Belirgin Opaklık: %55 -> %70) */}
          <div className="absolute inset-0 z-0 opacity-55 group-hover:opacity-70 transition-opacity duration-500">
            <img 
              src="/images/fishing-bg.jpg" 
              alt="Balıkçılık Arka Plan" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#0b1329]/60 to-transparent" />
          </div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-xl shadow-cyan-500/40 flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <Fish className="w-9 h-9 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Waves className="w-3 h-3" /> Balıkçılık
              </div>
              <h2 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors drop-shadow-md">
                Balıkçılık Dünyası
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium drop-shadow-md">
                Canlı hava durumu, deniz suyu sıcaklıkları, sahil meraları ve anlık balık avı rapor akışı.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-cyan-950/80 relative z-10">
            <span className="text-xs text-slate-300 font-medium">Harita & Canlı Akış</span>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Balık Avına İlerle</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Mantarcılık */}
        <div 
          onClick={() => router.push('/mushrooms')}
          className="group relative bg-[#1c140d] border border-amber-700/50 hover:border-amber-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          {/* Arka Plan Görseli (Daha Belirgin Opaklık: %55 -> %70) */}
          <div className="absolute inset-0 z-0 opacity-55 group-hover:opacity-70 transition-opacity duration-500">
            <img 
              src="/images/mushroom-bg.jpg" 
              alt="Mantar Avı Arka Plan" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16110e] via-[#1c140d]/60 to-transparent" />
          </div>

          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-all pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 via-yellow-600 to-emerald-800 p-0.5 shadow-xl shadow-amber-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#16110e] rounded-[14px] flex items-center justify-center">
                <Trees className="w-9 h-9 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#261d15]/90 text-amber-400 border border-[#3d2e24] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Compass className="w-3 h-3" /> Mantar Avı
              </div>
              <h2 className="text-xl font-extrabold text-[#f4eee6] group-hover:text-amber-200 transition-colors drop-shadow-md">
                Mantar Avı Dünyası
              </h2>
              <p className="text-xs sm:text-sm text-[#f4eee6]/90 leading-relaxed font-medium drop-shadow-md">
                Mera durumu, mantar türü raporları ve anlık mantar avı paylaşımları.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#32261e]/80 relative z-10">
            <span className="text-xs text-[#d4c5b9] font-medium">Harita & Bildirimler</span>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Mantar Avına İlerle</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-12 text-center text-[11px] text-slate-500 font-medium">
        Platform test süreci içerisindedir. Öneri ve şikayetlerinizi mantarbalik@gmail.com adresine iletebilirsiniz.
      </div>

    </div>
  );
}