/**
 * Author: Võ Anh Ben - CE190709
 */

import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authenticate } from '../services/dataService.js';

/**
 * Trang Đăng nhập (LoginPage)
 * Giao diện tối giản, tập trung vào form đăng nhập, loại bỏ các banner và hình ảnh rườm rà.
 *
 * @param {Function} onLogin - Callback được gọi khi người dùng đăng nhập thành công
 */
export default function LoginPage({ onLogin }) {
  // State lưu tên đăng nhập và mật khẩu do người dùng nhập
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State lưu thông báo lỗi khi đăng nhập thất bại
  const [error, setError] = useState('');

  // State kiểm soát việc hiển thị mật khẩu dạng text hay ẩn (password)
  const [visible, setVisible] = useState(false);

  /**
   * Hàm xử lý khi người dùng nhấn nút Đăng nhập (submit form)
   * 1. Ngăn chặn reload trang mặc định của form
   * 2. Kiểm tra xem các ô nhập liệu có bị bỏ trống hay không
   * 3. Gọi hàm authenticate để kiểm tra thông tin tài khoản (Admin/Admin)
   * 4. Nếu đúng thì kích hoạt onLogin, nếu sai thì hiển thị lỗi
   */
  function submit(event) {
    event.preventDefault();

    // Kiểm tra không được để trống username hoặc password
    if (!username.trim() || !password.trim()) {
      setError('Enter your username and password.');
      return;
    }

    // Kiểm tra thông tin đăng nhập từ service
    const user = authenticate(username, password);
    if (!user) {
      setError('Incorrect username or password. Try Admin / Admin.');
      return;
    }

    // Đăng nhập thành công, chuyển thông tin user lên component cha App
    onLogin(user);
  }

  return (
    <main className="login-page">
      <div className="login-card">
        {/* Tiêu đề trang đăng nhập đơn giản, rõ ràng */}
        <div className="login-header">
          <h2>FUNews Management</h2>
          <p className="muted">Sign in to your workspace</p>
        </div>

        {/* Form đăng nhập */}
        <form noValidate onSubmit={submit}>
          {/* Ô nhập tên đăng nhập */}
          <div className="field">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              placeholder="Enter username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoFocus
            />
          </div>

          {/* Ô nhập mật khẩu có nút bật/tắt hiển thị */}
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                id="login-password"
                type={visible ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Hiển thị thông báo lỗi nếu có */}
          {error && (
            <p className="form-alert" role="alert">
              {error}
            </p>
          )}

          {/* Nút đăng nhập */}
          <button className="button button-primary login-submit" type="submit">
            <LogIn size={18} />
            Sign in
          </button>
        </form>

        {/* Thông tin tài khoản mẫu để chấm bài / demo */}
        <div className="demo-credential">
          <strong>Demo Account:</strong> Username: <code>Admin</code> / Password: <code>Admin</code>
        </div>
      </div>
    </main>
  );
}
