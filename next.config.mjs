/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://3d3a2b4e7863.ngrok-free.app'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
