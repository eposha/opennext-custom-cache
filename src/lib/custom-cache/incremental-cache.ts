import { createHash } from 'node:crypto';

import { error } from '@opennextjs/aws/adapters/logger.js';
import type {
  CacheValue,
  IncrementalCache,
  WithLastModified,
} from '@opennextjs/aws/types/overrides.js';
import axios from 'axios';

export const NAME = 'cache';

export const DEFAULT_PREFIX = 'cache';

export type KeyOptions = {
  isFetch?: boolean;
  directory?: string;
  buildId?: string;
};

export const FALLBACK_BUILD_ID = 'fallback-build-id';

export function computeCacheKey(key: string, options: KeyOptions) {
  const {
    isFetch = false,
    directory = DEFAULT_PREFIX,
    buildId = FALLBACK_BUILD_ID,
  } = options;
  const hash = createHash('sha256').update(key).digest('hex');
  return `${directory}/${buildId}/${hash}.${
    isFetch ? 'fetch' : 'cache'
  }`.replace(/\/+/g, '/');
}

/**
 * An instance of the Incremental Cache that uses an R2 bucket (`NEXT_INC_CACHE_R2_BUCKET`) as it's
 * underlying data store.
 *
 * The directory that the cache entries are stored in can be configured with the `NEXT_INC_CACHE_R2_PREFIX`
 * environment variable, and defaults to `incremental-cache`.
 */
const handleCache: IncrementalCache = {
  name: NAME,

  async get<IsFetch extends boolean = false>(
    key: string,
    isFetch?: IsFetch
  ): Promise<WithLastModified<CacheValue<IsFetch>> | null> {
    try {
      const path = getKey(key, isFetch);
      const { data: value } = await axios.get(
        `http://localhost:3001/cache/${path}`
      );

      const lastModified = value?.uploaded
        ? new Date(value.uploaded).getTime()
        : Date.now();

      return {
        value,
        lastModified,
      };
    } catch (e) {
      error('Failed to get from cache', e);
      return null;
    }
  },

  async set<IsFetch extends boolean = false>(
    key: string,
    value: CacheValue<IsFetch>,
    isFetch?: IsFetch
  ): Promise<void> {
    try {
      const path = getKey(key, isFetch);

      await axios.put(
        'http://localhost:3001/cache/',
        { value: JSON.stringify({ ...value, uploaded: new Date() }), path },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (e) {
      error('Failed to set to cache', e);
    }
  },

  async delete(key: string): Promise<void> {
    const path = getKey(key);

    console.log('delete key', key);

    try {
      await axios.delete(`http://localhost:3001/cache/${path}`);
    } catch (e) {
      error('Failed to delete from cache', e);
    }
  },
};

const getKey = (key: string, isFetch?: boolean): string => {
  return computeCacheKey(key, {
    buildId: process.env.NEXT_BUILD_ID,
    isFetch,
  });
};

export default handleCache;
