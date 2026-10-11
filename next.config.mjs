/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: { optimizePackageImports: ["lucide-react", "framer-motion", "recharts"] },
  // Sentry's OpenTelemetry dependencies use dynamic requires; webpack reports them as (harmless) warnings.
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules[\\/](@opentelemetry|@prisma|require-in-the-middle|import-in-the-middle)/, message: /Critical dependency/ },
      { module: /node_modules[\\/](@opentelemetry|@prisma|require-in-the-middle|import-in-the-middle)/, message: /the request of a dependency is an expression/ },
    ];
    return config;
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

// Sentry is wrapped in only when a DSN is configured at build time, so a missing DSN never affects the build.
const sentryEnabled = !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
let config = nextConfig;
if (sentryEnabled) {
  const { withSentryConfig } = await import("@sentry/nextjs");
  config = withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN, // optional: only needed to upload source maps
    widenClientFileUpload: true,
    disableLogger: true,
    hideSourceMaps: true,
  });
}

export default config;
