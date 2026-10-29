/**
 * Author: Võ Anh Ben - CE190709
 */

import { useState } from 'react';
import { Save } from 'lucide-react';

/**
 * Trang Cài đặt (SettingsPage)
 * Cho phép chỉnh sửa Tên hiển thị (Display name) và Tên ấn phẩm (Publication name).
 * Dữ liệu được lưu trong state của App và đồng bộ vào localStorage.
 *
 * @param {Object} settings - Cài đặt hiện tại { displayName, publicationName }
 * @param {Function} onSave - Callback lưu cài đặt mới
 */
export default function SettingsPage({ settings, onSave }) {
  // State form lưu các giá trị đang chỉnh sửa
  const [form, setForm] = useState({ ...settings });

  // State lưu thông báo lỗi khi xác thực dữ liệu
  const [error, setError] = useState('');

  /**
   * Hàm xử lý khi lưu cấu hình
   * 1. Kiểm tra hai trường không được để trống
   * 2. Gọi hàm onSave truyền lên component cha
   */
  function submit(event) {
    event.preventDefault();
    if (!form.displayName.trim() || !form.publicationName.trim()) {
      setError('Display name and publication name are required.');
      return;
    }
    setError('');
    onSave({
      displayName: form.displayName.trim(),
      publicationName: form.publicationName.trim(),
    });
  }

  return (
    <>
      {/* Tiêu đề trang Cài đặt */}
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p className="muted">Manage your workspace preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Khung form chỉnh sửa cấu hình */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Preferences</h2>
              <p className="muted">These settings are saved locally in this browser.</p>
            </div>
          </div>

          <form noValidate onSubmit={submit}>
            <div className="settings-body">
              {/* Ô nhập tên hiển thị của người dùng */}
              <div className="field">
                <label htmlFor="display-name">Display name</label>
                <input
                  id="display-name"
                  value={form.displayName}
                  maxLength={60}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                />
              </div>

              {/* Ô nhập tên tòa soạn / ấn phẩm */}
              <div className="field">
                <label htmlFor="publication-name">Publication name</label>
                <input
                  id="publication-name"
                  value={form.publicationName}
                  maxLength={100}
                  onChange={(event) => setForm({ ...form, publicationName: event.target.value })}
                />
              </div>

              {/* Thông báo lỗi nếu có */}
              {error && (
                <p role="alert" className="form-alert">
                  {error}
                </p>
              )}

              {/* Nút lưu thay đổi */}
              <button className="button button-primary" type="submit">
                <Save size={16} />
                Save preferences
              </button>
            </div>
          </form>
        </section>

        {/* Khung thông tin hệ thống */}
        <aside className="panel settings-info">
          <h2>About this workspace</h2>
          <p className="muted">FUNews Management System - SBA301 Assignment 01</p>
          <dl className="info-dl">
            <dt>Account</dt>
            <dd>Admin</dd>
            <dt>Role</dt>
            <dd>Administrator</dd>
            <dt>Storage</dt>
            <dd>Browser LocalStorage</dd>
            <dt>Version</dt>
            <dd>1.0.0</dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
