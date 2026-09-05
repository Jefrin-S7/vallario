import type { NextConfig } from "next";

const securityHeaders = [
  // Prevents the site from being framed by another origin (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stops browsers from MIME-sniffing a response away from its declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin (not the full URL/path) as a referrer to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser APIs the storefront never needs.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Opt into the browser's XSS filter as defense-in-depth on older browsers.
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in responses.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
