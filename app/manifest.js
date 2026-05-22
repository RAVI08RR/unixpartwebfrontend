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
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/logo.png',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
  }
}
