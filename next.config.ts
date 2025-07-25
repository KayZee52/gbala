import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript build errors in production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint errors in production
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true, // Enable React Strict Mode for better development practices
  output: 'standalone', // Enable standalone output for better deployment support
};

export default nextConfig;
