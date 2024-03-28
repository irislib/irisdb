import './index.css';

import { RouterProvider } from 'react-router-dom';

import { router } from '@/pages';

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};
