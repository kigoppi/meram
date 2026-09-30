'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Fish, Tent, Send, AlertCircle, Loader2, Upload, CheckCircle2 } from 'lucide-react';
import { getReverseGeocode } from '@/lib/geocoding';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (newReport: any) => void;
  moduleType: 'fishing' | 'camping';
  selectedCoords?: { lat: number; lng: number } | null;
}

// İstediğiniz güncel balık türleri listesi
const FISH_SPECIES = [
  'Lüfer',
  'İstavrit',
  'Sarıkanat',
  'Palamut',
  'Sardalya',
  'Levrek',
  'Çinekop',
  'Yaprak',
  'Karagöz',
  'Çipura',
  'İskorpit',
  'Kırlangıç',
  'Mercan',
  'Sinagrit',
  'Minakop',
  'Zargana',
  'Gümüş',
  'Uskumru',
  'Kolyoz',
  'Hamsi'
];

interface LocationResult {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

export default function AddReportModal({ isOpen, onClose, onAddReport, moduleType, selectedCoords }: AddReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [content, setContent] = useState('');
  const [fishType, setFishType] = useState('');
  const [lure, setLure] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [suggestions, setSuggestions] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function resolveLocation() {
      if (selectedCoords) {
        setResolvedCoords(selectedCoords);
        setIsLoadingLocation(true);
        setLocationName('Konum çözümleniyor...');
        const resolvedName = await getReverseGeocode(selectedCoords.lat, selectedCoords.lng);
        setLocationName(resolvedName);
        setIsLoadingLocation(false);
      }
    }
    resolveLocation();
  }, [selectedCoords]);

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationName(query);
    setResolvedCoords(null);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (err) {
        console.error('Konum arama hatası:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (item: LocationResult) => {
    setLocationName(item.name);
    setResolvedCoords({ lat: item.lat, lng: item.lon });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 10) {
      setError('Rapor başlığı en az 10 karakter olmalıdır ve sadece boşluk içeremez.');
      return;
    }

    if (moduleType === 'fishing' && !fishType.trim()) {
      setError('Lütfen hedef balık türünü seçin veya yazın.');
      return;
    }

    if (!imageUrl) {
      setError('Mera raporu paylaşmak için avlağa veya balığa ait bir fotoğraf yüklemek zorunludur.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const finalCoords = resolvedCoords || selectedCoords || { lat: 39.0, lng: 35.0 };

    const newReport = {
      id: Date.now().toString(),
      title: trimmedTitle,
      locationName: locationName.trim() || 'Türkiye Konumu',
      author: 'Mehmet E.',
      trustScore: 85,
      timeString: timeString,
      createdAt: now.getTime(),
      content: content.trim(),
      upvotes: 1,
      downvotes: 0,
      status: 'pending',
      coordinates: finalCoords,
      imageUrl,
      subData: moduleType === 'fishing' ? {
        fishType: fishType.trim(),
        lure: lure.trim() || 'Belirtilmedi',
        waterCondition: 'Normal'
      } : {
        isCrowded: 'Normal',
        waterRunning: true
      }
    };

    onAddReport(newReport);
    setTitle('');
    setLocationName('');
    setContent('');
    setFishType('');
    setLure('');
    setImageUrl('');
    setResolvedCoords(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 relative shadow-2xl text-white space-y-6 my-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            {moduleType === 'fishing' ? <Fish className="w-5 h-5 text-blue-400" /> : <Tent className="w-5 h-5 text-emerald-400" />}
            <h2 className="text-lg font-bold">
              {moduleType === 'fishing' ? 'Yeni Mera Raporu Ekle' : 'Yeni Kamp Alanı Ekle'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">Rapor Başlığı</label>
              <span className="text-[10px] text-slate-500">Min. 10 karakter</span>
            </div>
            <input 
              type="text" 
              required
              placeholder="Örn: Saroz Körfezi Levrek Durumu" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">Konum / Bölge Adı</label>
              {(isLoadingLocation || isSearching) && (
                <span className="text-[10px] text-blue-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Aranıyor...
                </span>
              )}
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                required
                autoComplete="off"
                placeholder="Türkiye'de herhangi bir yer yazın veya seçin" 
                value={locationName}
                onChange={handleLocationInputChange}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-blue-600/20 hover:text-white transition-colors border-b border-slate-800/60 last:border-none flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {moduleType === 'fishing' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hedef Balık Türü *</label>
                {/* Hem listeden seçilebilen hem de yazılarak öneri alınabilen/özel tür girilebilen input (datalist destekli) */}
                <input
                  type="text"
                  list="fish-species-list"
                  required
                  placeholder="Seçin veya yazın..."
                  value={fishType}
                  onChange={(e) => setFishType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
                <datalist id="fish-species-list">
                  {FISH_SPECIES.map((fish) => (
                    <option key={fish} value={fish} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kullanılan Yem / Takım</label>
                <input 
                  type="text" 
                  placeholder="Örn: Silikon / Rapala" 
                  value={lure}
                  onChange={(e) => setLure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                />
              </div>
            </div>
          )}

          {/* FOTOĞRAF YÜKLEME ALANI */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-300">
                Mera / Balık Fotoğrafı <span className="text-rose-500">* (Zorunlu)</span>
              </label>
              {imageUrl && (
                <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Fotoğraf Yüklendi
                </span>
              )}
            </div>
            
            <div className="relative border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-3 text-center transition-colors bg-slate-950/50">
              <input 
                type="file" 
                accept="image/*,.heic,.heif"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {imageUrl ? (
                <div className="flex items-center justify-center gap-3">
                  <img src={imageUrl} alt="Önizleme" className="w-14 h-14 rounded-lg object-cover border border-blue-500/40" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">Fotoğraf Eklendi</p>
                    <p className="text-[10px] text-blue-400">Değiştirmek için tıklayın</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <Upload className="w-5 h-5 text-blue-400 mx-auto animate-bounce" />
                  <p className="text-xs font-semibold text-slate-300">Cihazdan Fotoğraf Seçin</p>
                  <p className="text-[10px] text-slate-500">PNG, JPG, WEBP, HEIC</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Detaylı Açıklama & Durum</label>
            <textarea 
              rows={3}
              required
              placeholder="Su rengi, akıntı durumu, hava koşulları..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors cursor-pointer"
            >
              İptal
            </button>
            <button 
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Raporu Paylaş</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}