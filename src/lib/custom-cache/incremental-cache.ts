/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncrementalCache } from '@opennextjs/aws/types/overrides';

// import fs from 'node:fs/promises';
// import path from 'node:path';

const buildId = process.env.NEXT_BUILD_ID;
// const basePath = path.resolve(process.cwd(), `./cache/${buildId}`);

const getCacheKey = (key: string) => {
  // return path.join(basePath, `${key}.cache`);
};

const cache: IncrementalCache = {
  name: 'incremental-cache',
  get: async (key: string) => {
    console.log('get key', key);

    return null;
    // const fileData = await fs.readFile(getCacheKey(key), 'utf-8');
    // const data = JSON.parse(fileData);
    // const { mtime } = await fs.stat(getCacheKey(key));
    // return {
    //   value: data,
    //   lastModified: mtime.getTime(),
    // };
  },
  set: async (key: any, value: any, isFetch: any) => {
    console.log('set key', key, value, isFetch);
    // const data = JSON.stringify(value);
    // const cacheKey = getCacheKey(key);
    // // We need to create the directory before writing the file
    // await fs.mkdir(path.dirname(cacheKey), { recursive: true });
    // await fs.writeFile(cacheKey, data);
  },
  delete: async (key: any) => {
    console.log('delete key', key);
    // await fs.rm(getCacheKey(key));
  },
};

export default cache;
