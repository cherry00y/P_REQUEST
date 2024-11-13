/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  images: {
    domains: ['p-request.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p-request.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
}

