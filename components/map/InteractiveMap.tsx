'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

const TURKEY_BOUNDS = L.latLngBounds(
  [35.0, 25.0],
  [43.0, 46.0]
);

const getWeatherBadgeHTML = (tempStr: string, conditionText: string = '') => {
  const text = conditionText.toLowerCase();
  let emoji = '☀️';
  let color = '#facc15';

  if (text.includes('yağmur') || text.includes('sağanak') || text.includes('çisenti')) {
    emoji = '🌧️';
    color = '#60a5fa';
  } else if (text.includes('bulut') || text.includes('kapalı')) {
    emoji = '☁️';
    color = '#94a3b8';
  } else if (text.includes('fırtına') || text.includes('şimşek')) {
    emoji = '⚡';
    color = '#fbbf24';
  } else if (text.includes('kar')) {
    emoji = '❄️';
    color = '#93c5fd';
  } else if (text.includes('rüzgar')) {
    emoji = '🌬️';
    color = '#2dd4bf';
  }

  return `
    <div style="
      background: rgba(15, 23, 42, 0.95); 
      color: #ffffff; 
      border: 1px solid rgba(56, 189, 248, 0.4); 
      padding: 4px 10px; 
      border-radius: 9999px; 
      font-size: 11px; 
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      white-space: nowrap;
    ">
      <span style="font-size: 13px;">${emoji}</span>
      <span style="color: ${color};">${tempStr}</span>
    </div>
  `;
};

const getReportBadgeStyle = (createdAt?: number) => {
  const now = Date.now();
  const reportTime = createdAt || now;
  const diffMinutes = (now - reportTime) / (1000 * 60);

  if (diffMinutes <= 30) {
    return { borderColor: '#ef4444', className: 'alert-pill-pulse' };
  } else if (diffMinutes <= 120) {
    return { borderColor: '#f59e0b', className: '' };
  }
  return { borderColor: '#38bdf8', className: '' };
};

const createCompactReportBadge = (trustScore: number, createdAt?: number) => {
  const style = getReportBadgeStyle(createdAt);

  return L.divIcon({
    className: `compact-report-badge ${style.className}`,
    html: `
      <div style="
        background: #0f172a; 
        color: #ffffff; 
        border: 2px solid ${style.borderColor}; 
        padding: 4px 8px; 
        border-radius: 9999px; 
        font-size: 11px; 
        font-weight: 700; 
        white-space: nowrap; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
      ">
        <span style="font-size: 12px;">📢</span>
        <span style="color: ${style.borderColor};">%${trustScore}</span>
      </div>
    `,
    iconSize: [60, 26],
    iconAnchor: [30, 13]
  });
};

