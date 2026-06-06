/** @type {import('next').NextConfig} */

const appUrl = (process.env.KINNESS_APP_URL || '').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!appUrl) {
      console.warn('[kinness] KINNESS_APP_URL not set — /login and app routes will not proxy to the CRA app.');
      return [];
    }
    console.log('[kinness] App proxy →', appUrl);
    return [
      { source: '/login', destination: `${appUrl}/login` },
      { source: '/register', destination: `${appUrl}/register` },
      { source: '/admin', destination: `${appUrl}/admin` },
      { source: '/admin/:path*', destination: `${appUrl}/admin/:path*` },
      { source: '/staff/:path*', destination: `${appUrl}/staff/:path*` },
      { source: '/family/:path*', destination: `${appUrl}/family/:path*` },
    ];
  },
};

module.exports = nextConfig;
