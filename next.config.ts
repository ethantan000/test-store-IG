/**
 * @type {import('next').NextConfig}
 *
 * Next.js configuration.  Enables the app directory, configures allowed image
 * domains for remote loading and sets strict mode.
 */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Unsplash images used in the seed script and product pages.  Add your
    // own domains here if hosting product photos elsewhere.
    domains: ['images.unsplash.com'],
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;