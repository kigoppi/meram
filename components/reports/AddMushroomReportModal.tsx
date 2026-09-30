'use client';

import React, { useState } from 'react';
import { X, MapPin, Upload, Navigation, Loader2, Compass, AlertCircle } from 'lucide-react';

interface AddMushroomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: any) => void;
  onStartMapSelection?: () => void;
  selectedCoords?: { lat: number; lng: number } | null;
}

export default function AddMushroomReportModal({ isOpen, onClose, onAddReport, onStartMapSelection, selectedCoords }: AddMushroomReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [content, setContent] = useState('');
  const [species, setSpecies] = useState('');         
  const [imagePreview, setImagePreview] = useState('');
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const handleGetDeviceLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servislerini desteklemiyor.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setGpsCoords(coords);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('GPS Hatası:', error);
        setLocationError('GPS konumu alınamadı. Lütfen "Haritadan Seç" seçeneğini kullanın.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const finalActiveCoords = gpsCoords || selectedCoords;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !finalActiveCoords) return;

    const newReport = {
      id: Date.now().toString(),
      title: title.trim(),
      locationName: locationName.trim(),
      content: content.trim() || 'Ek açıklama girilmedi.',
      author: 'Gezgin Avcı',
      trustScore: 85,
      upvotes: 3,
      downvotes: 0,
      status: 'verified',
      createdAt: Date.now(),
      coordinates: finalActiveCoords, 
      imageUrl: imagePreview || '',
      mushroomData: {
        species: species.trim() || 'Kanlıca Mantarı',
        forestType: 'Ormanlık Alan',
        soilCondition: 'Nemli / Yağmur Sonrası'
      }
    };

    onAddReport(newReport);
    setTitle('');
    setLocationName('');
    setContent('');
    setSpecies('');
    setImagePreview('');
    setGpsCoords(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1c140d] border border-amber-700/40 w-full max-w-md rounded-2xl p-5 sm:p-6 relative shadow-2xl text-[#f4eee6] space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-[#32261e] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Yeni Mantar Avı Raporu Ekle</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg bg-[#261d15] hover:bg-[#36291e] text-[#a8998e] hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[#d4c5b9] font-medium mb-1">Rapor Başlığı *</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Bolu Çamlıklarında Bol Kanlıca Çıktı" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-[#d4c5b9] font-medium mb-1">Orman / Mera Konum Adı *</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Abant Ormanları Girişi" 
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Konum Belirleme Yöntemleri (Responsive Alt Alta / Yan Yana) */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${finalActiveCoords ? 'bg-[#16110e] border-emerald-600/50' : 'bg-amber-950/20 border-amber-600/40'}`}>
            <span className="text-[#d4c5b9] font-medium block">
              Konum Belirleme Yöntemi <span className="text-amber-500">*Zorunlu</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleGetDeviceLocation}
                disabled={isGettingLocation}
                className="py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md text-xs w-full"
              >
                {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                <span>Konumdan Al (GPS)</span>
              </button>

              {onStartMapSelection && (
                <button
                  type="button"
                  onClick={onStartMapSelection}
                  className="py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md text-xs w-full"
                >
                  <Compass className="w-4 h-4" />
                  <span>Haritadan Seç</span>
                </button>
              )}
            </div>

            {finalActiveCoords ? (
              <p className="text-[10px] text-emerald-400 font-mono text-center">
                ✓ Konum Alındı: {finalActiveCoords.lat.toFixed(4)}, {finalActiveCoords.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[10px] text-amber-400 flex items-center justify-center gap-1 text-center">
                <AlertCircle className="w-3 h-3 shrink-0" /> Lütfen yukarıdan bir yöntem seçin.
              </p>
            )}

            {locationError && (
              <p className="text-[10px] text-rose-400 text-center font-medium bg-rose-950/50 p-1.5 rounded">
                {locationError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[#d4c5b9] font-medium mb-1">Mantar Türü</label>
            <input 
              type="text" 
              placeholder="Örn: Kuzu Göbeği / Kanlıca" 
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-[#d4c5b9] font-medium mb-1">Mantar Fotoğrafı Yükle</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 bg-[#16110e] border border-dashed border-amber-700/50 hover:border-amber-500 rounded-xl px-3 py-3 text-[#d4c5b9] hover:text-white cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-amber-500" />
                <span className="truncate">{imagePreview ? 'Fotoğraf Seçildi (Değiştir)' : 'Cihazdan Fotoğraf Seç'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="w-12 h-12 rounded-xl border border-amber-700/50 overflow-hidden shrink-0 relative">
                  <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[#d4c5b9] font-medium mb-1">Detaylar / Arazi Notları</label>
            <textarea 
              rows={3}
              placeholder="Zemin nemi, toplama yüksekliği vb. detaylar..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-[#16110e] border border-[#32261e] rounded-xl p-3 text-white focus:outline-none focus:border-amber-600 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#261d15] hover:bg-[#36291e] text-[#d4c5b9] transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={!finalActiveCoords}
              className={`px-5 py-2 rounded-xl font-bold transition-all shadow-lg ${
                finalActiveCoords ? 'bg-gradient-to-r from-amber-700 to-emerald-800 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {finalActiveCoords ? 'Raporu Yayınla' : 'Konum Seçilmedi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}