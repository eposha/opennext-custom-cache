'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

export const unstableRevalidate = async (tag: string) => {
  revalidateTag(tag);
};

export const pathRevalidate = async (path: string) => {
  revalidatePath(path);
};
