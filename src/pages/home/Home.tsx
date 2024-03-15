import { Link, useNavigate } from 'react-router-dom';

import Header from '@/shared/components/Header.tsx';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <Header />
      <div className="flex flex-col gap-2 p-2">
        <div
          className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          onClick={() => navigate('/document')}
        >
          <div className="card-body">
            <h2 className="card-title">Docs</h2>
          </div>
        </div>
        <div
          className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          onClick={() => navigate('/canvas')}
        >
          <div className="card-body">
            <h2 className="card-title">Canvas</h2>
          </div>
        </div>
        <div
          className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          onClick={() => navigate('/explorer')}
        >
          <div className="card-body">
            <h2 className="card-title">Explorer</h2>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <a className="link link-accent" href="https://github.com/mmalmi/iris-docs">
            GitHub
          </a>
          <Link
            to="/document/npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk/iris-docs-about"
            className="link link-accent"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
