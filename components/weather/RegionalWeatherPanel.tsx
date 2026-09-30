'use client';

import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Waves, MapPin, Compass, Thermometer } from 'lucide-react';
import { fetchWeatherAndWaterTemp } from '@/lib/weather';

// Popüler Balıkçılık / Kamp Bölgeleri (İl / İlçe ve Koordinatları)
const REGIONS = [
  { city: 'Çanakkale', district: 'Merkez / Boğaz', lat: 40.1559, lng: 26.4142 },
  { city: 'Edirne', district: 'Keşan / Saroz (İbrice)', lat: 40.6853, lng: 26.5453 },
  { city: 'Muğla', district: 'Bodrum / Gündoğan', lat: 37.1094, lng: 27.3591 },
  { city: 'Antalya', district: 'Kaş / Kalkan', lat: 36.2015, lng: 29.6485 },
  { city: 'İzmir', district: 'Çeşme / Alaçatı', lat: 38.3237, lng: 26.3768 },
  { city: 'İstanbul', district: 'Sarıyer / Boğaz', lat: 41.1683, lng: 29.0574 }
];

export default function RegionalWeatherPanel({ onRegionSelect }: { onRegionSelect?: (lat: number, lng: number) => void }) {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[1]); // Varsayılan Saroz / İbrice
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      const data = await fetchWeatherAndWaterTemp(selectedRegion.lat, selectedRegion.lng);
      setWeatherData(data);
      setLoading(false);

      if (onRegionSelect) {
        onRegionSelect(selectedRegion.lat, selectedRegion.lng);
      }
    }
    loadWeather();
  }, [selectedRegion]);

  return (
    <div className="bg-slate-900/90 border border-blue-500/30 backdrop-blur-md rounded-2xl p-4 text-white shadow-xl space-y-4 max-w-sm w-full">
      
      {/* Başlık ve İl/İlçe Seçim Kutusu */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm">Bölgesel Hava & Deniz Raporu</h3>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-400" /> İl / İlçe Seçin
        </label>
        <select 
          value={selectedRegion.city + selectedRegion.district}
          onChange={(e) => {
            const found = REGIONS.find(r => (r.city + r.district) === e.target.value);
            if (found) setSelectedRegion(found);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 text-white cursor-pointer"
        >
          {REGIONS.map((reg) => (
            <option key={reg.city + reg.district} value={reg.city + reg.district} className="bg-slate-900 text-white">
              {reg.city} / {reg.district}
            </option>
          ))}
        </select>
      </div>

      {/* Veri Kartları (Popup'tan bağımsız) */}
      {loading ? (
        <div className="py-6 text-center text-xs text-slate-500 animate-pulse">
          Meteorolojik veriler güncelleniyor...
        </div>
      ) : weatherData ? (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          
          {/* Deniz Suyu Sıcaklığı */}
          <div className="bg-slate-950/80 border border-blue-900/40 rounded-xl p-3 flex flex-col justify-between space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-blue-400" /> Deniz Suyu
            </span>
            <span className="text-lg font-extrabold text-blue-300">
              {weatherData.waterTemp}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Avlanmaya Uygun</span>
          </div>

          {/* Hava Sıcaklığı */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-1">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Hava Sıcaklığı
            </span>
            <span className="text-lg font-extrabold text-white">
              {weatherData.temperature}°C
            </span>
            <span className="text-[10px] text-slate-400">Anlık Ölçüm</span>
          </div>

          {/* Rüzgar Hızı */}
          <div className="col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-blue-400">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Rüzgar Durumu</span>
                <span className="text-xs font-bold text-white">{weatherData.windSpeed} km/s</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
              Kıyıya Paralel
            </span>
          </div>

        </div>
      ) : null}

    </div>
  );
}