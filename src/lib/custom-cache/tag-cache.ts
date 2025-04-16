/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TagCache } from '@opennextjs/aws/types/overrides.js';

import axios from 'axios';

const tags = [
  {
    tag: { S: 'tag1' },
    path: { S: 'path1' },
    revalidatedAt: { N: '0' },
  },
];

const tagCache: TagCache = {
  name: 'tag-cache',
  mode: 'original',
  getByPath: async (path: string) => {
    console.log('Get By Path', path);

    try {
      const { data: tags } = await axios.get(
        `http://localhost:3001/cache-by-path/${path}`
      );
      console.log('Get Paths', tags);
      return tags;
    } catch {
      return [];
    }

    // return tags
    //   .filter((tagPathMapping) => tagPathMapping.path.S === path)
    //   .map((tag) => tag.tag.S);
  },
  getByTag: async (tag: string) => {
    console.log('Get By Tag', tag);
    try {
      const { data: tags } = await axios.get(
        `http://localhost:3001/cache-by-tag/${tag}`
      );

      console.log('Get Tags', tags);
      return tags;
    } catch {
      return [];
    }
    // return tags
    //   .filter((tagPathMapping) => tagPathMapping.tag.S === tag)
    //   .map((tag) => tag.path.S);
  },
  getLastModified: async (path: string, lastModified?: number) => {
    console.log('Get Last Modified', path);

    const revalidatedTags = tags.filter(
      (tagPathMapping) =>
        tagPathMapping.path.S === path &&
        Number.parseInt(tagPathMapping.revalidatedAt.N) > (lastModified ?? 0)
    );
    return revalidatedTags.length > 0 ? -1 : lastModified ?? Date.now();
  },
  writeTags: async (newTags: any[]) => {
    console.log('Write Tags', newTags);
    try {
      await axios.post(
        'http://localhost:3001/cache-tags/',
        {
          newTags,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    } catch {}
    // const unchangedTags = tags.filter(
    //   ({ tag, path }) => !newTagsSet.has(`${tag}-${path}`)
    // );

    // const unchangedTags = tags.filter(
    //   ({ tag, path }) => !newTagsSet.has(`${tag.S}-${path.S}`)
    // );
    // tags = unchangedTags.concat(
    //   newTags.map((tag: { tag: any; path: any; revalidatedAt: any }) => ({
    //     tag: { S: tag.tag },
    //     path: { S: tag.path },
    //     revalidatedAt: { N: String(tag.revalidatedAt) },
    //   }))
    // );
  },
};

export default tagCache;
