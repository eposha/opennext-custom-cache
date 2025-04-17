// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { TagCache } from '@opennextjs/aws/types/overrides.js';

// import axios from 'axios';

// // const tags = [
// //   {
// //     tag: { S: 'tag1' },
// //     path: { S: 'path1' },
// //     revalidatedAt: { N: '0' },
// //   },
// // ];

// const tagCache: TagCache = {
//   name: 'tag-cache',
//   mode: 'original',
//   getByPath: async (path: string) => {
//     console.log('Get By Path', path);

//     try {
//       const { data: tags } = await axios.get(
//         `http://localhost:3001/cache-by-path/${path}`
//       );
//       console.log('Get Paths', tags);
//       return tags;
//     } catch {
//       return [];
//     }

//     // return tags
//     //   .filter((tagPathMapping) => tagPathMapping.path.S === path)
//     //   .map((tag) => tag.tag.S);
//   },
//   getByTag: async (tag: string) => {
//     console.log('Get By Tag', tag);
//     try {
//       const { data: tags } = await axios.get(
//         `http://localhost:3001/cache-by-tag/${tag}`
//       );

//       console.log('Get Tags', tags);
//       return tags;
//     } catch {
//       return [];
//     }
//     // return tags
//     //   .filter((tagPathMapping) => tagPathMapping.tag.S === tag)
//     //   .map((tag) => tag.path.S);
//   },
//   getLastModified: async (path: string, lastModified?: number) => {
//     console.log('Get Last Modified', path);

//     try {
//       const { data } = await axios.post(
//         `http://localhost:3001/cache-last-modified/`,
//         {
//           path,
//           lastModified,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       console.log('Get Last Modified', lastModified);
//       return data ? Number.parseInt(data) : Date.now();
//     } catch {
//       return Date.now();
//     }

//     // const revalidatedTags = tags.filter(
//     //   (tagPathMapping) =>
//     //     tagPathMapping.path.S === path &&
//     //     Number.parseInt(tagPathMapping.revalidatedAt.N) > (lastModified ?? 0)
//     // );
//     // return revalidatedTags.length > 0 ? -1 : lastModified ?? Date.now();
//   },
//   writeTags: async (newTags: any[]) => {
//     console.log('Write Tags', newTags);
//     try {
//       await axios.post(
//         'http://localhost:3001/cache-tags/',
//         {
//           newTags,
//         },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//     } catch {}
//     // const unchangedTags = tags.filter(
//     //   ({ tag, path }) => !newTagsSet.has(`${tag}-${path}`)
//     // );

//     // const unchangedTags = tags.filter(
//     //   ({ tag, path }) => !newTagsSet.has(`${tag.S}-${path.S}`)
//     // );
//     // tags = unchangedTags.concat(
//     //   newTags.map((tag: { tag: any; path: any; revalidatedAt: any }) => ({
//     //     tag: { S: tag.tag },
//     //     path: { S: tag.path },
//     //     revalidatedAt: { N: String(tag.revalidatedAt) },
//     //   }))
//     // );
//   },
// };

// export default tagCache;

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
        {
          headers: { 'Content-Type': 'application/json' },
          // body: JSON.stringify({
          //   tags: tags.map((tag) => getCacheKey(tag)), // `${buildId}/${tag}`
          //   lastModified,
          // }),
        }
      );

      // const data = (await response.json()) as { hasBeenRevalidated: boolean };
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
