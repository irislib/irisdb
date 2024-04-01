import { RiBrushLine, RiFileLine, RiFolderOpenLine } from '@remixicon/react';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const NavSideBar = ({
  isSidebarOpen,
  setSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    const closeSidebar = (e: MouseEvent) => {
      // Check if the click is outside the sidebar
      if (!ref.current?.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', closeSidebar);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', closeSidebar);
    };
  }, [setSidebarOpen]);

  return (
    <div
      ref={ref}
      className={`fixed py-4 select-none shadow-lg top-0 left-0 w-64 h-full bg-base-200 z-40 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out flex flex-col`}
    >
      <div className="flex-grow overflow-auto">
        <Link className="m-6 text-2xl bg-base-200" to="/">
          Iris Docs
        </Link>
        <ul className="menu bg-base-200 w-full rounded-box">
          <li>
            <Link to="/">
              <RiFileLine className="w-5 h-5" />
              Docs
            </Link>
          </li>
          <li>
            <Link to="/canvas">
              <RiBrushLine className="w-5 h-5" />
              Canvas
            </Link>
          </li>
          <li>
            <Link to="/explorer">
              <RiFolderOpenLine className="w-5 h-5" />
              Explorer
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-auto">
        <Link
          className="mx-4 hover:underline"
          to="/document/iris-docs-about?owner=npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk"
        >
          About
        </Link>
      </div>
    </div>
  );
};
