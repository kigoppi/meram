'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Fish, MapPin, ThumbsUp, ThumbsDown, Plus, 
  Compass, ArrowLeft, ShieldCheck, AlertCircle, Navigation, X, Clock, Sparkles, Waves, Info 
} from 'lucide-react';
import AddReportModal from '@/components/reports/AddReportModal';

const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-[#030712] text-cyan-400 font-medium tracking-wide">
        <Waves className="w-6 h-6 animate-pulse mr-2" /> Okyanus Radarı Yükleniyor...
      </div>
    ) 
  }
);

interface Report {
  id: string;
  title: string;
  locationName: string;
  author: string;
  trustScore: number;
  timeString?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  status: 'verified' | 'pending';
  createdAt?: number;
  coordinates?: { lat: number; lng: number } | null;
  imageUrl?: string;
  subData: {
    fishType?: string;
    lure?: string;
    waterCondition?: string;
  };
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function FishingModulePage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [showWeatherLayer, setShowWeatherLayer] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeDetailReport, setActiveDetailReport] = useState<Report | null>(null);

  useEffect(() => {
    const savedReports = localStorage.getItem('fishing_reports');
    if (savedReports) {
      try {
        const parsed: Report[] = JSON.parse(savedReports);
        const now = Date.now();
        
        const validReports = parsed.filter(rep => {
          const createdAt = rep.createdAt || now;
          const diffMs = now - createdAt;
          const diffMinutes = diffMs / (1000 * 60);

          if (diffMs > ONE_DAY_IN_MS) return false;
          if (diffMinutes <= 5 && rep.downvotes > 30) return false;

          return true;
        });

        setReports(validReports);
        localStorage.setItem('fishing_reports', JSON.stringify(validReports));
      } catch (e) {
        console.error('Kayıtlı raporlar okunamadı', e);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReports(prevReports => {
        const filtered = prevReports.filter(rep => {
          const createdAt = rep.createdAt || now;
          const diffMs = now - createdAt;
          const diffMinutes = diffMs / (1000 * 60);

          if (diffMs > ONE_DAY_IN_MS) return false;
          if (diffMinutes <= 5 && rep.downvotes > 30) return false;

          return true;
        });

        if (filtered.length !== prevReports.length) {
          localStorage.setItem('fishing_reports', JSON.stringify(filtered));
        }

        return filtered;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const saveAndSetReports = (newReports: Report[]) => {
    setReports(newReports);
    localStorage.setItem('fishing_reports', JSON.stringify(newReports));
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    setSelectedCoords(coords);
    setIsSelectingLocation(false);
    setIsModalOpen(true);
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    const now = Date.now();
    const updated = reports.map(rep => {
      if (rep.id === id) {
        const newUpvotes = type === 'up' ? rep.upvotes + 1 : rep.upvotes;
        const newDownvotes = type === 'down' ? rep.downvotes + 1 : rep.downvotes;
        const totalVotes = newUpvotes + newDownvotes;
        const calculatedTrust = totalVotes > 0 ? Math.round((newUpvotes / totalVotes) * 100) : 50;
        const newStatus = calculatedTrust >= 70 ? 'verified' : 'pending';

        const updatedRep = {
          ...rep,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          trustScore: calculatedTrust,
          status: newStatus
        };

        if (activeDetailReport?.id === id) {
          setActiveDetailReport(updatedRep);
        }

        return updatedRep;
      }
      return rep;
    });

    saveAndSetReports(updated);
  };

  const handleAddNewReport = (newReport: Report) => {
    const reportWithAuthor = {
      ...newReport,
      author: 'Gezgin Avcı'
    };
    const updated = [reportWithAuthor, ...reports];
    saveAndSetReports(updated);
    setSelectedCoords(null);
  };

  const getDisplayTime = (createdAt?: number, timeString?: string) => {
    if (!createdAt) return timeString || 'Bilinmiyor';
    const diffMinutes = (Date.now() - createdAt) / (1000 * 60);
    if (diffMinutes <= 2) return 'Az önce';
    return timeString || 'Bugün';
  };

  const sortedReports = [...reports].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const latestReports = sortedReports.slice(0, 10);
  const olderReports = sortedReports.slice(10);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Üst Navigasyon Barı */}
      <header className="h-16 border-b border-cyan-900/30 bg-[#030712]/90 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 z-50 shadow-2xl shadow-cyan-950/30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="group px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all duration-300 flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Ana Üsse Dön</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Fish className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                BALIKÇILIK DÜNYASI
              </h1>
              <p className="text-[9px] text-cyan-500/80 font-medium tracking-wider uppercase">Canlı Mera ve Rapor Ağı</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setIsSelectingLocation(true)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs tracking-wide transition-all cursor-pointer shadow-lg border ${
              isSelectingLocation 
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 animate-pulse font-black' 
                : 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border-cyan-800/60'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>{isSelectingLocation ? 'Konum Seçiliyor...' : 'Haritadan Konum Seç'}</span>
          </button>

          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 transition-colors cursor-pointer shadow-md"
            title="Nasıl Kullanılır?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setIsSelectingLocation(true)}
            className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer overflow-hidden border border-cyan-400/30 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
            <span>Rapor Ekle</span>
          </button>
        </div>
      </header>

      {/* 3 Sütunlu Yerleşim */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* SOL SÜTUN */}
        <div className="lg:col-span-3 bg-[#030712] border-r border-cyan-900/30 flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b border-cyan-900/20 bg-[#030712]/90 shrink-0 flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>En Güncel Akış (Sol Üst)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
              {latestReports.length} / 10
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {latestReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                <p className="text-xs text-slate-400">Henüz yeni rapor bulunmuyor.</p>
              </div>
            ) : (
              latestReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveDetailReport(report)}
                  className="group p-2.5 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-slate-900 transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {getDisplayTime(report.createdAt, report.timeString)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.subData?.fishType && (
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40 font-semibold truncate">
                        🐟 {report.subData.fishType}
                      </span>
                      <span className="text-emerald-400 font-bold">%{report.trustScore}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ORTA SÜTUN: Harita */}
        <div className="lg:col-span-6 relative bg-[#0b0f19] border-r border-cyan-900/30 flex flex-col h-full overflow-hidden">
          {isSelectingLocation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-xl shadow-2xl shadow-cyan-500/40 flex items-center gap-2.5 text-xs font-bold tracking-wide border border-cyan-300/40 animate-pulse">
              <Navigation className="w-3.5 h-3.5 animate-spin text-cyan-200" />
              <span>Harita Üzerinde İşaretlenecek Noktaya Tıklayın...</span>
              <button 
                onClick={() => setIsSelectingLocation(false)} 
                className="p-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 text-white cursor-pointer ml-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <InteractiveMap 
            onMapClick={handleMapClick} 
            reports={reports} 
            showWeatherLayer={showWeatherLayer}
            isSelectingLocation={isSelectingLocation}
            tempSelectedCoords={selectedCoords}
            isModalOpen={isModalOpen || !!activeDetailReport}
          />
        </div>

        {/* SAĞ SÜTUN: Arşiv */}
        <div className="lg:col-span-3 bg-[#030712] flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b border-cyan-900/20 bg-[#030712]/90 shrink-0 flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400 animate-spin-slow" />
              <span>Diğer Raporlar (Arşiv)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
              {olderReports.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {olderReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                <p className="text-xs text-slate-400">Arşivde başka rapor yok.</p>
              </div>
            ) : (
              olderReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveDetailReport(report)}
                  className="group p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium">
                      {getDisplayTime(report.createdAt, report.timeString)}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-300 group-hover:text-cyan-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.subData?.fishType && (
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-semibold truncate">
                        🐟 {report.subData.fishType}
                      </span>
                      <span className="text-emerald-500 font-bold">%{report.trustScore}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RAPOR DETAY MODALI */}
      {activeDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {activeDetailReport.locationName}
                </span>
                <span className="text-[10px] text-slate-400">• Avcı: {activeDetailReport.author}</span>
              </div>
              <button 
                onClick={() => setActiveDetailReport(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-white">{activeDetailReport.title}</h2>

              {activeDetailReport.imageUrl && (
                <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800">
                  <img src={activeDetailReport.imageUrl} alt="Rapor Detayı" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {activeDetailReport.content}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeDetailReport.subData?.fishType && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Hedef Balık</span>
                    <strong className="text-cyan-400 font-bold">{activeDetailReport.subData.fishType}</strong>
                  </div>
                )}
                {activeDetailReport.subData?.lure && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Kullanılan Takım</span>
                    <strong className="text-white font-bold">{activeDetailReport.subData.lure}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {getDisplayTime(activeDetailReport.createdAt, activeDetailReport.timeString)}
                </span>
                <span className="text-emerald-400 font-bold">Güvenilirlik: %{activeDetailReport.trustScore}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote(activeDetailReport.id, 'up')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeDetailReport.upvotes}</span>
                </button>
                <button 
                  onClick={() => handleVote(activeDetailReport.id, 'down')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{activeDetailReport.downvotes}</span>
                </button>
              </div>

              <button 
                onClick={() => setActiveDetailReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Rapor Ekleme Modalı */}
      <AddReportModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCoords(null); }}
        onAddReport={handleAddNewReport}
        moduleType="fishing"
        selectedCoords={selectedCoords}
      />

      {/* Bilgilendirme Modalı */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/30 w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Info className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Nasıl Kullanılır?</h2>
              </div>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-medium">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30">1</span>
                <div>
                  <strong className="text-white block mb-0.5">Serbest Rapor Paylaşımı</strong>
                  Siteye gelen herkes haritadan konum seçerek veya "Rapor Ekle" butonuna basarak anında mera raporu paylaşabilir.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30">2</span>
                <div>
                  <strong className="text-white block mb-0.5">Sol Sütun & Arşiv</strong>
                  En güncel 10 rapor sol üstte listelenir. Yeni rapor eklendikçe eskiyenler sağ sütundaki arşive kayar. Raporlar 24 saat sonra silinir.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg shadow-cyan-600/20"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}