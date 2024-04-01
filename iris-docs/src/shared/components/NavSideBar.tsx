import { RiBrushLine, RiFileLine, RiFolderOpenLine, RiSettings3Line, RiInformationLine } from '@remixicon/react';
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
      className={`fixed select-none shadow-lg top-0 left-0 w-64 h-full bg-base-100 z-40 transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out flex flex-col`}
    >
      <Link className="mx-6 m-4 text-2xl" to="/">
        Iris Docs
      </Link>
      <hr className="border-base-300" />
      <ul className="menu w-full rounded-box">
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
      </ul>
      <hr className="border-base-300" />
      <ul className="menu w-full rounded-box">
        <li>
          <Link to="/settings">
            <RiSettings3Line className="w-5 h-5" />
            Settings
          </Link>
        </li>
        <li>
          <Link to="/explorer">
            <RiFolderOpenLine className="w-5 h-5" />
            Explorer
          </Link>
        </li>
        <li>
          <Link
            to="/document/iris-docs-about?owner=npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk"
          >
            <RiInformationLine className="w-5 h-5" />
            About
          </Link>
        </li>
      </ul>
      <hr className="border-base-300" />
    </div>
  );
};
