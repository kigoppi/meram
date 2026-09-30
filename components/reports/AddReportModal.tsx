'use client';

import React, { useState } from 'react';
import { X, MapPin, Upload, Navigation, Loader2, AlertCircle, HelpCircle, Compass } from 'lucide-react';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: any) => void;
  moduleType: 'fishing' | 'mushroom';
  onOpenMapSelector?: () => void;
  selectedCoords?: { lat: number; lng: number } | null;
}

const FISH_SPECIES_LIST = [
  'Lüfer',
  'Çinekop',
  'Palamut',
  'İstavrit',
  'Sarıkanat',
  'Sardalya',
  'Levrek',
  'Çipura',
  'Karagöz',
  'İskorpit',
  'Kırlangıç',
  'Mercan',
  'Sinagrit',
  'Minakop',
  'Zargana',
  'Gümüş',
  'Uskumru',
  'Kolyoz'
];

export default function AddReportModal({ isOpen, onClose, onAddReport, onOpenMapSelector, selectedCoords }: AddReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [content, setContent] = useState('');
  const [selectedFish, setSelectedFish] = useState(''); 
  const [lureField, setLureField] = useState(''); 
  const [imagePreview, setImagePreview] = useState('');

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const handleGetDeviceLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    setShowHelp(false);

    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servislerini desteklemiyor.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('GPS Hatası:', error);
        let errorMsg = 'Konum alınamadı. İzinleri kontrol edin.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Konum izni reddedildi.';
          setShowHelp(true);
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Konum zaman aşımına uğradı.';
        }
        setLocationError(errorMsg);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim() || !selectedCoords) return;

    const newReport = {
      id: Date.now().toString(),
      title: title.trim(),
      locationName: locationName.trim(),
      content: content.trim() || 'Ek açıklama girilmedi.',
      author: 'Gezgin Avcı',
      trustScore: 80,
      upvotes: 4,
      downvotes: 0,
      status: 'verified',
      createdAt: Date.now(),
      coordinates: selectedCoords,
      imageUrl: imagePreview || '',
      subData: {
        fishType: selectedFish.trim() || 'Lüfer',
        lure: lureField.trim() || 'Rapala + Kurşun'
      }
    };

    onAddReport(newReport);
    setTitle('');
    setLocationName('');
    setContent('');
    setSelectedFish('');
    setLureField('');
    setImagePreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#030712] border border-cyan-500/40 w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-white space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Yeni Balıkçılık Raporu Ekle</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Rapor Başlığı *</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Çubuklu Akıntısında Çinekop Bol" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mera / Konum Adı *</label>
            <input 
              type="text" 
              required
              placeholder="Örn: Beykoz Sahil" 
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Konum Belirleme Alanı (GPS veya Haritadan Seç) */}
          <div className={`p-3 rounded-xl border space-y-2 ${selectedCoords ? 'bg-slate-950 border-emerald-600/50' : 'bg-cyan-950/20 border-cyan-600/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                Konum Bilgisi <span className="text-cyan-400">*Zorunlu</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGetDeviceLocation}
                  disabled={isGettingLocation}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 text-[11px]"
                >
                  {isGettingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  <span>GPS Al</span>
                </button>

                {onOpenMapSelector && (
                  <button
                    type="button"
                    onClick={onOpenMapSelector}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                  >
                    <Compass className="w-3 h-3" />
                    <span>Haritadan Seç</span>
                  </button>
                )}
              </div>
            </div>

            {selectedCoords ? (
              <p className="text-[10px] text-emerald-400 font-mono">
                ✓ Seçilen Konum: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
              </p>
            ) : (
              <p className="text-[10px] text-cyan-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> Lütfen GPS kullanın ya da "Haritadan Seç" butonuna basın.
              </p>
            )}

            {locationError && (
              <div className="space-y-1 pt-1">
                <p className="text-[10px] text-rose-400 font-medium bg-rose-950/50 p-2 rounded border border-rose-900/50 flex items-center justify-between">
                  <span>{locationError}</span>
                  {showHelp && <HelpCircle className="w-4 h-4 text-rose-300 shrink-0 ml-1" />}
                </p>
                {showHelp && (
                  <p className="text-[9px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 leading-relaxed">
                    💡 <strong>Çözüm:</strong> Tarayıcı kilit simgesinden konum iznini verin veya doğrudan <strong>Haritadan Seç</strong> özelliğini kullanın.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hedef Balık Türü</label>
              <input 
                type="text" 
                list="fish-species-options"
                placeholder="Seçin veya yazın..." 
                value={selectedFish}
                onChange={(e) => setSelectedFish(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
              <datalist id="fish-species-options">
                {FISH_SPECIES_LIST.map((fish) => (
                  <option key={fish} value={fish} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Kullanılan Takım</label>
              <input 
                type="text" 
                placeholder="Örn: Rapala" 
                value={lureField}
                onChange={(e) => setLureField(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Mera Fotoğrafı Yükle</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-950 border border-dashed border-cyan-800 hover:border-cyan-500 rounded-xl px-3 py-3 text-slate-300 hover:text-white cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className="truncate">{imagePreview ? 'Fotoğraf Seçildi (Değiştir)' : 'Cihazdan Fotoğraf Seç'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="w-12 h-12 rounded-xl border border-cyan-800 overflow-hidden shrink-0 relative">
                  <img src={imagePreview} alt="Önizleme" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Detaylar / Açıklama</label>
            <textarea 
              rows={3}
              placeholder="Mera hakkında ek detaylar yazın..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit"
              disabled={!selectedCoords}
              className={`px-5 py-2 rounded-xl font-bold transition-all shadow-lg ${
                selectedCoords ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {selectedCoords ? 'Raporu Yayınla' : 'Konum Seçilmedi'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}