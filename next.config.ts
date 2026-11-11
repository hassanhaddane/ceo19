import type { NextConfig } from 'next';
const config: NextConfig = {
 poweredByHeader: false,
 images: { imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384, 480, 512] },
};
export default config;
