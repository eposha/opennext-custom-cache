// const cache = new Map();

// module.exports = class CacheHandler {
//   constructor(options) {
//     this.options = options;
//   }

//   async get(key) {
//     // This could be stored anywhere, like durable storage
//     return cache.get(key);
//   }

//   async set(key, data, ctx) {
//     // This could be stored anywhere, like durable storage
//     cache.set(key, {
//       value: data,
//       lastModified: Date.now(),
//       tags: ctx.tags,
//     });
//   }

//   async revalidateTag(tags) {
//     // tags is either a string or an array of strings
//     tags = [tags].flat();
//     // Iterate over all entries in the cache
//     for (let [key, value] of cache) {
//       // If the value's tags include the specified tag, delete this entry
//       if (value.tags?.some((tag) => tags.includes(tag))) {
//         cache.delete(key);
//       }
//     }
//   }

//   // If you want to have temporary in memory cache for a single request that is reset
//   // before the next request you can leverage this method
//   resetRequestCache() {}
// };

// eslint-disable-next-line @typescript-eslint/no-require-imports
const axios = require('axios');
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const path = require('path');
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const fs = require('fs');

// function getBuildId() {
//   const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
//   return fs.readFileSync(buildIdPath, 'utf8').trim();
// }

// const buildId = getBuildId();

