/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http', // Hem http hem de https'e izin vermek için
        hostname: '**',   // Tüm hostname'lere izin ver
        port: '',         // Port kısıtlaması yok
        pathname: '**',   // Tüm pathname'lere izin ver
      },
      {
        protocol: 'https', // Güvenli bağlantılar için de aynı kuralı tekrarla
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ]

  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
