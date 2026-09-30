'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Fish, Trees, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      
      {/* Üst Başlık */}
      <div className="text-center space-y-3 mb-12 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Doğa ve Mera Paylaşım Ağı</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
          DOĞA AKTİVİTE MERKEZİ
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
          Keşfetmek istediğiniz alanı seçerek canlı raporlara, haritalara ve anlık meralara ulaşın.
        </p>
      </div>

      {/* Modül Kartları (Balıkçılık ve Mantar Avı) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        {/* Balıkçılık Kartı */}
        <div 
          onClick={() => router.push('/fishing')}
          className="group relative bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400/80 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <Fish className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Balıkçılık Dünyası
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Canlı hava durumu, deniz suyu sıcaklıkları, rapor akışı ve sahil meraları.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mt-6 pt-4 border-t border-slate-800 relative z-10">
            <span>Modüle Giriş Yap</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mantar Avı Kartı */}
        <div 
          onClick={() => router.push('/mushrooms')}
          className="group relative bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-400/80 rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/80 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <Trees className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Mantar Avı Dünyası
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Canlı orman haritaları, tür raporları, zemin nemi ve taze av bölgesi paylaşımları.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mt-6 pt-4 border-t border-slate-800 relative z-10">
            <span>Modüle Giriş Yap</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      <div className="mt-12 text-center text-[10px] text-slate-500 font-medium">
        Tüm raporlar gerçek zamanlı olarak harita üzerinde paylaşılır ve 24 saat sonra yenilenir.
      </div>

    </div>
  );
}