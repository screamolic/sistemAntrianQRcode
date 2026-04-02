import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Treat postgres as external package for Edge compatibility
  serverExternalPackages: ['postgres'],
  experimental: {
    serverComponentsExternalPackages: ['postgres'],
  },
}

export default nextConfig
