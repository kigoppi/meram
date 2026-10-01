'use class';
'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Image as ImageIcon, Trees } from 'lucide-react';

interface AddMushroomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: any) => void;
  onStartMapSelection?: () => void;
  selectedCoords?: { lat: number; lng: number } | null;
}

const MUSHROOM_SPECIES = [
  'Kanlıca Mantarı (Çintar)', 'Kuzu Göbeği', 'İstiridye Mantarı', 
  'Porçini (Ayı Mantarı)', 'Çörek Mantarı', 'Yenilebilir Diğer', 'Şüpheli / Bilinmiyor'
];

export default function AddMushroomReportModal({
  isOpen,
  onClose,
  onAddReport,
  onStartMapSelection,
  selectedCoords
}: AddMushroomReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [species, setSpecies] = useState('Kanlıca Mantarı (Çintar)');
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
      alert('Lütfen mantar bulduğunuz alana ait bir fotoğraf yükleyin.');
      return;
    }

    if (!localCoords) {
      alert('Lütfen GPS ile veya Haritadan tıklayarak bir konum belirleyin.');
      return;
    }

    const newReport = {
      id: Math.random().toString(36).substring(2, 9),
      title: title || `${species} Bulundu`,
      locationName: locationName || 'Çamlık Ormanlık Alan',
      author: 'Gezgin Avcı',
      trustScore: 85,
      content: content || 'Yağmur sonrasında oldukça bereketli bir meraydı.',
      upvotes: 0,
      downvotes: 0,
      status: 'pending',
      createdAt: Date.now(),
      coordinates: localCoords,
      imageUrl,
      mushroomData: {
        species,
        forestType: 'Ormanlık Alan',
        soilCondition: 'Nemli / Yağmur Sonrası'
      }
    };

    onAddReport(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#1c140d] border border-amber-700/40 w-full max-w-lg rounded-2xl p-5 sm:p-6 relative shadow-2xl text-[#f4eee6] space-y-4 my-auto">
        
        <div className="flex items-center justify-between border-b border-[#32261e] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-950/60 text-amber-500 border border-amber-800/40">
              <Trees className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-wide text-white uppercase">Yeni Mantar Avı Raporu</h2>
              <p className="text-[10px] text-amber-500 font-medium">Mera ve tür bilgisini doğa dostlarıyla paylaş</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#261d15] hover:bg-[#36291e] text-[#a8998e] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="space-y-1">
            <label className="text-[#d4c5b9] font-bold block">Rapor Başlığı</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Çam Ormanı Derinliklerinde Çintar Bol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2 text-white focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#d4c5b9] font-bold block">Bölge / Orman Adı</label>
              <input 
                type="text" 
                required
                placeholder="Örn: Belgrad Ormanı Girişi"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2 text-white focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#d4c5b9] font-bold block">Mantar Türü</label>
              <select 
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2 text-white focus:border-amber-600 focus:outline-none"
              >
                {MUSHROOM_SPECIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#d4c5b9] font-bold block">Konum Seçimi <span className="text-rose-400">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isGettingLocation}
                className="py-2 px-3 rounded-xl bg-[#261d15] hover:bg-[#36291e] border border-[#3d2e24] text-amber-400 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isGettingLocation ? 'Alınıyor...' : 'GPS Konumum'}</span>
              </button>

              <button 
                type="button"
                onClick={onStartMapSelection}
                className="py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
            <label className="text-[#d4c5b9] font-bold block">Fotoğraf Yükle <span className="text-rose-400">* (Zorunlu)</span></label>
            <div className="flex items-center gap-3 bg-[#16110e] border border-[#32261e] rounded-xl p-2.5">
              <label className="cursor-pointer bg-amber-700 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Dosya Seç</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <span className="text-[11px] text-[#a8998e] truncate">
                {imageUrl ? '✓ Fotoğraf yüklendi' : 'Fotoğraf seçilmedi'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#d4c5b9] font-bold block">Açıklama / Detaylar</label>
            <textarea 
              rows={2}
              placeholder="Ormanın nem durumu, ağaç türü (çam, meşe vb.) hakkında bilgi verin..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2 text-white focus:border-amber-600 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#261d15] hover:bg-[#36291e] text-[#d4c5b9] font-medium transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-600 hover:to-yellow-600 text-white font-bold shadow-lg shadow-amber-950/50 transition-all cursor-pointer"
            >
              Raporu Yayınla
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}