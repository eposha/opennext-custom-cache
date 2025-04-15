// // // import type { NextConfig } from 'next';

// // const nextConfig = {
// //   /* config options here */
// //   cacheHandler: require.resolve('./cache-handler.js'),
// //   cacheMaxMemorySize: 0, // disable default in-memory caching
// //   // instrumentationHook: true,
// // };

// // export default nextConfig;

// // // added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
// // // import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
// // // initOpenNextCloudflareForDev();

// // module.exports = {
// //   // cacheHandler: require.resolve('./cache-handler.js'),
// //   // cacheMaxMemorySize: 0, // disable default in-memory caching

// //   generateBuildId: async () => {
// //     // This could be anything, using the latest git hash
// //     return crypto.randomUUID();
// //   },
// // };

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   cacheHandler: require.resolve('./cache-handler.js'),
//   cacheMaxMemorySize: 0,
//   generateBuildId: async () => {
//     // This could be anything, using the latest git hash
//     return crypto.randomUUID();
//   },
// };

// module.exports = nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
