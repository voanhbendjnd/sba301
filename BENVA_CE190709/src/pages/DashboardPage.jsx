/**
 * Author: Võ Anh Ben - CE190709
 */

import { Newspaper, Folder, Users, Plus, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';

/**
 * Hàm định dạng ngày tháng theo múi giờ Việt Nam (ngày/tháng/năm)
 *
 * @param {string} value - Chuỗi thời gian chuẩn ISO
 * @returns {string} Chuỗi ngày tháng đã định dạng (ví dụ: "27 Oct 2026")
 */
export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));

/**
 * Trang Tổng quan (DashboardPage)
 * Hiển thị số liệu thống kê nhanh và 5 bài viết mới nhất.
 * Đã loại bỏ banner quảng bá và hiệu ứng hoa mỹ dư thừa.
 *
 * @param {Object} data - Dữ liệu tổng thể của ứng dụng (news, categories, users, settings)
 * @param {Function} onNavigate - Hàm điều hướng sang các trang quản trị khác
 * @param {Function} onCreateNews - Hàm mở nhanh form tạo bài viết mới
 */
export default function DashboardPage({ data, onNavigate, onCreateNews }) {
  // Lấy ra tối đa 5 bài viết mới nhất (sắp xếp giảm dần theo thời gian tạo createdAt)
  const recent = [...data.news]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Đếm số lượng bài viết đang ở trạng thái Hoạt động (status = 1)
  const active = data.news.filter((item) => item.status === 1).length;

  // Dữ liệu cho 3 thẻ thống kê tổng quan
  const stats = [
    {
      label: 'Total articles',
      value: data.news.length,
      detail: `${active} active articles`,
      icon: Newspaper,
      page: 'news',
    },
    {
      label: 'Categories',
      value: data.categories.length,
      detail: `${data.categories.filter((item) => item.status === 1).length} active categories`,
      icon: Folder,
      page: 'categories',
    },
    {
      label: 'Team members',
      value: data.users.length,
      detail: `${data.users.filter((item) => item.role === 2).length} staff members`,
      icon: Users,
      page: 'users',
    },
  ];

  return (
    <>
      {/* Tiêu đề trang Dashboard và nút Tạo bài viết nhanh */}
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Overview of your newsroom</p>
        </div>
        <button className="button button-primary" onClick={onCreateNews}>
          <Plus size={18} />
          Create article
        </button>
      </div>

      {/* Thông tin ấn phẩm: Thiết kế gọn gàng, loại bỏ banner đồ họa to và ngôi sao lấp lánh */}
      <div className="welcome-banner">
        <span>
          Publication: <strong>{data.settings.publicationName}</strong>
        </span>
      </div>

      {/* Lưới 3 thẻ thống kê số liệu */}
      <section className="stats-grid" aria-label="Newsroom statistics">
        {stats.map(({ label, value, detail, icon: Icon, page }) => (
          <button className="stat-card" key={page} onClick={() => onNavigate(page)}>
            <div className="stat-top">
              <span className="stat-label">{label}</span>
              <Icon size={20} className="stat-icon" />
            </div>
            <div className="stat-number">{value}</div>
            <p className="stat-detail">{detail}</p>
          </button>
        ))}
      </section>

      {/* Bảng danh sách 5 bài viết mới nhất */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Latest articles</h2>
            <p className="muted">Most recently created stories</p>
          </div>
          <button className="button button-subtle" onClick={() => onNavigate('news')}>
            View all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  {/* Cột tiêu đề bài viết và tên tác giả */}
                  <td>
                    <div className="article-cell">
                      <div>
                        <strong>{item.title}</strong>
                        <small className="muted">
                          :{' '}
                          {data.users.find((user) => user.id === item.createdBy)?.username ||
                            'Unknown'}
                        </small>
                      </div>
                    </div>
                  </td>
                  {/* Cột danh mục */}
                  <td>
                    {data.categories.find((category) => category.id === item.categoryId)?.name ||
                      'N/A'}
                  </td>
                  {/* Cột trạng thái */}
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  {/* Cột ngày tạo */}
                  <td className="date-cell">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hiển thị khi chưa có bài viết nào */}
          {!recent.length && (
            <div className="empty-state">
              <h3>Your next story starts here</h3>
              <p>Create your first article to get started.</p>
            </div>
          )}
        </div>

        {/* Chân bảng hiển thị tổng kết trạng thái */}
        <div className="panel-footer">
          <span>
            {active} active · {data.news.length - active} inactive
          </span>
        </div>
      </section>
    </>
  );
}
