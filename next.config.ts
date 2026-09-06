import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ddragon.leagueoflegends.com", pathname: "/cdn/**" },
    ],

    // Data Dragon URLs are versioned or point at immutable art, so a transform
    // stays valid until the asset itself is replaced. The default four hours
    // makes every visitor after a lull pay for a cold transform again.
    minimumCacheTTL: 31 * 24 * 60 * 60,

    // Nothing here is ever shown larger than the backdrop, which is blurred:
    // generating 2048px and 3840px variants would only spend transforms on
    // detail no one can see.
    deviceSizes: [640, 828, 1080, 1920],

    // 75 is the default; the lower steps are for art that is blurred or shown
    // at thumbnail size. Next refuses any quality not declared here.
    qualities: [35, 60, 75],
  },
};

export default nextConfig;
