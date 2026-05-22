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
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
