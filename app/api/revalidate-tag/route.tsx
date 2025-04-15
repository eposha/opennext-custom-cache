import { revalidateTag } from 'next/cache';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');

  if (!tag) {
    return new Response('Missing tag', { status: 400 });
  }

  revalidateTag(tag);
  return new Response('Revalidated');
};
