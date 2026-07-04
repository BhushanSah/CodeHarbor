import { Link, NavLink } from "react-router-dom";
import logo from "../assets/github-mark-white.svg";
import "./Navbar.css";

const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle
      cx="8"
      cy="5.2"
      r="2.7"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M2.5 14c.3-3 2.5-4.7 5.5-4.7s5.2 1.7 5.5 4.7"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="" className="navbar-logo" />
          <span>CodeHarbor</span>
        </Link>

        <nav className="navbar-actions" aria-label="Main navigation">
          <NavLink to="/create" className="navbar-create">
            <PlusIcon />
            <span>New repository</span>
          </NavLink>

          <NavLink
            to="/profile"
            className="navbar-profile"
            aria-label="Open profile"
            title="Profile"
          >
            <ProfileIcon />
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;