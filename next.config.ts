import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Treat postgres as external package for Edge compatibility
  serverExternalPackages: ['postgres'],
}

export default nextConfig
