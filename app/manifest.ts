import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AyaGuide | Portal de Meditacao Sonora',
    short_name: 'AyaGuide',
    description: 'Experiencia imersiva de meditacao sonora e mandalas vibracionais.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#020202',
    theme_color: '#020202',
    icons: [
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
