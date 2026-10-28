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

/**
 * Danh sách các mục menu điều hướng trong thanh Sidebar
 * Mỗi mục gồm: id (trang tương ứng), label (tên hiển thị), icon (biểu tượng lucide)
 */
export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'categories', label: 'Category', icon: Folder },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Component thanh tiêu đề trên cùng (Header)
 * Hiển thị nút mở menu mobile, breadcrumb trang hiện tại và thông tin người dùng đang đăng nhập.
 *
 * @param {string} page - Mã trang hiện tại
 * @param {string} displayName - Tên hiển thị của quản trị viên
 * @param {Function} onMenu - Hàm mở menu trên thiết bị di động
 */
export function Header({ page, displayName, onMenu }) {
  const label = menuItems.find((item) => item.id === page)?.label;

  return (
    <header className="workspace-header">
      {/* Nút bật tắt menu cho giao diện điện thoại */}
      <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={20} />
      </button>

      {/* Đường dẫn định hướng (Breadcrumb) */}
      <div className="breadcrumb-line">
        <span>FUNews</span>
        <ChevronRight size={14} />
        <span className="current-page">{label}</span>
      </div>

      {/* Thông tin tài khoản người dùng góc phải */}
      <div className="header-user">
        <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <strong>{displayName}</strong>
          <small>Administrator</small>
        </div>
      </div>
    </header>
  );
}

/**
 * Component thanh điều hướng bên cạnh (Sidebar)
 * Chứa logo thương hiệu, danh sách trang chức năng và nút Đăng xuất.
 * Đã loại bỏ các banner ghi chú và khẩu hiệu dư thừa.
 *
 * @param {string} page - Mã trang đang được chọn
 * @param {Function} onNavigate - Hàm chuyển trang
 * @param {Function} onLogout - Hàm đăng xuất
 * @param {boolean} open - Trạng thái mở menu trên mobile
 * @param {Function} onClose - Hàm đóng menu trên mobile
 */
export function Sidebar({ page, onNavigate, onLogout, open, onClose }) {
  return (
    <>
      {/* Lớp nền mờ khi mở sidebar trên màn hình nhỏ */}
      {open && (
        <button className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose} />
      )}

      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        {/* Phần đầu sidebar: Logo và nút đóng trên mobile */}
        <div className="sidebar-brand">
          <Brand />
          <button
            className="icon-button mobile-menu"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Danh sách các nút điều hướng chính */}
        <nav aria-label="Main navigation" className="sidebar-nav">
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
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Phần cuối sidebar: Chỉ giữ nút Đăng xuất gọn gàng */}
        <div className="sidebar-bottom">
          <button className="nav-item logout" onClick={onLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Master Layout quản trị (AdminLayout)
 * Khung sườn chung kết hợp Sidebar bên trái, Header trên cùng và vùng hiển thị nội dung trang (main).
 *
 * @param {string} page - Mã trang hiện tại
 * @param {Function} onNavigate - Hàm điều hướng trang
 * @param {Function} onLogout - Hàm đăng xuất
 * @param {string} displayName - Tên quản trị viên
 * @param {ReactNode} children - Nội dung trang con
 */
export default function AdminLayout({ page, onNavigate, onLogout, displayName, children }) {
  // State quản lý việc mở/đóng Sidebar trên màn hình di động
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="admin-shell">
      {/* Thanh Sidebar điều hướng bên trái */}
      <Sidebar
        page={page}
        onNavigate={onNavigate}
        onLogout={onLogout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      {/* Vùng nội dung chính bên phải */}
      <div className="workspace">
        <Header page={page} displayName={displayName} onMenu={() => setMenuOpen(true)} />

        <main id="main-content" className="main-content">
          {children}
        </main>

        <footer className="workspace-footer">
          <span>FUNews Management System</span>
        </footer>
      </div>
    </div>
  );
}
