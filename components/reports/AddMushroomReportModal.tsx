'use client';

import React, { useState } from 'react';
import { X, MapPin, Upload, Image as ImageIcon } from 'lucide-react';

interface AddMushroomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (report: any) => void;
  selectedCoords: { lat: number; lng: number } | null;
}

export default function AddMushroomReportModal({ isOpen, onClose, onAddReport, selectedCoords }: AddMushroomReportModalProps) {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [content, setContent] = useState('');
  const [species, setSpecies] = useState('');         
  const [forestType, setForestType] = useState('');   
  const [imagePreview, setImagePreview] = useState('');

  if (!isOpen) return null;

  // Bilgisayardan/telefondan resim seçme ve base64 formatına çevirme
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
    if (!title.trim() || !locationName.trim()) return;

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
      coordinates: selectedCoords || { lat: 40.7569, lng: 30.3787 }, 
      imageUrl: imagePreview || '',
      mushroomData: {
        species: species.trim() || 'Kanlıca Mantarı',
        forestType: forestType.trim() || 'Çam Altı',
        soilCondition: 'Nemli / Yağmur Sonrası'
      }
    };

    onAddReport(newReport);
    setTitle('');
    setLocationName('');
    setContent('');
    setSpecies('');
    setForestType('');
    setImagePreview('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1c140d] border border-amber-700/40 w-full max-w-md rounded-2xl p-6 relative shadow-2xl text-[#f4eee6] space-y-4 my-auto max-h-[90vh] overflow-y-auto">
        
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#d4c5b9] font-medium mb-1">Mantar Türü</label>
              <input 
                type="text" 
                placeholder="Örn: Kuzu Göbeği" 
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[#d4c5b9] font-medium mb-1">Ağaç / Bölge Örtüsü</label>
              <input 
                type="text" 
                placeholder="Örn: Çam / Meşe Altı" 
                value={forestType}
                onChange={(e) => setForestType(e.target.value)}
                className="w-full bg-[#16110e] border border-[#32261e] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Dosyadan Fotoğraf Yükleme Alanı */}
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-emerald-800 text-white font-bold transition-all shadow-lg cursor-pointer"
            >
              Raporu Yayınla
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}