'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Fish, MapPin, ThumbsUp, ThumbsDown, Plus, 
  Compass, ArrowLeft, X, Clock, Sparkles, Waves, Info, User, LogOut
} from 'lucide-react';
import AddReportModal from '@/components/reports/AddReportModal';
import { supabase } from '@/lib/supabase';

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

  const [showWeatherLayer, setShowWeatherLayer] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [activeDetailReport, setActiveDetailReport] = useState<Report | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'latest' | 'archive'>('map');

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);

  // Kullanıcı Girişi State'leri
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  // Yorumlar State'leri
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('app_username');
    if (savedUser) {
      setCurrentUser(savedUser);
    }

    fetchReportsFromSupabase();

    const channel = supabase
      .channel('public:fishing_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fishing_reports' }, () => {
        fetchReportsFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (activeDetailReport) {
      fetchComments(activeDetailReport.id, 'fishing_report_comments');
    } else {
      setComments([]);
    }
  }, [activeDetailReport]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUsername.trim()) return;
    const name = tempUsername.trim();
    localStorage.setItem('app_username', name);
    setCurrentUser(name);
    setIsAuthModalOpen(false);
    setTempUsername('');
  };

  const handleLogout = () => {
    localStorage.removeItem('app_username');
    setCurrentUser('');
  };

  const requireAuth = (actionCallback: () => void) => {
    const savedUser = localStorage.getItem('app_username');
    if (!savedUser) {
      setIsAuthModalOpen(true);
    } else {
      setCurrentUser(savedUser);
      actionCallback();
    }
  };

  const fetchComments = async (reportId: string, tableName: string) => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setComments(data);
    }
  };

  const handleAddComment = async (tableName: string) => {
    if (!newCommentText.trim() || !activeDetailReport) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const payload = {
      report_id: activeDetailReport.id,
      author: currentUser,
      content: newCommentText.trim(),
      created_at: Date.now()
    };

    const { error } = await supabase.from(tableName).insert([payload]);

    if (error) {
      console.error('Yorum eklenemedi:', error.message);
      return;
    }

    setNewCommentText('');
    fetchComments(activeDetailReport.id, tableName);
  };

  const fetchReportsFromSupabase = async () => {
    const { data, error } = await supabase
      .from('fishing_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Raporlar çekilemedi:', error);
      return;
    }

    if (data) {
      const now = Date.now();
      const formatted: Report[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        locationName: item.location_name,
        author: item.author || 'Gezgin Avcı',
        trustScore: item.trust_score,
        content: item.content,
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        status: item.status,
        createdAt: Number(item.created_at),
        coordinates: item.lat && item.lng ? { lat: item.lat, lng: item.lng } : null,
        imageUrl: item.image_url,
        subData: {
          fishType: item.fish_type,
          lure: item.lure
        }
      }));

      const validReports = formatted.filter(rep => {
        const createdAt = rep.createdAt || now;
        return (now - createdAt) <= ONE_DAY_IN_MS;
      });

      setReports(validReports);
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    const target = reports.find(r => r.id === id);
    if (!target) return;

    const newUpvotes = type === 'up' ? target.upvotes + 1 : target.upvotes;
    const newDownvotes = type === 'down' ? target.downvotes + 1 : target.downvotes;
    const totalVotes = newUpvotes + newDownvotes;
    const calculatedTrust = totalVotes > 0 ? Math.round((newUpvotes / totalVotes) * 100) : 50;
    const newStatus = calculatedTrust >= 70 ? 'verified' : 'pending';

    const { error } = await supabase
      .from('fishing_reports')
      .update({
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        trust_score: calculatedTrust,
        status: newStatus
      })
      .eq('id', id);

    if (error) {
      console.error('Oylama güncellenemedi:', error);
      return;
    }

    fetchReportsFromSupabase();
  };

  const handleAddNewReport = async (newReport: Report) => {
    const payload = {
      id: newReport.id,
      title: newReport.title,
      location_name: newReport.locationName,
      author: currentUser || 'Gezgin Avcı',
      trust_score: newReport.trustScore || 80,
      content: newReport.content,
      upvotes: newReport.upvotes || 0,
      downvotes: newReport.downvotes || 0,
      status: newReport.status || 'pending',
      created_at: newReport.createdAt || Date.now(),
      lat: newReport.coordinates?.lat || null,
      lng: newReport.coordinates?.lng || null,
      image_url: newReport.imageUrl || '',
      fish_type: newReport.subData?.fishType || '',
      lure: newReport.subData?.lure || ''
    };

    const { error } = await supabase.from('fishing_reports').insert([payload]);

    if (error) {
      console.error('Rapor eklenemedi:', error);
      alert('Rapor buluta kaydedilirken bir hata oluştu.');
      return;
    }

    setSelectedCoords(null);
    fetchReportsFromSupabase();
  };

  const handleStartMapSelection = () => {
    setIsModalOpen(false);
    setIsSelectingLocation(true);
    setMobileTab('map');
  };

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (isSelectingLocation) {
      setSelectedCoords(coords);
      setIsSelectingLocation(false);
      setIsModalOpen(true);
    }
  };

  const getDisplayTime = (createdAt?: number) => {
    if (!createdAt) return 'Bilinmiyor';
    
    const now = new Date();
    const reportDate = new Date(createdAt);
    const timeString = reportDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const isToday = 
      now.getDate() === reportDate.getDate() &&
      now.getMonth() === reportDate.getMonth() &&
      now.getFullYear() === reportDate.getFullYear();

    if (isToday) {
      return timeString; 
    }

    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reportDateOnly = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
    const diffDays = Math.round((nowDateOnly.getTime() - reportDateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Dün';
    if (diffDays === 2) return 'İki gün önce';

    return timeString;
  };

  const sortedReports = [...reports].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const latestReports = sortedReports.slice(0, 10);
  const olderReports = sortedReports.slice(10);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {isSelectingLocation && (
        <div className="bg-cyan-600 text-white text-center py-2 px-4 text-xs font-bold z-[100] animate-pulse flex items-center justify-center gap-2">
          <span>📍 Harita üzerinde rapor bırakmak istediğiniz konuma tıklayın...</span>
          <button 
            onClick={() => { setIsSelectingLocation(false); setIsModalOpen(true); }}
            className="underline text-[11px] bg-cyan-900/60 px-2 py-0.5 rounded cursor-pointer"
          >
            İptal
          </button>
        </div>
      )}

      {/* Sıkışma Önleyici Optimize Header & Profil Göstergesi */}
      <header className="h-14 sm:h-16 border-b border-cyan-900/30 bg-[#030712]/95 backdrop-blur-xl px-2 sm:px-6 flex items-center justify-between shrink-0 z-50 shadow-2xl gap-1">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
          <button 
            onClick={() => router.push('/')}
            className="group px-2 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 transition-all flex items-center gap-1 text-[11px] sm:text-xs font-semibold cursor-pointer shadow-md shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden xs:inline">Anasayfa</span>
          </button>
          
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                <Fish className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-[11px] sm:text-sm font-black tracking-wide bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent truncate">
                BALIKÇILIK
              </h1>
              <p className="text-[8px] sm:text-[9px] text-cyan-500/80 font-medium tracking-wider uppercase hidden sm:block">Bildirim Platformu</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-900 border border-cyan-500/30 px-2 py-1 rounded-xl text-[11px]">
              <span className="text-cyan-400 font-bold truncate max-w-[80px] sm:max-w-[120px]">{currentUser}</span>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1 transition-colors" title="Çıkış Yap">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-colors border border-cyan-500/30 flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Giriş Yap</span>
            </button>
          )}

          <button 
            onClick={() => setIsInfoModalOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-800 text-cyan-400 transition-colors cursor-pointer shadow-md"
            title="Nasıl Kullanılır?"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => requireAuth(() => setIsModalOpen(true))}
            className="group relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-cyan-600/35 transition-all cursor-pointer border border-cyan-400/30 active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-300" />
            <span className="hidden sm:inline">Rapor Ekle</span>
            <span className="inline sm:hidden">Ekle</span>
          </button>
        </div>
      </header>

      {/* Kullanıcı Giriş Modalı */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#030712] border border-cyan-500/50 w-full max-w-sm rounded-2xl p-6 relative shadow-2xl text-white space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 mb-2">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold">Avcı Kimliği Gerekiyor</h2>
              <p className="text-xs text-slate-400">Rapor ve yorum paylaşabilmek için lütfen bir rumuz (isim) belirleyin.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <input 
                  type="text" 
                  required
                  placeholder="Örn: BoğazKurdu"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 font-medium text-center"
                  maxLength={20}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button 
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs uppercase shadow-lg shadow-cyan-600/3ony"
                >
                  Tamam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex lg:hidden bg-slate-950 border-b border-cyan-900/40 p-1.5 shrink-0 z-40 justify-around text-xs font-bold">
        <button
          onClick={() => setMobileTab('latest')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'latest' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Güncel ({latestReports.length})</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'map' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>Harita</span>
        </button>
        <button
          onClick={() => setMobileTab('archive')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'archive' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Arşiv ({olderReports.length})</span>
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-7rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">
        
        <div className={`lg:col-span-3 bg-[#030712] border-r border-cyan-900/30 flex flex-col h-full overflow-hidden ${
          mobileTab === 'latest' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="p-3.5 border-b border-cyan-900/20 bg-[#030712]/90 shrink-0 hidden lg:flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>En Güncel Akış</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
              {latestReports.length} / 10
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {latestReports.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                <p className="text-xs text-slate-400">Henüz bulutta rapor bulunmuyor.</p>
              </div>
            ) : (
              latestReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => setActiveDetailReport(report)}
                  className="group p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-slate-900 transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {getDisplayTime(report.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.subData?.fishType && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
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

        <div className={`lg:col-span-6 relative bg-[#0b0f19] border-r border-cyan-900/30 flex flex-col h-full overflow-hidden ${
          mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
        }`}>
          <InteractiveMap 
            reports={reports} 
            showWeatherLayer={showWeatherLayer}
            onWeatherLayerToggle={setShowWeatherLayer}
            onMapClick={handleMapClick}
          />
        </div>

        <div className={`lg:col-span-3 bg-[#030712] flex flex-col h-full overflow-hidden ${
          mobileTab === 'archive' ? 'flex' : 'hidden lg:flex'
        }`}>
          <div className="p-3.5 border-b border-cyan-900/20 bg-[#030712]/90 shrink-0 hidden lg:flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400 animate-spin-slow" />
              <span>Diğer Raporlar</span>
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
                  className="group p-3 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all duration-200 cursor-pointer space-y-1.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" /> {report.locationName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {getDisplayTime(report.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-300 group-hover:text-cyan-200 transition-colors truncate">
                    {report.title}
                  </h3>

                  {report.subData?.fishType && (
                    <div className="flex items-center justify-between pt-1 text-[11px]">
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

      {activeDetailReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative shadow-2xl text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {activeDetailReport.locationName}
                </span>
                <span className="text-[10px] text-slate-400">• {activeDetailReport.author}</span>
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
                <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-800">
                  <img src={activeDetailReport.imageUrl} alt="Rapor Detayı" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
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
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {getDisplayTime(activeDetailReport.createdAt)}
                </span>
                <span className="text-emerald-400 font-bold">Güvenilirlik: %{activeDetailReport.trustScore}</span>
              </div>

              {/* Yorumlar Bölümü */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Mera Yorumları ({comments.length})</h3>
                
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {comments.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic">Henüz yorum yapılmamış. İlk yorumu sen yaz!</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-cyan-300">{c.author}</span>
                          <span>{new Date(c.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-slate-200">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mera hakkında bir yorum yaz..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment('fishing_report_comments'); }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button 
                    type="button"
                    onClick={() => requireAuth(() => handleAddComment('fishing_report_comments'))}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md"
                  >
                    Gönder
                  </button>
                </div>
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

      <AddReportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddReport={handleAddNewReport}
        moduleType="fishing"
        onStartMapSelection={handleStartMapSelection}
        selectedCoords={selectedCoords}
      />

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

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30">1</span>
                <div>
                  <strong className="text-white block mb-0.5">Ortak Bulut Ağı</strong>
                  Farklı cihazlardan bağlanan tüm kullanıcılar aynı anda birbirlerinin raporlarını haritada ve akışta görür.
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30">2</span>
                <div>
                  <strong className="text-white block mb-0.5">Canlı Senkronizasyon</strong>
                  Eklenen raporlar ve yapılan oylamalar sayfayı yenilemeye gerek kalmadan anında herkese yansır.
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-lg"
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