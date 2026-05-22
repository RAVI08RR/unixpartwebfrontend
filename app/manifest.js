export default function manifest() {
  return {
    name: 'Unixparts Dashboard',
    short_name: 'Unixparts',
    description: 'Internal system for Unixparts inventory and operations',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/pwa-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
      {
        src: '/pwa-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
