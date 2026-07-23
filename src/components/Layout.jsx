import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/backend';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="brand">Cadence<span>.</span></div>
          <button
            type="button"
            className="hamburger-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`hamburger-icon${menuOpen ? ' open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>

        <nav className={`nav-links${menuOpen ? ' open' : ''}`}>
          <NavLink to="/dashboard" onClick={closeMenu} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Tasks
          </NavLink>
          <NavLink to="/analytics" onClick={closeMenu} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Analytics
          </NavLink>
        </nav>

        <div className={`sidebar-footer${menuOpen ? ' open' : ''}`}>
          <div>{user?.displayName || user?.email}</div>
          <div style={{ marginTop: 2 }}>{isFirebaseConfigured ? 'Firebase mode' : 'Demo mode'}</div>
          <button className="signout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
