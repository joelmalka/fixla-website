/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old static-site download page — still used in referral links shared from the app
      // (query string like ?ref=CODE is carried over automatically)
      { source: '/sivut/lataa', destination: '/lataa', permanent: true },
      { source: '/sivut/lataa.html', destination: '/lataa', permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Preserve the static admin panel at /admin-panel
      { source: '/admin-panel', destination: '/admin-panel/index.html' },
      { source: '/admin-panel/', destination: '/admin-panel/index.html' },
    ];
  },
};

export default nextConfig;
