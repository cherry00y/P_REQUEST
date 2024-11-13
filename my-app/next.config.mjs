/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p-request.onrender.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

