/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Statik dosya üretimi için kritik
  images: {
    unoptimized: true, // Mobil cihazlarda resim optimizasyon sorununu önler
  },
};

module.exports = nextConfig;