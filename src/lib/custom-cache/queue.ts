/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Queue } from '@opennextjs/aws/types/overrides.js';

const queue: Queue = {
  name: 'queue',
  send: async (message: { MessageBody: { host: any; url: any } }) => {
    console.log('message', message);
    const prerenderManifest = (
      await import('@opennextjs/aws/adapters/config/index.js')
    ).PrerenderManifest as any;
    const { host, url } = message.MessageBody;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const revalidateId: string = prerenderManifest.preview.previewModeId;
    //@ts-ignore
    await globalThis?.internalFetch?.(`${protocol}://${host}${url}`, {
      method: 'HEAD',
      headers: {
        'x-prerender-revalidate': revalidateId,
        'x-isr': '1',
      },
    });
  },
};

export default queue;
