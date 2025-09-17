import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUser } from '../utils/token';
import './Sidebar.css';

function useMediaQuery(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    m.addEventListener?.('change', onChange) ?? m.addListener(onChange);
    return () => m.removeEventListener?.('change', onChange) ?? m.removeListener(onChange);
  }, [query]);

  return matches;
}

const Sidebar = ({ onCollapseChange, mobileOpen, onMobileClose }) => {
  const user = useUser();
  const location = useLocation();

  const isMobile = useMediaQuery('(max-width: 1024px)');
  const isTiny = useMediaQuery('(max-width: 640px)');

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar:collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [pinnedByUser, setPinnedByUser] = useState(false);

  useEffect(() => {
    if (!pinnedByUser) {
      setCollapsed(isMobile);
    }
  }, [isMobile, pinnedByUser]);

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (typeof onCollapseChange === 'function') {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  const toggleSidebar = () => {
    setPinnedByUser(true);
    setCollapsed(v => !v);
  };

  const drawerRef = useRef(null);
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const el = firstLinkRef.current || drawerRef.current?.querySelector('a, button');
    el?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onMobileClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, onMobileClose]);

  const Nav = useMemo(() => (
    <nav className="nav flex-column" aria-label="Primary">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          (isActive || location.pathname.startsWith('/overview') ? 'active nav-link' : 'nav-link')
        }
        ref={firstLinkRef}
      >
        🏠 {!collapsed && 'Overview'}
      </NavLink>
      <NavLink to="/products" className="nav-link">📦 {!collapsed && 'Products'}</NavLink>
      <NavLink to="/purchases" className="nav-link">📥 {!collapsed && 'Purchases'}</NavLink>
      <NavLink to="/sales" className="nav-link">💸 {!collapsed && 'Sales'}</NavLink>
      <NavLink to="/expenses" className="nav-link">🧾 {!collapsed && 'Expenses'}</NavLink>
      <NavLink to="/reports" className="nav-link">📊 {!collapsed && 'Reports'}</NavLink>
      <NavLink to="/settings" className="nav-link">⚙️ {!collapsed && 'Settings'}</NavLink>
      {user?.is_admin && (
        <NavLink to="/users" className="nav-link">👥 {!collapsed && 'Users'}</NavLink>
      )}
      <NavLink to="/logout" className="nav-link text-danger mt-4">🔓 {!collapsed && 'Logout'}</NavLink>
    </nav>
  ), [collapsed, user?.is_admin, location.pathname]);

  const ToggleIcon = () => (
    <span className="rot-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="green" strokeWidth="2" />
        <path d="M10 8L14 12L10 16" stroke="green" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  if (isTiny) {
    return (
      <>
        <aside
          id="sidebar-drawer"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`sidebar-drawer bg-light border-end ${mobileOpen ? 'open' : ''}`}
        >
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="m-0">🧮 Inventory</h5>
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label="Close navigation"
              onClick={onMobileClose}
            >
              <ToggleIcon />
            </button>
          </div>
          <div className="p-3">{Nav}</div>
        </aside>
      </>
    );
  }

  return (
    <div
      id="sidebar"
      className={`d-flex flex-column ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} bg-light p-3 vh-100 border-end`}
      style={{ width: collapsed ? '85px' : '250px', transition: 'width 0.4s' }}
      aria-label="Sidebar"
      aria-expanded={!collapsed}
    >
      <button
        type="button"
        className="btn btn-outline-secondary mb-3 sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <ToggleIcon />
      </button>

      {!collapsed && <h5 className="mb-4">🧮 Inventory Dashboard</h5>}
      {Nav}
    </div>
  );
};

export default Sidebar;