// Takvim günü bazlı zaman formatlama (Popup için)
const formatMapPopupTime = (createdAt?: number) => {
  if (!createdAt) return 'Bilinmiyor';
  const now = new Date();
  const reportDate = new Date(createdAt);
  const timeString = reportDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const isToday = 
    now.getDate() === reportDate.getDate() &&
    now.getMonth() === reportDate.getMonth() &&
    now.getFullYear() === reportDate.getFullYear();

  if (isToday) {
    return timeString; // Bugünse sadece saat
  }

  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reportDateOnly = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
  const diffDays = Math.round((nowDateOnly.getTime() - reportDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Dün';
  if (diffDays === 2) return 'İki gün önce';

  return timeString;
};

interface Report {
  id: string;
  title: string;
  locationName: string;
  content: string;
  trustScore: number;
  status: 'verified' | 'pending';
  timeString?: string;
  createdAt?: number;
  coordinates?: { lat: number; lng: number } | null;
  subData?: {
    fishType?: string;
    lure?: string;
  };
}

interface InteractiveMapProps {
  reports?: Report[];
  showWeatherLayer?: boolean;
  onWeatherLayerToggle?: (show: boolean) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

interface WeatherData {
  temp: string;
  seaTemp: string;
  wind: string;
  conditionText: string;
}

const WEATHER_POINTS = [
  { id: 'brt-kurucasile', name: 'Bartın / Kurucaşile', lat: 41.8317, lng: 32.7092, hasSea: true },
  { id: 'trb-surmene', name: 'Trabzon / Sürmene', lat: 40.9167, lng: 40.1333, hasSea: true },
  { id: 'rze-pazar', name: 'Rize / Pazar', lat: 41.1797, lng: 40.8847, hasSea: true },
  { id: 'edr-erikli', name: 'Edirne / Erikli', lat: 40.6553, lng: 26.3014, hasSea: true },
  { id: 'tek-sarkoy', name: 'Tekirdağ / Şarköy', lat: 40.6186, lng: 27.1189, hasSea: true },
  { id: 'bal-bandirma', name: 'Balıkesir / Bandırma', lat: 40.3522, lng: 27.9778, hasSea: true },
  { id: 'ist-silivri', name: 'İstanbul / Silivri', lat: 41.0739, lng: 28.2461, hasSea: true },
  { id: 'tek-marmaraereglisi', name: 'Tekirdağ / Marmaraereğlisi', lat: 40.9706, lng: 27.9622, hasSea: true },
  { id: 'zng-merkez', name: 'Zonguldak / Merkez', lat: 41.4564, lng: 31.7987, hasSea: true },
  { id: 'zng-eregli', name: 'Zonguldak / Kdz. Ereğli', lat: 41.2833, lng: 31.4167, hasSea: true },
  { id: 'snp-merkez', name: 'Sinop / Merkez', lat: 42.0231, lng: 35.1531, hasSea: true },
  { id: 'snp-ayancik', name: 'Sinop / Ayancık', lat: 41.9467, lng: 34.5764, hasSea: true },
  { id: 'sms-merkez', name: 'Samsun / Merkez', lat: 41.2867, lng: 36.33, hasSea: true },
  { id: 'sms-bafra', name: 'Samsun / Bafra', lat: 41.5678, lng: 35.9081, hasSea: true },
  { id: 'ord-merkez', name: 'Ordu / Merkez', lat: 40.9839, lng: 37.8764, hasSea: true },
  { id: 'grs-merkez', name: 'Giresun / Merkez', lat: 40.9128, lng: 38.3895, hasSea: true },
  { id: 'art-hopa', name: 'Artvin / Hopa', lat: 41.4039, lng: 41.4314, hasSea: true },
  { id: 'ist-sariyer', name: 'İstanbul / Sarıyer', lat: 41.1683, lng: 29.0574, hasSea: true },
  { id: 'ist-beykoz', name: 'İstanbul / Beykoz', lat: 41.1215, lng: 29.0967, hasSea: true },
  { id: 'ckl-gelibolu', name: 'Çanakkale / Gelibolu', lat: 40.4111, lng: 26.6647, hasSea: true },
  { id: 'ckl-bozcaada', name: 'Çanakkale / Bozcaada', lat: 39.8333, lng: 26.0667, hasSea: true },
  { id: 'bur-gemlik', name: 'Bursa / Gemlik', lat: 40.4308, lng: 29.1578, hasSea: true },
  { id: 'sak-karasu', name: 'Sakarya / Karasu', lat: 41.0858, lng: 30.6908, hasSea: true },
  { id: 'koca-korfez', name: 'Kocaeli / Körfez', lat: 40.7608, lng: 29.7436, hasSea: true },
  { id: 'izm-cesme', name: 'İzmir / Çeşme', lat: 38.3237, lng: 26.3768, hasSea: true },
  { id: 'izm-foca', name: 'İzmir / Foça', lat: 38.6672, lng: 26.7539, hasSea: true },
  { id: 'mug-bodrum', name: 'Muğla / Bodrum', lat: 37.1094, lng: 27.3591, hasSea: true },
  { id: 'mug-fethiye', name: 'Muğla / Fethiye', lat: 36.6217, lng: 29.1164, hasSea: true },
  { id: 'mug-datca', name: 'Muğla / Datça', lat: 36.7312, lng: 27.6831, hasSea: true },
  { id: 'ayd-kusadasi', name: 'Aydın / Kuşadası', lat: 37.8579, lng: 27.2613, hasSea: true },
  { id: 'ayd-didim', name: 'Aydın / Didim', lat: 37.3781, lng: 27.2631, hasSea: true },
  { id: 'bal-edremit', name: 'Balıkesir / Edremit', lat: 39.5875, lng: 27.0253, hasSea: true },
  { id: 'bal-ayvalik', name: 'Balıkesir / Ayvalık', lat: 39.3131, lng: 26.6978, hasSea: true },
  { id: 'ant-merkez', name: 'Antalya / Merkez', lat: 36.8841, lng: 30.7056, hasSea: true },
  { id: 'ant-kas', name: 'Antalya / Kaş', lat: 36.2015, lng: 29.6485, hasSea: true },
  { id: 'ant-alanya', name: 'Antalya / Alanya', lat: 36.5438, lng: 31.9998, hasSea: true },
  { id: 'mer-merkez', name: 'Mersin / Merkez', lat: 36.8000, lng: 34.6333, hasSea: true },
  { id: 'mer-silifke', name: 'Mersin / Silifke', lat: 36.3778, lng: 33.9333, hasSea: true },
  { id: 'mer-anamur', name: 'Mersin / Anamur', lat: 36.0797, lng: 32.8342, hasSea: true },
  { id: 'hat-iskenderun', name: 'Hatay / İskenderun', lat: 36.5872, lng: 36.1736, hasSea: true }
];

function MapClickHandler({ onMapClick }: { onMapClick?: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function InteractiveMap({ reports = [], showWeatherLayer = false, onWeatherLayerToggle, onMapClick }: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!showWeatherLayer) return;

    let isCancelled = false;

    async function fetchLiveData() {
      setIsLoadingWeather(true);
      const results: Record<string, WeatherData> = {};

      try {
        await Promise.all(
          WEATHER_POINTS.map(async (pt) => {
            try {
              const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${pt.lat}&longitude=${pt.lng}&current=temperature_2m,wind_speed_10m,weather_code`
              );
              const data = await res.json();

              let seaStr = '---';
              if (pt.hasSea) {
                const marineRes = await fetch(
                  `https://marine-api.open-meteo.com/v1/marine?latitude=${pt.lat}&longitude=${pt.lng}&current=sea_surface_temperature`
                );
                const marineData = await marineRes.json();
                const rawSea = marineData?.current?.sea_surface_temperature;
                if (rawSea !== null && rawSea !== undefined && !isNaN(rawSea)) {
                  seaStr = `${Number(rawSea).toFixed(1)}°C`;
                }
              }

              const t = data?.current?.temperature_2m;
              const w = data?.current?.wind_speed_10m;
              const wCode = data?.current?.weather_code;

              let condStr = 'Açık / Güneşli';
              if (wCode !== undefined) {
                if ([1, 2, 3].includes(wCode)) condStr = 'Parçalı Bulutlu';
                else if ([45, 48].includes(wCode)) condStr = 'Sisli';
                else if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(wCode)) condStr = 'Yağmurlu';
                else if ([71, 73, 75, 77, 85, 86].includes(wCode)) condStr = 'Karlı';
                else if ([95, 96, 99].includes(wCode)) condStr = 'Fırtınalı';
              }

              results[pt.id] = {
                temp: t !== undefined && t !== null ? `${Math.round(t)}°C` : '19°C',
                seaTemp: seaStr,
                wind: w !== undefined && w !== null ? `${Math.round(w)} km/s` : '12 km/s',
                conditionText: condStr
              };
            } catch {
              results[pt.id] = { temp: '19°C', seaTemp: pt.hasSea ? '17°C' : '---', wind: '12 km/s', conditionText: 'Açık' };
            }
          })
        );
      } finally {
        if (!isCancelled) {
          setWeatherMap(results);
          setIsLoadingWeather(false);
        }
      }
    }

    fetchLiveData();
  }, [showWeatherLayer]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0b0f19] text-cyan-400 text-xs font-semibold">
        Harita Yükleniyor...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      
      {isLoadingWeather && (
        <div className="absolute top-5 right-5 z-[500] bg-[#030712]/90 border border-cyan-500/40 p-2 rounded-xl backdrop-blur-xl shadow-2xl flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
      )}

      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-[#030712]/95 border border-cyan-500/40 p-3 rounded-xl backdrop-blur-xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center gap-2 font-bold text-cyan-400 border-b border-slate-800 pb-1.5 uppercase text-[10px]">
            <span>Harita Katmanı</span>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white font-medium py-0.5">
            <input 
              type="checkbox" 
              checked={showWeatherLayer} 
              onChange={(e) => onWeatherLayerToggle && onWeatherLayerToggle(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="flex items-center gap-1.5 text-xs">
              <span>🌤️</span> Canlı Hava & Deniz
            </span>
          </label>
        </div>
      </div>

      <MapContainer 
        center={[39.9334, 32.8597]} 
        zoom={6} 
        minZoom={6}        
        maxZoom={15}       
        maxBounds={TURKEY_BOUNDS} 
        maxBoundsViscosity={1.0}  
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#0b0f19' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {showWeatherLayer && WEATHER_POINTS.map((pt) => {
          const liveData = weatherMap[pt.id] || { temp: '...', seaTemp: '...', wind: '...', conditionText: 'Açık' };
          const weatherBadgeIcon = L.divIcon({
            className: 'weather-only-badge',
            html: getWeatherBadgeHTML(liveData.temp, liveData.conditionText),
            iconSize: [75, 26],
            iconAnchor: [37, 13]
          });

          return (
            <Marker key={pt.id} position={[pt.lat, pt.lng]} icon={weatherBadgeIcon}>
              <Popup>
                <div className="p-2 text-slate-900 space-y-1.5 min-w-[160px]">
                  <h4 className="font-bold text-sm border-b pb-1">📍 {pt.name}</h4>
                  <div className="text-xs space-y-1 pt-1 font-medium">
                    <div className="flex justify-between items-center"><span className="text-slate-600">Durum:</span><span className="font-bold text-cyan-700">{liveData.conditionText}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-600">Sıcaklık:</span><span className="font-bold">{liveData.temp}</span></div>
                    {pt.hasSea && <div className="flex justify-between items-center"><span className="text-slate-600">Deniz:</span><span className="font-bold text-blue-600">{liveData.seaTemp}</span></div>}
                    <div className="flex justify-between items-center pt-0.5 border-t"><span className="text-slate-600">Rüzgar:</span><span className="semibold">{liveData.wind}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {reports.map((report) => {
          if (!report.coordinates) return null;
          const compactIcon = createCompactReportBadge(report.trustScore, report.createdAt);
          const displayTime = formatMapPopupTime(report.createdAt); // <-- Güncellenen fonksiyon bağlandı

          return (
            <Marker key={report.id} position={[report.coordinates.lat, report.coordinates.lng]} icon={compactIcon}>
              <Popup>
                <div className="p-3 text-slate-900 space-y-2 min-w-[200px]">
                  <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">📍 {report.locationName}</div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{report.title}</h4>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 space-y-1 text-xs font-medium">
                    {report.subData?.fishType && <div className="flex items-center justify-between"><span className="text-slate-500">Hedef Balık:</span><span className="font-bold text-blue-700">{report.subData.fishType}</span></div>}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200"><span className="text-slate-500">Bildirim:</span><span className="font-bold text-slate-800">{displayTime}</span></div>
                  </div>
                  <div className="flex justify-between items-center pt-1 text-[11px]"><span className="text-slate-500">Güvenilirlik:</span><span className="font-bold text-emerald-600">%{report.trustScore}</span></div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}