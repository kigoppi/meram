'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Trees, MapPin, ThumbsUp, ThumbsDown, Plus, 
  Compass, ArrowLeft, Navigation, X, Clock, Sparkles, Waves, Info 
} from 'lucide-react';
import AddMushroomReportModal from '@/components/reports/AddMushroomReportModal';

const MushroomMap = dynamic(
  () => import('@/components/map/MushroomMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-[#1c140d] text-amber-500 font-medium tracking-wide">
        <Waves className="w-6 h-6 animate-pulse mr-2" /> Orman Radarı Yükleniyor...
      </div>
    ) 
  }
);

interface MushroomReport {
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
  mushroomData: {
    species: string;
    forestType: string;
    soilCondition: string;
  };
}

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function MushroomModulePage() {
  const router = useRouter();
  const [reports, setReports] = useState<MushroomReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeDetailReport, setActiveDetailReport] = useState<MushroomReport | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'latest' | 'archive'>('map');

  useEffect(() => {
    const savedReports = localStorage.getItem('mushroom_reports');
    if (savedReports) {
      try {
        const parsed: MushroomReport[] = JSON.parse(savedReports);
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
        localStorage.setItem('mushroom_reports', JSON.stringify(validReports));
      } catch (e) {
        console.error('Kayıtlı mantar raporları okunamadı', e);
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
          localStorage.setItem('mushroom_reports', JSON.stringify(filtered));
        }

        return filtered;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const saveAndSetReports = (newReports: MushroomReport[]) => {
    setReports(newReports);
    localStorage.setItem('mushroom_reports', JSON.stringify(newReports));
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
        const newStatus: 'verified' | 'pending' = calculatedTrust >= 70 ? 'verified' : 'pending';

        const updatedRep: MushroomReport = {
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

  const handleAddNewReport = (newReport: MushroomReport) => {
    const reportWithAuthor: MushroomReport = {
      ...newReport,
      author: 'Gezgin Avcı',
      status: newReport.status || 'pending'
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
    <div className="h-screen w-screen overflow-hidden bg-[#16110e] text-[#f4eee6] flex flex-col selection:bg-amber-600 selection:text-white">
      
      {/* Üst Navigasyon Barı */}
      <header className="h-14 sm:h-16 border-b border-[#32261e] bg-[#1c140d]/95 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => router.push('/')}
            className="group px-2.5 py-1.5 rounded-xl bg-[#261d15] hover:bg-[#36291e] border border-[#3d2e24] hover:border-amber-700/50 text-[#d4c5b9] hover:text-amber-400 transition-all flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Anasayfa</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-700 via-emerald-800 to-stone-700 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#16110e] rounded-[10px] flex items-center justify-center">
                <Trees className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide bg-gradient-to-r from-[#f4eee6] via-amber-200 to-amber-500 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                MANTAR AVI DÜNYASI
              </h1>
              <p className="text-[8px] sm:text-[9px] text-amber-600/90 font-medium tracking-wider uppercase hidden sm:block">Canlı Orman ve Mera Ağı</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button 
            onClick={() => setIsSelectingLocation(true)}
            className={`px-2 sm:px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-[11px] sm:text-xs tracking-wide transition-all cursor-pointer shadow-lg border ${
              isSelectingLocation 
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse font-black' 
                : 'bg-[#261d15] hover:bg-[#36291e] text-amber-300 border-[#3d2e24]'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span className="hidden md:inline">{isSelectingLocation ? 'Konum Seçiliyor...' : 'Haritadan Konum Seç'}</span>
            <span className="md:hidden">Seç</span>
          </button>

          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="p-1.5 sm:p-2 rounded-xl bg-[#261d15] hover:bg-[#36291e] border border-[#3d2e24] text-amber-400 transition-colors cursor-pointer shadow-md"
            title="Nasıl Kullanılır?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setIsSelectingLocation(true)}
            className="group relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-700 via-yellow-800 to-emerald-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-amber-950/50 transition-all cursor-pointer border border-amber-600/40 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
            <span className="hidden sm:inline">Rapor Ekle</span>
          </button>
        </div>
      </header>

      {/* Mobil Sekme Çubuğu */}
      <div className="flex lg:hidden bg-[#1c140d] border-b border-[#32261e] p-1.5 shrink-0 z-40 justify-around text-xs font-bold">
        <button
          onClick={() => setMobileTab('latest')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'latest' ? 'bg-amber-700 text-white shadow-md' : 'text-[#a8998e] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Güncel ({latestReports.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'map' ? 'bg-amber-700 text-white shadow-md' : 'text-[#a8998e] hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Harita</span>
        </button>
        <button
          onClick={() => setMobileTab('archive')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'archive' ? 'bg-amber-700 text-white shadow-md' : 'text-[#a8998e] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Arşiv ({olderReports.length})</span>
        </button>
      </div>

      {/* 3 Sütunlu Yerleşim */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
        
        {/* SOL SÜTUN */}
        <div className={`lg:col-span-3 bg-[#16110e] border-r border-[#32261e] flex flex-col h-full overflow-hidden ${
          mobileTab === 'latest' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="p-3.5 border-b border-[#32261e] bg-[#1c140d]/90 shrink-0 hidden lg:flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-amber-500 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>En Güncel Akış</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/30 text-[10px] font-bold">
              {latestReports.length} / 10
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {latestReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 bg-[#1c140d]/50 border border-[#32261e] rounded-2xl">
                <p className="text-xs text-[#a8998e]">Henüz yeni mantar raporu bulunmuyor.</p>
              </div>
            ) : (
              latestReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveDetailReport(report)}
                  className="group p-3 rounded-xl bg-[#211913] border border-[#382b21] hover:border-amber-600/60 hover:bg-[#281f18] transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[10px] text-[#a8998e] font-medium">
                      {getDisplayTime(report.createdAt, report.timeString)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#f4eee6] group-hover:text-amber-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.mushroomData?.species && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[#2c221a] text-amber-300 border border-[#44352a] font-semibold truncate">
                        🍄 {report.mushroomData.species}
                      </span>
                      <span className="text-emerald-500 font-bold">%{report.trustScore}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ORTA SÜTUN: Mantar Haritası */}
        <div className={`lg:col-span-6 relative bg-[#1c140d] border-r border-[#32261e] flex flex-col h-full overflow-hidden ${
          mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
        }`}>
          {isSelectingLocation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-gradient-to-r from-amber-700 to-emerald-800 text-white px-3 sm:px-4 py-2 rounded-xl shadow-2xl shadow-amber-950/50 flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-wide border border-amber-500/40 animate-pulse">
              <Navigation className="w-3.5 h-3.5 animate-spin text-amber-200" />
              <span>Haritada Konuma Tıklayın...</span>
              <button 
                onClick={() => setIsSelectingLocation(false)} 
                className="p-1 rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <MushroomMap 
            onMapClick={handleMapClick} 
            reports={reports} 
            isSelectingLocation={isSelectingLocation}
            tempSelectedCoords={selectedCoords}
          />
        </div>

        {/* SAĞ SÜTUN: Arşiv */}
        <div className={`lg:col-span-3 bg-[#16110e] flex flex-col h-full overflow-hidden ${
          mobileTab === 'archive' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="p-3.5 border-b border-[#32261e] bg-[#1c140d]/90 shrink-0 hidden lg:flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-amber-500 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-amber-500 animate-spin-slow" />
              <span>Diğer Raporlar (Arşiv)</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#261d15] text-[#a8998e] border border-[#3d2e24] text-[10px] font-bold">
              {olderReports.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {olderReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 bg-[#1c140d]/50 border border-[#32261e] rounded-2xl">
                <p className="text-xs text-[#a8998e]">Arşivde başka rapor yok.</p>
              </div>
            ) : (
              olderReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveDetailReport(report)}
                  className="group p-3 rounded-xl bg-[#211913]/60 border border-[#32261e] hover:border-amber-700/50 hover:bg-[#211913] transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-500/90 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[10px] text-[#a8998e] font-medium">
                      {getDisplayTime(report.createdAt, report.timeString)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#d4c5b9] group-hover:text-amber-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.mushroomData?.species && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-[#1c140d] text-[#a8998e] border border-[#32261e] font-semibold truncate">
                        🍄 {report.mushroomData.species}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c140d] border border-amber-700/40 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative shadow-2xl text-[#f4eee6] space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#32261e] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {activeDetailReport.locationName}
                </span>
                <span className="text-[10px] text-[#a8998e]">• {activeDetailReport.author}</span>
              </div>
              <button 
                onClick={() => setActiveDetailReport(null)}
                className="p-1.5 rounded-lg bg-[#261d15] hover:bg-[#36291e] text-[#a8998e] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-bold text-[#f4eee6]">{activeDetailReport.title}</h2>

              {activeDetailReport.imageUrl && (
                <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-[#32261e]">
                  <img src={activeDetailReport.imageUrl} alt="Mantar Rapor Detayı" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs sm:text-sm text-[#d4c5b9] leading-relaxed bg-[#16110e] p-3.5 rounded-xl border border-[#32261e]">
                {activeDetailReport.content}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeDetailReport.mushroomData?.species && (
                  <div className="bg-[#16110e] p-2.5 rounded-xl border border-[#32261e]">
                    <span className="text-[#a8998e] block text-[10px]">Mantar Türü</span>
                    <strong className="text-amber-400 font-bold">{activeDetailReport.mushroomData.species}</strong>
                  </div>
                )}
                {activeDetailReport.mushroomData?.forestType && (
                  <div className="bg-[#16110e] p-2.5 rounded-xl border border-[#32261e]">
                    <span className="text-[#a8998e] block text-[10px]">Orman / Ağaç Tipi</span>
                    <strong className="text-[#f4eee6] font-bold">{activeDetailReport.mushroomData.forestType}</strong>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#32261e] text-xs text-[#a8998e]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> {getDisplayTime(activeDetailReport.createdAt, activeDetailReport.timeString)}
                </span>
                <span className="text-emerald-500 font-bold">Güvenilirlik: %{activeDetailReport.trustScore}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#32261e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleVote(activeDetailReport.id, 'up')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeDetailReport.upvotes}</span>
                </button>
                <button 
                  onClick={() => handleVote(activeDetailReport.id, 'down')}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>{activeDetailReport.downvotes}</span>
                </button>
              </div>

              <button 
                onClick={() => setActiveDetailReport(null)}
                className="px-4 py-2 rounded-xl bg-[#261d15] hover:bg-[#36291e] text-[#d4c5b9] text-xs font-medium transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}

      <AddMushroomReportModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCoords(null); }}
        onAddReport={handleAddNewReport}
        selectedCoords={selectedCoords}
      />

      {/* Bilgilendirme Modalı */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c140d] border border-amber-700/40 w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-[#f4eee6] space-y-4">
            <div className="flex items-center justify-between border-b border-[#32261e] pb-3">
              <div className="flex items-center gap-2 text-amber-500">
                <Info className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Nasıl Kullanılır?</h2>
              </div>
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 rounded-lg bg-[#261d15] hover:bg-[#36291e] text-[#a8998e] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-[#d4c5b9] leading-relaxed font-medium">
              <div className="flex items-start gap-3 bg-[#16110e] p-3 rounded-xl border border-[#32261e]">
                <span className="w-5 h-5 rounded-full bg-amber-900/40 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-700/40">1</span>
                <div>
                  <strong className="text-white block mb-0.5">Canlı Orman Ağı</strong>
                  Haritadan konum seçerek mantar bulduğunuz meraları paylaşabilir, en güncel 10 raporu sol akışta görebilirsiniz.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#16110e] p-3 rounded-xl border border-[#32261e]">
                <span className="w-5 h-5 rounded-full bg-amber-900/40 text-amber-400 font-bold flex items-center justify-center shrink-0 border border-amber-700/40">2</span>
                <div>
                  <strong className="text-white block mb-0.5">Otomatik Silinme</strong>
                  Paylaşılan raporlar 24 saat sonra sistemden otomatik olarak temizlenir.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
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