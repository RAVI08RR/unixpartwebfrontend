/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://ccb7878ed7f8.ngrok-free.app'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
