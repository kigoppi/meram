'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const TURKEY_BOUNDS = L.latLngBounds(
  [35.0, 25.0],
  [43.0, 46.0]
);

// İstediğin süre kurallarına göre rozet rengi ve animasyon belirleme
const getReportBadgeStyle = (createdAt?: number) => {
  const now = Date.now();
  const reportTime = createdAt || now;
  const diffHours = (now - reportTime) / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffDays <= 1) {
    // Son 1 gün (24 saat): Kırmızı + Yanıp sönen alarm efekti
    return { borderColor: '#ef4444', className: 'alert-pill-pulse' };
  } else if (diffDays <= 3) {
    // Son 3 gün (1 ila 3 gün arası): Turuncu (sabit, yanmaz)
    return { borderColor: '#f59e0b', className: '' };
  }
  // 3 günden sonra: Mavi (sabit)
  return { borderColor: '#38bdf8', className: '' };
};

const createMushroomReportBadge = (trustScore: number, createdAt?: number) => {
  const style = getReportBadgeStyle(createdAt);

  return L.divIcon({
    className: `mushroom-report-badge ${style.className}`,
    html: `
      <div style="
        background: #1c140d; 
        color: #f4eee6; 
        border: 2px solid ${style.borderColor}; 
        padding: 4px 8px; 
        border-radius: 9999px; 
        font-size: 11px; 
        font-weight: 700; 
        white-space: nowrap; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
      ">
        <span style="font-size: 13px;">🍄</span>
        <span style="color: ${style.borderColor};">%${trustScore}</span>
      </div>
    `,
    iconSize: [60, 26],
    iconAnchor: [30, 13]
  });
};

interface MushroomReport {
  id: string;
  title: string;
  locationName: string;
  content: string;
  trustScore: number;
  status: 'verified' | 'pending';
  timeString?: string;
  createdAt?: number;
  coordinates?: { lat: number; lng: number } | null;
  mushroomData?: {
    species?: string;
  };
}

interface MushroomMapProps {
  reports?: MushroomReport[];
  onMapClick?: (coords: { lat: number; lng: number }) => void;
}

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

export default function MushroomMap({ reports = [], onMapClick }: MushroomMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#16110e] text-amber-500 text-xs font-semibold">
        Orman Haritası Yükleniyor...
      </div>
    );
  }

  // Takvim günü bazlı popup zaman gösterimi
  const getPopupDisplayTime = (createdAt?: number) => {
    if (!createdAt) return 'Bilinmiyor';
    
    const now = new Date();
    const reportDate = new Date(createdAt);
    const timeString = reportDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const isToday = 
      now.getDate() === reportDate.getDate() &&
      now.getMonth() === reportDate.getMonth() &&
      now.getFullYear() === reportDate.getFullYear();

    if (isToday) {
      return timeString; // Bugünse sadece saat yazar
    }

    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reportDateOnly = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate());
    const diffDays = Math.round((nowDateOnly.getTime() - reportDateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Dün';
    if (diffDays === 2) return 'İki gün önce';

    return timeString;
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[39.9334, 32.8597]} 
        zoom={6} 
        minZoom={6}        
        maxZoom={15}       
        maxBounds={TURKEY_BOUNDS} 
        maxBoundsViscosity={1.0}  
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#16110e' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />

        {reports.map((report) => {
          if (!report.coordinates) return null;
          const mushroomIcon = createMushroomReportBadge(report.trustScore, report.createdAt);
          const displayTime = getPopupDisplayTime(report.createdAt);

          return (
            <Marker key={report.id} position={[report.coordinates.lat, report.coordinates.lng]} icon={mushroomIcon}>
              <Popup>
                <div className="p-3 text-slate-900 space-y-2 min-w-[200px]">
                  <div className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">📍 {report.locationName}</div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{report.title}</h4>
                  <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 space-y-1 text-xs font-medium">
                    {report.mushroomData?.species && <div className="flex items-center justify-between"><span className="text-slate-500">Mantar Türü:</span><span className="font-bold text-amber-800">{report.mushroomData.species}</span></div>}
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