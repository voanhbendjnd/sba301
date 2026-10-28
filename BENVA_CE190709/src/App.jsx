import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ManagementPage from './pages/ManagementPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import {
  loadData,
  saveData,
  saveRecord,
  deleteRecord,
  SESSION_KEY,
} from './services/dataService.js';

/**
 * Hàm lấy đối tượng localStorage của trình duyệt một cách an toàn
 * Bọc trong try-catch phòng trường hợp trình duyệt chặn cookie/storage
 *
 * @returns {Storage|null} Đối tượng window.localStorage hoặc null nếu bị chặn
 */
function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Hàm đọc phiên đăng nhập từ sessionStorage khi tải lại trang
 * Nếu trong sessionStorage có id 'user-admin', tự động khôi phục phiên đăng nhập
 *
 * @returns {Object|null} Thông tin người dùng đăng nhập hoặc null
 */
function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'user-admin'
      ? { id: 'user-admin', username: 'Admin', role: 1 }
      : null;
  } catch {
    return null;
  }
}

/**
 * Component gốc của ứng dụng (App)
 * Quản lý trạng thái toàn cục: dữ liệu, phiên đăng nhập, trang hiện tại, thông báo...
 */
export default function App() {
  // Khởi tạo và nạp dữ liệu ban đầu từ localStorage (hoặc seed data nếu chưa có)
  const [loaded] = useState(() => loadData(browserStorage()));
  const [data, setData] = useState(loaded.data);

  // State lưu người dùng đang đăng nhập (khôi phục từ sessionStorage nếu có)
  const [user, setUser] = useState(readSession);

  // State điều hướng trang hiện tại ('dashboard' | 'categories' | 'news' | 'users' | 'settings')
  const [page, setPage] = useState('dashboard');

  // Cờ mở nhanh popup tạo bài viết khi bấm nút từ Dashboard
  const [createNews, setCreateNews] = useState(false);

  // State cảnh báo lưu trữ (ví dụ khi storage đầy hoặc bị lỗi)
  const [warning, setWarning] = useState(loaded.warning);

  // State thông báo thành công (toast message)
  const [notice, setNotice] = useState('');

  /**
   * Effect: Tự động lưu dữ liệu vào localStorage mỗi khi state data thay đổi
   */
  useEffect(() => {
    const error = saveData(browserStorage(), data);
    if (error) setWarning(error);
  }, [data]);

  /**
   * Effect: Tự động tắt thông báo toast sau 4.5 giây
   */
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  /**
   * Hàm xử lý đăng nhập thành công
   * Lưu thông tin user vào state và lưu id vào sessionStorage
   *
   * @param {Object} currentUser - Thông tin tài khoản đăng nhập thành công
   */
  function login(currentUser) {
    setUser(currentUser);
    setPage('dashboard');
    try {
      sessionStorage.setItem(SESSION_KEY, currentUser.id);
    } catch {
      setWarning('Session storage is unavailable. Sign in again after a reload.');
    }
  }

  /**
   * Hàm xử lý đăng xuất
   * Xóa thông tin user khỏi state và xóa phiên khỏi sessionStorage
   */
  function logout() {
    setUser(null);
    setPage('dashboard');
    setCreateNews(false);
    setNotice('');
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Bỏ qua lỗi nếu storage không khả dụng */
    }
  }

  /**
   * Hàm chuyển đổi qua lại giữa các trang trong ứng dụng
   *
   * @param {string} nextPage - Tên trang đích muốn chuyển tới
   */
  function navigate(nextPage) {
    setPage(nextPage);
    setCreateNews(false);
  }

  /**
   * Hàm lưu bản ghi (Tạo mới nếu chưa có id, Cập nhật nếu đã có id)
   *
   * @param {string} entity - Loại thực thể ('categories' | 'news' | 'users')
   * @param {Object} form - Dữ liệu biểu mẫu
   * @param {string|null} id - ID của bản ghi (nếu đang chỉnh sửa)
   * @returns {Object} Đối tượng chứa danh sách lỗi (nếu có)
   */
  function save(entity, form, id) {
    const result = saveRecord(data, entity, form, id);
    if (!Object.keys(result.errors).length) {
      setData(result.data);
      const label = entity === 'news' ? 'Article' : entity === 'users' ? 'User' : 'Category';
      setNotice(`${label} ${id ? 'updated' : 'created'} successfully.`);
    }
    return result.errors;
  }

  /**
   * Hàm xóa bản ghi theo ID
   *
   * @param {string} entity - Loại thực thể
   * @param {string} id - ID bản ghi cần xóa
   * @returns {string} Thông báo lỗi nếu bị chặn (ví dụ ràng buộc dữ liệu)
   */
  function remove(entity, id) {
    const result = deleteRecord(data, entity, id);
    if (!result.error) {
      setData(result.data);
      setNotice('Record deleted successfully.');
    }
    return result.error;
  }

  // Nếu người dùng chưa đăng nhập, hiển thị trang Đăng nhập
  if (!user) {
    return (
      <>
        <LoginPage onLogin={login} />
        {warning && (
          <div className="login-storage-warning" role="alert">
            {warning}
          </div>
        )}
      </>
    );
  }

  // Khi đã đăng nhập, hiển thị giao diện quản trị AdminLayout
  return (
    <>
      {/* Liên kết hỗ trợ khả năng tiếp cận (Accessibility - phím Tab) */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <AdminLayout
        page={page}
        onNavigate={navigate}
        onLogout={logout}
        displayName={data.settings.displayName}
      >
        {/* Cảnh báo lưu trữ nếu có */}
        {warning && (
          <div className="storage-warning" role="alert">
            <span>{warning}</span>
            <button
              className="icon-button"
              aria-label="Dismiss storage warning"
              onClick={() => setWarning('')}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Trang Tổng quan (Dashboard) */}
        {page === 'dashboard' && (
          <DashboardPage
            data={data}
            onNavigate={navigate}
            onCreateNews={() => {
              setCreateNews(true);
              setPage('news');
            }}
          />
        )}

        {/* Các trang Quản lý (Categories, News, Users) */}
        {['categories', 'news', 'users'].includes(page) && (
          <ManagementPage
            key={page}
            entity={page}
            data={data}
            onSave={save}
            onDelete={remove}
            initialCreate={createNews}
          />
        )}

        {/* Trang Cài đặt (Settings) */}
        {page === 'settings' && (
          <SettingsPage
            settings={data.settings}
            onSave={(settings) => {
              setData({ ...data, settings });
              setNotice('Preferences saved successfully.');
            }}
          />
        )}
      </AdminLayout>

      {/* Thông báo dạng Toast hiển thị ở góc màn hình khi thao tác thành công */}
      {notice && (
        <div className="toast-message" role="status">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
