/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['zerogate.local'],
  async redirects() {
    return [
      {
        source: '/generate_204',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/gen_204',
        destination: '/login',
        permanent: false,
      }
    ];
  },
};

module.exports = nextConfig;