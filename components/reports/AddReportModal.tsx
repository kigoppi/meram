'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: any) => void;
  moduleType: 'fishing' | 'mushroom';
  onStartMapSelection?: () => void;
  selectedCoords?: { lat: number; lng: number } | null;
}

const FISH_TYPES = [
  'Palamut', 'Lüfer', 'Çinekop', 'İstavrit', 'Çipura', 
  'Levrek', 'Kalkan', 'Uskumru', 'Kofana', 'Zargana', 'Diğer'
];

export default function AddReportModal({
  isOpen,
  onClose,
  onAddReport,
  moduleType,
  onStartMapSelection,
  selectedCoords
}: AddReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [fishType, setFishType] = useState('Palamut');
  const [lure, setLure] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [localCoords, setLocalCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (selectedCoords) {
      setLocalCoords(selectedCoords);
    }
  }, [selectedCoords]);

  if (!isOpen) return null;

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Tarayıcınız konum servislerini desteklemiyor.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocalCoords(coords);
        setIsGettingLocation(false);
        alert('GPS Konumunuz başarıyla alındı!');
      },
      (error) => {
        console.error(error);
        setIsGettingLocation(false);
        alert('Konum alınamadı. Lütfen konum izinlerini kontrol edin veya haritadan seçin.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Fotoğraf zorunluluğu kontrolü
    if (!imageUrl) {
      alert('Lütfen rapor için bir fotoğraf yükleyin.');
      return;
    }

    if (!localCoords) {
      alert('Lütfen GPS ile veya Haritadan tıklayarak bir konum belirleyin.');
      return;
    }

    const newReport = {
      id: Math.random().toString(36).substring(2, 9),
      title: title || `${fishType} Avı Raporu`,
      locationName: locationName || 'Çubuklu / Boğaz Hattı',
      author: 'Gezgin Avcı',
      trustScore: 80,
      content: content || 'Harika bir av günüydü, meralar oldukça hareketli.',
      upvotes: 0,
      downvotes: 0,
      status: 'pending',
      createdAt: Date.now(),
      coordinates: localCoords,
      imageUrl,
      subData: {
        fishType,
        lure: lure || 'Sahte / Silikon'
      }
    };

    onAddReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative shadow-2xl text-slate-100 space-y-4 my-auto">
        
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white uppercase">Yeni Balıkçılık Raporu</h2>
              <p className="text-[10px] text-cyan-400 font-medium">Mera bilgisini diğer avcılarla paylaş</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Rapor Başlığı</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Çubuklu Akıntıda Palamut Başladı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Mera / Konum Adı</label>
              <input 
                type="text" 
                required
                placeholder="Örn: Çubuklu Sahil"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">Hedef Balık</label>
              <select 
                value={fishType}
                onChange={(e) => setFishType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
              >
                {FISH_TYPES.map(fish => (
                  <option key={fish} value={fish}>{fish}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Kullanılan Takım / Sahte</label>
            <input 
              type="text" 
              placeholder="Örn: 75gr Kurşun Arkası Beyaz Rapala"
              value={lure}
              onChange={(e) => setLure(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Konum Seçimi <span className="text-rose-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isGettingLocation ? 'Alınıyor...' : 'GPS Konumum'}</span>
              </button>

              <button 
                type="button"
                onClick={onStartMapSelection}
                className="py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 text-cyan-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Haritadan Seç</span>
              </button>
            </div>
            {localCoords && (
              <p className="text-[10px] text-emerald-400 font-medium pt-1">
                ✓ Konum Seçildi ({localCoords.lat.toFixed(4)}, {localCoords.lng.toFixed(4)})
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Fotoğraf Yükle <span className="text-rose-400">* (Zorunlu)</span></label>
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-2.5">
              <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Dosya Seç</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <span className="text-[11px] text-slate-400 truncate">
                {imageUrl ? '✓ Fotoğraf yüklendi' : 'Fotoğraf seçilmedi'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Açıklama / Detaylar</label>
            <textarea 
              rows={2}
              placeholder="Meradaki su durumu, akıntı ve balığın boyutu hakkında bilgi verin..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              Raporu Yayınla
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}