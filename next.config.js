/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings are allowed in build, only errors will fail
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure externals array exists
      if (!Array.isArray(config.externals)) {
        config.externals = [];
      }
      // Mark MongoDB as external so it doesn't get bundled
      config.externals.push('mongodb');
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'index, follow',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
