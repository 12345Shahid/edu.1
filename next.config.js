/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Set to true for local development, false for production builds
    // This will speed up production builds in Vercel by skipping type checking
    ignoreBuildErrors: process.env.VERCEL === '1',
  },
}

module.exports = nextConfig 