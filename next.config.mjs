/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Preserve the static admin panel at /admin-panel
      { source: '/admin-panel', destination: '/admin-panel/index.html' },
      { source: '/admin-panel/', destination: '/admin-panel/index.html' },
    ];
  },
};

export default nextConfig;
