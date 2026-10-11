import {
  LayoutDashboard,
  Folder,
  Newspaper,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import Brand from './Brand.jsx';

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Category', icon: Folder },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Header({ page, displayName, onMenu }) {
  const label = menuItems.find((item) => item.id === page)?.label;
  return (
    <header className="workspace-header">
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={22} />
      </button>
      <div className="breadcrumb-line">
        Workspace <ChevronRight size={14} />
        <span>{label}</span>
      </div>
      <div className="header-user">
        <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{displayName}</strong>
          <small>Administrator</small>
        </div>
      </div>
    </header>
  );
}

export function Sidebar({ page, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {open && (
        <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <Brand compact />
          <button
            className="icon-button mobile-menu"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <p className="nav-caption">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'selected' : ''}`}
              aria-current={page === id ? 'page' : undefined}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="live-dot" />
            <strong>Your campus. Your stories.</strong>
            <p>A little clarity for every day in the newsroom.</p>
          </div>
          <button className="nav-item logout" onClick={onLogout}>
            <LogOut size={18} />
            Sign out
          </button>
          <small>FUNews Management System · 2026</small>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ page, onNavigate, onLogout, displayName, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="admin-shell">
      <Sidebar
        page={page}
        onNavigate={onNavigate}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="workspace">
        <Header page={page} displayName={displayName} onMenu={() => setMenuOpen(true)} />
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="workspace-footer">
          <span>Made for a connected university community.</span>
          <span>FUNews / Editorial workspace</span>
        </footer>
      </div>
    </div>
  );
}
