import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AyaGuide | Portal de Meditação Sonora',
    short_name: 'AyaGuide',
    description: 'Experiência imersiva de meditação sonora e mandalas vibracionais.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020202',
    theme_color: '#C084FC', // Purple accent
    icons: [
      {
        src: '/icon.png', // We will link the generated icon to this public path
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
        sizes: 'maskable',
        type: 'image/png',
      }
    ],
  };
}
