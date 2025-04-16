'use client';

import { pathRevalidate, unstableRevalidate } from './action';

// const revalidateTag = async (tag: string) => {
//   await fetch(`/api/revalidate-tag?tag=${tag}`, {
//     method: 'GET',
//   });
// };

// const pathRevalidate = async (path: string) => {
//   await fetch(`/api/revalidate-path?path=${path}`, {
//     method: 'GET',
//   });
// };

const Buttons = () => {
  return (
    <div className='flex flex-col gap-4'>
      <button
        onClick={() => unstableRevalidate('test5')}
        className='border border-green-500 p-4 rounded cursor-pointer'>
        Unstable revalidate button
      </button>
      <button
        onClick={() => pathRevalidate('/test')}
        className='border border-green-500 p-4 rounded cursor-pointer'>
        Path revalidate button
      </button>
    </div>
  );
};

export default Buttons;
