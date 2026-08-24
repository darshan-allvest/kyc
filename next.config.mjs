/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Dev-only: the demo is opened from both http://localhost:3000 and
  // http://127.0.0.1:3000; without this Next blocks its own dev chunks for the
  // second host and the page never hydrates.
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