const buildId = 'process.env.BUILD_ID';

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    console.log('buildId', buildId);
    try {
      const res = await axios.get(
        `https://fake/cache/${encodeURIComponent(`${key}-${buildId}`)}`
      );

      // console.log('Data received:', res.data);
      return res.data;
    } catch (err) {
      console.error('Error fetching from cache:', err);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      console.log('buildId', buildId);
      console.log('SET key', key);
      const headersCacheTags = data?.headers?.['x-next-cache-tags']?.split(',');

      console.log('SET ctx', ctx);
      console.log('SET data', data);
      console.log('headersCacheTags', headersCacheTags);

      const tags = ctx.tags ?? headersCacheTags;

      const res = await axios.post(
        `https://fake/cache/${encodeURIComponent(`${key}-${buildId}`)}`,
        {
          value: data,
          lastModified: Date.now(),
          tags,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Set result:', res.status);
    } catch (err) {
      console.error('Error setting cache:', err);
    }
  }

  async revalidateTag(tags) {
    console.log('revalidateTag tags', tags);
    tags = [tags].flat();
    try {
      const res = await axios.post(
        `https://fake/revalidate`,
        { tags },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Revalidate result:', res.data);
    } catch (err) {
      console.error('Error during revalidation:', err);
    }
  }
};

// opennext aws cache-handler
// https://github.com/opennextjs/opennextjs-aws/blob/main/packages/open-next/src/adapters/cache.ts
// import type {
//   CacheHandlerValue,
//   IncrementalCacheContext,
//   IncrementalCacheValue,
// } from "types/cache";
// import { getTagsFromValue, hasBeenRevalidated } from "utils/cache";
// import { isBinaryContentType } from "../utils/binary";
// import { debug, error, warn } from "./logger";

// function isFetchCache(
//   options?:
//     | boolean
//     | {
//         fetchCache?: boolean;
//         kindHint?: "app" | "pages" | "fetch";
//         kind?: "FETCH";
//       },
// ): boolean {
//   if (typeof options === "boolean") {
//     return options;
//   }
//   if (typeof options === "object") {
//     return (
//       options.kindHint === "fetch" ||
//       options.fetchCache ||
//       options.kind === "FETCH"
//     );
//   }
//   return false;
// }
// // We need to use globalThis client here as this class can be defined at load time in next 12 but client is not available at load time
// export default class Cache {
//   public async get(
//     key: string,
//     // fetchCache is for next 13.5 and above, kindHint is for next 14 and above and boolean is for earlier versions
//     options?:
//       | boolean
//       | {
//           fetchCache?: boolean;
//           kindHint?: "app" | "pages" | "fetch";
//           tags?: string[];
//           softTags?: string[];
//           kind?: "FETCH";
//         },
//   ) {
//     if (globalThis.openNextConfig.dangerous?.disableIncrementalCache) {
//       return null;
//     }

//     const softTags = typeof options === "object" ? options.softTags : [];
//     const tags = typeof options === "object" ? options.tags : [];
//     return isFetchCache(options)
//       ? this.getFetchCache(key, softTags, tags)
//       : this.getIncrementalCache(key);
//   }

//   async getFetchCache(key: string, softTags?: string[], tags?: string[]) {
//     debug("get fetch cache", { key, softTags, tags });
//     try {
//       const cachedEntry = await globalThis.incrementalCache.get(key, true);

//       if (cachedEntry?.value === undefined) return null;

//       const _tags = [...(tags ?? []), ...(softTags ?? [])];
//       const _lastModified = cachedEntry.lastModified ?? Date.now();
//       const _hasBeenRevalidated = await hasBeenRevalidated(
//         key,
//         _tags,
//         cachedEntry,
//       );

//       if (_hasBeenRevalidated) return null;

//       // For cases where we don't have tags, we need to ensure that the soft tags are not being revalidated
//       // We only need to check for the path as it should already contain all the tags
//       if ((tags ?? []).length === 0) {
//         // Then we need to find the path for the given key
//         const path = softTags?.find(
//           (tag) =>
//             tag.startsWith("_N_T_/") &&
//             !tag.endsWith("layout") &&
//             !tag.endsWith("page"),
//         );
//         if (path) {
//           const hasPathBeenUpdated = await hasBeenRevalidated(
//             path.replace("_N_T_/", ""),
//             [],
//             cachedEntry,
//           );
//           if (hasPathBeenUpdated) {
//             // In case the path has been revalidated, we don't want to use the fetch cache
//             return null;
//           }
//         }
//       }

//       return {
//         lastModified: _lastModified,
//         value: cachedEntry.value,
//       } as CacheHandlerValue;
//     } catch (e) {
//       // We can usually ignore errors here as they are usually due to cache not being found
//       debug("Failed to get fetch cache", e);
//       return null;
//     }
//   }

//   async getIncrementalCache(key: string): Promise<CacheHandlerValue | null> {
//     try {
//       const cachedEntry = await globalThis.incrementalCache.get(key, false);

//       if (!cachedEntry?.value) {
//         return null;
//       }

//       const cacheData = cachedEntry.value;

//       const meta = cacheData.meta;
//       const tags = getTagsFromValue(cacheData);
//       const _lastModified = cachedEntry.lastModified ?? Date.now();
//       const _hasBeenRevalidated = await hasBeenRevalidated(
//         key,
//         tags,
//         cachedEntry,
//       );
//       if (_hasBeenRevalidated) return null;

//       const store = globalThis.__openNextAls.getStore();
//       if (store) {
//         store.lastModified = _lastModified;
//       }

//       if (cacheData?.type === "route") {
//         return {
//           lastModified: _lastModified,
//           value: {
//             kind: globalThis.isNextAfter15 ? "APP_ROUTE" : "ROUTE",
//             body: Buffer.from(
//               cacheData.body ?? Buffer.alloc(0),
//               isBinaryContentType(String(meta?.headers?.["content-type"]))
//                 ? "base64"
//                 : "utf8",
//             ),
//             status: meta?.status,
//             headers: meta?.headers,
//           },
//         } as CacheHandlerValue;
//       }
//       if (cacheData?.type === "page" || cacheData?.type === "app") {
//         if (globalThis.isNextAfter15 && cacheData?.type === "app") {
//           return {
//             lastModified: _lastModified,
//             value: {
//               kind: "APP_PAGE",
//               html: cacheData.html,
//               rscData: Buffer.from(cacheData.rsc),
//               status: meta?.status,
//               headers: meta?.headers,
//               postponed: meta?.postponed,
//             },
//           } as CacheHandlerValue;
//         }
//         return {
//           lastModified: _lastModified,
//           value: {
//             kind: globalThis.isNextAfter15 ? "PAGES" : "PAGE",
//             html: cacheData.html,
//             pageData:
//               cacheData.type === "page" ? cacheData.json : cacheData.rsc,
//             status: meta?.status,
//             headers: meta?.headers,
//           },
//         } as CacheHandlerValue;
//       }
//       if (cacheData?.type === "redirect") {
//         return {
//           lastModified: _lastModified,
//           value: {
//             kind: "REDIRECT",
//             props: cacheData.props,
//           },
//         } as CacheHandlerValue;
//       }
//       warn("Unknown cache type", cacheData);
//       return null;
//     } catch (e) {
//       // We can usually ignore errors here as they are usually due to cache not being found
//       debug("Failed to get body cache", e);
//       return null;
//     }
//   }

//   async set(
//     key: string,
//     data?: IncrementalCacheValue,
//     ctx?: IncrementalCacheContext,
//   ): Promise<void> {
//     if (globalThis.openNextConfig.dangerous?.disableIncrementalCache) {
//       return;
//     }
//     // This one might not even be necessary anymore
//     // Better be safe than sorry
//     const detachedPromise = globalThis.__openNextAls
//       .getStore()
//       ?.pendingPromiseRunner.withResolvers<void>();
//     try {
//       if (data === null || data === undefined) {
//         await globalThis.incrementalCache.delete(key);
//       } else {
//         switch (data.kind) {
//           case "ROUTE":
//           case "APP_ROUTE": {
//             const { body, status, headers } = data;
//             await globalThis.incrementalCache.set(
//               key,
//               {
//                 type: "route",
//                 body: body.toString(
//                   isBinaryContentType(String(headers["content-type"]))
//                     ? "base64"
//                     : "utf8",
//                 ),
//                 meta: {
//                   status,
//                   headers,
//                 },
//               },
//               false,
//             );
//             break;
//           }
//           case "PAGE":
//           case "PAGES": {
//             const { html, pageData, status, headers } = data;
//             const isAppPath = typeof pageData === "string";
//             if (isAppPath) {
//               await globalThis.incrementalCache.set(
//                 key,
//                 {
//                   type: "app",
//                   html,
//                   rsc: pageData,
//                   meta: {
//                     status,
//                     headers,
//                   },
//                 },
//                 false,
//               );
//             } else {
//               await globalThis.incrementalCache.set(
//                 key,
//                 {
//                   type: "page",
//                   html,
//                   json: pageData,
//                 },
//                 false,
//               );
//             }
//             break;
//           }
//           case "APP_PAGE": {
//             const { html, rscData, headers, status } = data;
//             await globalThis.incrementalCache.set(
//               key,
//               {
//                 type: "app",
//                 html,
//                 rsc: rscData.toString("utf8"),
//                 meta: {
//                   status,
//                   headers,
//                 },
//               },
//               false,
//             );
//             break;
//           }
//           case "FETCH":
//             await globalThis.incrementalCache.set<true>(key, data, true);
//             break;
//           case "REDIRECT":
//             await globalThis.incrementalCache.set(
//               key,
//               {
//                 type: "redirect",
//                 props: data.props,
//               },
//               false,
//             );
//             break;
//           case "IMAGE":
//             // Not implemented
//             break;
//         }
//       }

//       await this.updateTagsOnSet(key, data, ctx);
//       debug("Finished setting cache");
//     } catch (e) {
//       error("Failed to set cache", e);
//     } finally {
//       // We need to resolve the promise even if there was an error
//       detachedPromise?.resolve();
//     }
//   }

//   public async revalidateTag(tags: string | string[]) {
//     const config = globalThis.openNextConfig.dangerous;
//     if (config?.disableTagCache || config?.disableIncrementalCache) {
//       return;
//     }
//     try {
//       const _tags = Array.isArray(tags) ? tags : [tags];
//       if (globalThis.tagCache.mode === "nextMode") {
//         const paths = (await globalThis.tagCache.getPathsByTags?.(_tags)) ?? [];

//         await globalThis.tagCache.writeTags(_tags);
//         if (paths.length > 0) {
//           // TODO: we should introduce a new method in cdnInvalidationHandler to invalidate paths by tags for cdn that supports it
//           // It also means that we'll need to provide the tags used in every request to the wrapper or converter.
//           await globalThis.cdnInvalidationHandler.invalidatePaths(
//             paths.map((path) => ({
//               initialPath: path,
//               rawPath: path,
//               resolvedRoutes: [
//                 {
//                   route: path,
//                   // TODO: ideally here we should check if it's an app router page or route
//                   type: "app",
//                 },
//               ],
//             })),
//           );
//         }
//         return;
//       }
//       for (const tag of _tags) {
//         debug("revalidateTag", tag);
//         // Find all keys with the given tag
//         const paths = await globalThis.tagCache.getByTag(tag);
//         debug("Items", paths);
//         const toInsert = paths.map((path) => ({
//           path,
//           tag,
//         }));

//         // If the tag is a soft tag, we should also revalidate the hard tags
//         if (tag.startsWith("_N_T_/")) {
//           for (const path of paths) {
//             // We need to find all hard tags for a given path
//             const _tags = await globalThis.tagCache.getByPath(path);
//             const hardTags = _tags.filter((t) => !t.startsWith("_N_T_/"));
//             // For every hard tag, we need to find all paths and revalidate them
//             for (const hardTag of hardTags) {
//               const _paths = await globalThis.tagCache.getByTag(hardTag);
//               debug({ hardTag, _paths });
//               toInsert.push(
//                 ..._paths.map((path) => ({
//                   path,
//                   tag: hardTag,
//                 })),
//               );
//             }
//           }
//         }

//         // Update all keys with the given tag with revalidatedAt set to now
//         await globalThis.tagCache.writeTags(toInsert);

//         // We can now invalidate all paths in the CDN
//         // This only applies to `revalidateTag`, not to `res.revalidate()`
//         const uniquePaths = Array.from(
//           new Set(
//             toInsert
//               // We need to filter fetch cache key as they are not in the CDN
//               .filter((t) => t.tag.startsWith("_N_T_/"))
//               .map((t) => `/${t.path}`),
//           ),
//         );
//         if (uniquePaths.length > 0) {
//           await globalThis.cdnInvalidationHandler.invalidatePaths(
//             uniquePaths.map((path) => ({
//               initialPath: path,
//               rawPath: path,
//               resolvedRoutes: [
//                 {
//                   route: path,
//                   // TODO: ideally here we should check if it's an app router page or route
//                   type: "app",
//                 },
//               ],
//             })),
//           );
//         }
//       }
//     } catch (e) {
//       error("Failed to revalidate tag", e);
//     }
//   }

//   // TODO: We should delete/update tags in this method
//   // This will require an update to the tag cache interface
//   private async updateTagsOnSet(
//     key: string,
//     data?: IncrementalCacheValue,
//     ctx?: IncrementalCacheContext,
//   ) {
//     if (
//       globalThis.openNextConfig.dangerous?.disableTagCache ||
//       globalThis.tagCache.mode === "nextMode" ||
//       // Here it means it's a delete
//       !data
//     ) {
//       return;
//     }
//     // Write derivedTags to the tag cache
//     // If we use an in house version of getDerivedTags in build we should use it here instead of next's one
//     const derivedTags: string[] =
//       data?.kind === "FETCH"
//         ? (ctx?.tags ?? data?.data?.tags ?? []) // before version 14 next.js used data?.data?.tags so we keep it for backward compatibility
//         : data?.kind === "PAGE"
//           ? (data.headers?.["x-next-cache-tags"]?.split(",") ?? [])
//           : [];
//     debug("derivedTags", derivedTags);

//     // Get all tags stored in dynamodb for the given key
//     // If any of the derived tags are not stored in dynamodb for the given key, write them
//     const storedTags = await globalThis.tagCache.getByPath(key);
//     const tagsToWrite = derivedTags.filter((tag) => !storedTags.includes(tag));
//     if (tagsToWrite.length > 0) {
//       await globalThis.tagCache.writeTags(
//         tagsToWrite.map((tag) => ({
//           path: key,
//           tag: tag,
//           // In case the tags are not there we just need to create them
//           // but we don't want them to return from `getLastModified` as they are not stale
//           revalidatedAt: 1,
//         })),
//       );
//     }
//   }
// }
