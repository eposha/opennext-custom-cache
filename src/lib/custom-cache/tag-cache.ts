import type { NextModeTagCache } from '@opennextjs/aws/types/overrides.js';

import axios from 'axios';
import { FALLBACK_BUILD_ID } from './incremental-cache';

const buildId = process.env.NEXT_BUILD_ID ?? FALLBACK_BUILD_ID;

const getCacheKey = (key: string) => {
  return `${buildId}/${key}`.replaceAll('//', '/');
};

const tagCache: NextModeTagCache = {
  name: 'tag-cache',
  mode: 'nextMode',
  async hasBeenRevalidated(
    tags: string[],
    lastModified?: number
  ): Promise<boolean> {
    try {
      const { data } = await axios.post(
        'http://localhost:3001/cache/has-been-revalidated',
        {
          tags: tags.map((tag) => getCacheKey(tag)),
          lastModified,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('data', data);
      return !!data?.hasBeenRevalidated;
    } catch (error) {
      console.error('Error in hasBeenRevalidated:', error);
      return false;
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeTags: async (newTags: any[]) => {
    console.log('Write Tags', newTags);

    const payload = newTags?.map((tag) => ({
      tag: getCacheKey(tag),
      revalidatedAt: Date.now(),
    }));

    try {
      await axios.post(
        'http://localhost:3001/cache/tags',
        {
          tags: payload,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Failed to send tags to server:', error);
    }
  },
};

export default tagCache;
