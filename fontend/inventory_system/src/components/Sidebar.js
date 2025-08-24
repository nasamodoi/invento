import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../utils/token'; // assuming token decoding for roles
import '../api';
import './Sidebar.css';

/* ---------- Hooks ---------- */
function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined') && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    m.addEventListener?.('change', onChange) ?? m.addListener(onChange);
    return () => m.removeEventListener?.('change', onChange) ?? m.removeListener(onChange);
  }, [query]);

  return matches;
}

/* ---------- Sidebar ---------- */
const Sidebar = () => {
  const user = useUser();

  // Breakpoints
  const isMobile = useMediaQuery('(max-width: 1024px)'); // auto-collapse threshold
  const isTiny = useMediaQuery('(max-width: 640px)'); // switch to drawer

  // Collapsed/open state with persistence and "user intent" pinning
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar:collapsed');
    return saved ? JSON.parse(saved) : false; // default expanded on desktop
  });
  const [pinnedByUser, setPinnedByUser] = useState(false);

  useEffect(() => {
    // If user hasn't explicitly pinned/toggled, follow breakpoint
    if (!pinnedByUser) {
      setCollapsed(isMobile); // collapse by default on mobile
    }
  }, [isMobile, pinnedByUser]);

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => {
    setPinnedByUser(true);
    setCollapsed(v => !v);
  };

  // Drawer open when tiny and not collapsed
  const drawerOpen = isTiny && !collapsed;

  // Focus and scroll lock for drawer
  const drawerRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!drawerOpen) return;

    // Focus first link
    const el = firstLinkRef.current || drawerRef.current?.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    el?.focus?.();

    // ESC to close
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setCollapsed(true);
    };
    document.addEventListener('keydown', onKeyDown);

    // Body scroll lock
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // Shared nav (keeps your emojis and role-based link)
  const Nav = useMemo(() => (
    <nav className="nav flex-column" aria-label="Primary">
      <NavLink to="/" className="nav-link" activeClassName="active" ref={firstLinkRef}>
        🏠 {!collapsed && 'Overview'}
      </NavLink>
      <NavLink to="/products" className="nav-link" activeClassName="active">
        📦 {!collapsed && 'Products'}
      </NavLink>
      <NavLink to="/purchases" className="nav-link" activeClassName="active">
        📥 {!collapsed && 'Purchases'}
      </NavLink>
      <NavLink to="/sales" className="nav-link" activeClassName="active">
        💸 {!collapsed && 'Sales'}
      </NavLink>
      <NavLink to="/expenses" className="nav-link" activeClassName="active">
        🧾 {!collapsed && 'Expenses'}
      </NavLink>
      <NavLink to="/reports" className="nav-link" activeClassName="active">
        📊 {!collapsed && 'Reports'}
      </NavLink>
      <NavLink to="/settings" className="nav-link" activeClassName="active">
        ⚙️ {!collapsed && 'Settings'}
      </NavLink>
      {user?.is_admin && (
        <NavLink to="/users" className="nav-link" activeClassName="active">
          👥 {!collapsed && 'Users'}
        </NavLink>
      )}
      <NavLink to="/logout" className="nav-link text-danger mt-4" activeClassName="active">
        🔓 {!collapsed && 'Logout'}
      </NavLink>
    </nav>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [collapsed, user?.is_admin]);

  // Toggle icon as a single SVG that rotates
  const ToggleIcon = () => (
    <span className="rot-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="green" strokeWidth="2"/>
        {/* Chevron right; rotates 180deg when expanded */}
        <path d="M10 8L14 12L10 16" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );

  /* -------- Tiny screens: render as drawer -------- */
  if (isTiny) {
    return (
      <>
        {/* Floating toggle button (visible only on tiny screens) */}
        <button
          type="button"
          className="btn btn-success tiny-toggle-floating"
          aria-label={drawerOpen ? 'Close navigation' : 'Open navigation'}
          aria-pressed={!collapsed}
          aria-controls="sidebar-drawer"
          onClick={toggleSidebar}
        >
          <ToggleIcon />
        </button>

        {/* Backdrop */}
        <div
          className={`sidebar-backdrop ${drawerOpen ? 'open' : ''}`}
          onClick={() => setCollapsed(true)}
        />

        {/* Drawer */}
        <aside
          id="sidebar-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`sidebar-drawer bg-light border-end ${drawerOpen ? 'open' : ''}`}
        >
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="m-0">🧮 Inventory</h5>
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label="Close navigation"
              aria-pressed={!collapsed}
              onClick={toggleSidebar}
            >
              <ToggleIcon />
            </button>
          </div>
          <div className="p-3">
            {Nav}
          </div>
        </aside>
      </>
    );
  }

  /* -------- Desktop/tablet: classic sidebar with width transition -------- */
  return (
    <div
      id="sidebar"
      className={`d-flex flex-column ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} bg-light p-3 vh-110 border-end`}
      style={{ width: collapsed ? '85px' : '250px', transition: 'width 0.4s' }}
      aria-label="Sidebar"
      aria-expanded={!collapsed}
    >
      {/* Toggle Button */}
      <button
        type="button"
        className="btn btn-outline-secondary mb-3 sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={!collapsed}
        aria-controls="sidebar"
      >
        <ToggleIcon />
      </button>

      {/* Title */}
      {!collapsed && <h5 className="mb-4">🧮 Inventory Dashboard</h5>}

      {/* Navigation Links */}
      {Nav}
    </div>
  );
};

export default Sidebar;