'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Fish, Trees, ArrowRight, Sparkles, Waves, Compass } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-cyan-500 selection:text-black">
      
      {/* Üst Başlık */}
      <div className="text-center space-y-3 mb-8 sm:mb-12 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Doğa ve Mera Paylaşım Ağı</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
          DOĞA AKTİVİTE MERKEZİ
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
          Keşfetmek istediğiniz alanı seçerek canlı raporlara, haritalara ve anlık meralara ulaşın.
        </p>
      </div>

      {/* İkiye Bölünmüş Ana Ekran (Sol: Balıkçılık, Sağ: Mantarcılık) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl">
        
        {/* SOL TAF: Balıkçılık Teması (Mavi & Okyanus) */}
        <div 
          onClick={() => router.push('/fishing')}
          className="group relative bg-gradient-to-b from-[#0b1329] to-[#030712] border border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <Fish className="w-7 h-7 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-[10px] font-bold uppercase tracking-wider">
                <Waves className="w-3 h-3" /> Balıkçılık
              </div>
              <h2 className="text-xl font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                Balıkçılık Dünyası
              </h2>
              <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed font-medium">
                Canlı hava durumu, deniz suyu sıcaklıkları, sahil meraları ve anlık balık avı rapor akışı.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-cyan-950 relative z-10">
            <span className="text-xs text-slate-400 font-medium">Harita & Canlı Akış</span>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>Balık Avına İlerle</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Mantarcılık Teması (Kahve, Toprak & Orman) */}
        <div 
          onClick={() => router.push('/mushrooms')}
          className="group relative bg-gradient-to-b from-[#1c140d] to-[#16110e] border border-amber-700/50 hover:border-amber-500 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-amber-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-all pointer-events-none" />
          
          <div className="space-y-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-700 via-emerald-800 to-stone-700 p-0.5 shadow-lg shadow-amber-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#16110e] rounded-[14px] flex items-center justify-center">
                <Trees className="w-7 h-7 text-amber-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#261d15] text-amber-400 border border-[#3d2e24] text-[10px] font-bold uppercase tracking-wider">
                <Compass className="w-3 h-3" /> Mantar Avı
              </div>
              <h2 className="text-xl font-extrabold text-[#f4eee6] group-hover:text-amber-200 transition-colors">
                Mantar Avı Dünyası
              </h2>
              <p className="text-xs sm:text-sm text-[#d4c5b9] leading-relaxed font-medium">
                Mera durumu, mantar türü raporları ve anlık mantar avı paylaşımları.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#32261e] relative z-10">
            <span className="text-xs text-[#a8998e] font-medium">Harita & Bildirimler</span>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Mantar Avına İlerle</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-12 text-center text-[11px] text-slate-500 font-medium">
        Tüm raporlar gerçek zamanlı olarak harita üzerinde paylaşılır ve 24 saat sonra sistemden temizlenir.
      </div>

    </div>
  );
}