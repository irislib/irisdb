import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 p-2">
        <Link
          className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          to={'/document'}
        >
          <div className="card-body">
            <h2 className="card-title">Docs</h2>
          </div>
        </Link>
        <Link className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90" to={'/canvas'}>
          <div className="card-body">
            <h2 className="card-title">Canvas</h2>
          </div>
        </Link>
        <Link
          className="card bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          to={'/explorer'}
        >
          <div className="card-body">
            <h2 className="card-title">Explorer</h2>
          </div>
        </Link>
        <div className="flex flex-row gap-2">
          <a className="link link-accent" href="https://github.com/mmalmi/iris-docs">
            GitHub
          </a>
          <Link
            to="/document/iris-docs-about?user=npub1g53mukxnjkcmr94fhryzkqutdz2ukq4ks0gvy5af25rgmwsl4ngq43drvk"
            className="link link-accent"
          >
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
