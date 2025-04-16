/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IncrementalCache } from '@opennextjs/aws/types/overrides';

import axios from 'axios';

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
    // console.log('get key', key);

    // return null;
    // const fileData = await fs.readFile(getCacheKey(key), 'utf-8');
    // const data = JSON.parse(fileData);
    // const { mtime } = await fs.stat(getCacheKey(key));

    try {
      const response = await axios.get(
        `http://localhost:3001/cache/${encodeURIComponent(
          `${buildId}___${key}`
        )}`
      );
      const data = response.data;
      const mtime = new Date(response.headers['last-modified'] as string);

      console.log('get data: ', data);

      return {
        value: data,
        lastModified: mtime?.getTime() ?? Date.now(),
      };
    } catch (err) {
      return null;
    }

    // return {
    //   value: data,
    //   lastModified: mtime.getTime(),
    // };
  },

  set: async (key: any, value: any, isFetch: any) => {
    console.log('set key', key, value, isFetch);
    const data = JSON.stringify(value);
    // const cacheKey = getCacheKey(key);
    // We need to create the directory before writing the file
    // await fs.mkdir(path.dirname(cacheKey), { recursive: true });

    await axios.post(
      `http://localhost:3001/cache/${encodeURIComponent(
        `${buildId}___${key}`
      )}`,
      { data },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  },
  delete: async (key: any) => {
    console.log('delete key', key);
    await axios.delete(
      `http://localhost:3001/cache/${encodeURIComponent(`${buildId}___${key}`)}`
    );
    // await fs.rm(getCacheKey(key));
  },
};

export default cache;
