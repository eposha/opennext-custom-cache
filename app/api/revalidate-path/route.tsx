import { revalidatePath } from 'next/cache';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return new Response('Missing path', { status: 400 });
  }

  revalidatePath(path);
  return new Response('Revalidated');
};
