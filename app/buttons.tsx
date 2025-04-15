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
      <button onClick={() => unstableRevalidate('test5')}>
        {/* <button onClick={() => revalidateTag('test5')}> */}
        Unstable revalidate
      </button>
      <button onClick={() => pathRevalidate('/test')}>Path revalidate</button>
    </div>
  );
};

export default Buttons;

// get data {
//   kind: 'FETCH',
//   data: { headers: {}, body: '1744393751961', status: 200, url: '' },
//   revalidate: 31536000
// }

// {
//   value: {
//     kind: 'FETCH',
//     data: { headers: {}, body: '1744394022803', status: 200, url: '' },
//     revalidate: 31536000
//   },
//   lastModified: 1744394022804,
//   tags: [ 'test' ]
// }
