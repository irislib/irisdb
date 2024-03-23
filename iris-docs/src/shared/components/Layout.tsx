import { Outlet } from 'react-router-dom';

import Header from '@/shared/components/Header';

const Layout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
