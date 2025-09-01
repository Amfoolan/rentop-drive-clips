/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['picsum.photos', 'images.unsplash.com'],
  },
}

module.exports = nextConfig