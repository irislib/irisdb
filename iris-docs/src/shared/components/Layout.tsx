import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from '@/shared/components/Header';

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
