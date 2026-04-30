/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Long cache for large static assets served from /public.
   * Replace the PDF filename when IRCC publishes a new edition so browsers fetch fresh bytes.
   */
  async headers() {
    const longCache =
      'public, max-age=604800, stale-while-revalidate=2592000'
    return [
      {
        source: '/study/discover-canada-en.pdf',
        headers: [{ key: 'Cache-Control', value: longCache }],
      },
      {
        source: '/pdf-viewer/:path*',
        headers: [{ key: 'Cache-Control', value: longCache }],
      },
      {
        source: '/pdf.worker.min.mjs',
        headers: [{ key: 'Cache-Control', value: longCache }],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
