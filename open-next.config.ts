// import { defineCloudflareConfig } from '@opennextjs/cloudflare';

import type { OpenNextConfig } from '@opennextjs/aws/types/open-next';
const config = {
  default: {
    override: {
      // can be any of our included ones or your own custom override
      wrapper: 'cloudflare-node',
      converter: 'edge',
      proxyExternalRequest: 'fetch',

      queue: 'dummy',
      incrementalCache: () =>
        import('./src/lib/custom-cache/incremental-cache').then(
          (mod) => mod.default
        ),
      // queue: () =>
      //   import('./src/lib/custom-cache/queue').then((mod) => mod.default),
      tagCache: () =>
        import('./src/lib/custom-cache/tag-cache').then((mod) => mod.default),
    },
  },
  edgeExternals: ['node:crypto'],
} satisfies OpenNextConfig;

export default config;
