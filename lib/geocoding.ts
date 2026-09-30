// OpenStreetMap Nominatim API kullanarak koordinatları en yakın Mahalle / İlçe / İl adresine çevirir
export async function getReverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BalikcilikKampWebUygulamasi/1.0'
        }
      }
    );
    
    if (!response.ok) return `Konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    const data = await response.json();
    const addr = data.address;

    if (!addr) return `Konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    // Ham mahalle / semt / ilçe bilgilerini alalım
    let neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || '';
    let district = addr.county || addr.district || addr.town || addr.city_district || '';
    let city = addr.province || addr.city || addr.state || '';

    // "Mahallesi", "Mahalle", "Köyü", "Köy" gibi ekleri temizleyelim (Örn: "Yazır Mahallesi" -> "Yazır")
    const cleanName = (name: string) => {
      if (!name) return '';
      return name
        .replace(/Mahallesi/gi, '')
        .replace(/Mahalle/gi, '')
        .replace(/Köyü/gi, '')
        .replace(/Köy/gi, '')
        .trim();
    };

    const formattedNeighborhood = cleanName(neighborhood);
    const formattedDistrict = cleanName(district);
    const formattedCity = cleanName(city);

    // Parçaları anlamlı ve sade bir sırada birleştirelim (Örn: Yazır, Korkuteli, Antalya)
    const parts = [formattedNeighborhood, formattedDistrict, formattedCity].filter(Boolean);
    
    // Aynı isimli tekrarları önleyelim (Örn: Kaş, Kaş gibi durumlar olmasın)
    const uniqueParts = parts.filter((item, index) => parts.indexOf(item) === index);

    if (uniqueParts.length > 0) {
      return uniqueParts.join(', ');
    }

    return data.display_name || `Konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Coğrafi konum çözümlenemedi:', error);
    return `Konum: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}