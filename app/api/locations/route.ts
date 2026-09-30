import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=tr&addressdetails=1&limit=8`,
      {
        headers: {
          'User-Agent': 'BalikcilikKampApp/1.0'
        }
      }
    );

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const data = await res.json();
    
    const formattedResults = data.map((item: any) => {
      const addr = item.address;
      const cleanName = (name?: string) => {
        if (!name) return '';
        return name
          .replace(/Mahallesi/gi, '')
          .replace(/Mahalle/gi, '')
          .replace(/Köyü/gi, '')
          .replace(/Köy/gi, '')
          .trim();
      };

      const neighborhood = cleanName(addr?.neighbourhood || addr?.suburb || addr?.quarter || addr?.village);
      const district = cleanName(addr?.county || addr?.district || addr?.town || addr?.city_district);
      const city = cleanName(addr?.province || addr?.city);

      const parts = [neighborhood, district, city].filter(Boolean);
      const uniqueParts = parts.filter((p, index) => parts.indexOf(p) === index);

      return {
        id: item.place_id,
        name: uniqueParts.length > 0 ? uniqueParts.join(', ') : item.display_name.split(',')[0],
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      };
    });

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Konum arama proxy hatası:', error);
    return NextResponse.json([]);
  }
}