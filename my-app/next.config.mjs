/** @type {import('next').NextConfig} */
const nextConfig = {};

export default {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'p-request.onrender.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
}

