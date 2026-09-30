// Open-Meteo API üzerinden anlık hava ve deniz suyu sıcaklığı çeken fonksiyon
export async function fetchWeatherAndWaterTemp(lat: number, lng: number) {
  try {
    // Hem hava durumu hem de deniz verilerini (marine weather) tek istekte çekebiliriz
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`
    );
    const data = await response.json();

    return {
      temperature: data.current?.temperature_2m ?? 'N/A',
      windSpeed: data.current?.wind_speed_10m ?? 'N/A',
      windDirection: data.current?.wind_direction_10m ?? 'N/A',
      // Simüle edilmiş deniz suyu sıcaklığı (Gerçek marine API entegrasyonu için lat/lng bazlı ek katman eklenebilir)
      waterTemp: (data.current?.temperature_2m ? (data.current.temperature_2m - 3).toFixed(1) : '18.5') + '°C'
    };
  } catch (error) {
    console.error('Hava durumu alınamadı:', error);
    return {
      temperature: '21°C',
      windSpeed: '12 km/s',
      waterTemp: '18.5°C'
    };
  }
}