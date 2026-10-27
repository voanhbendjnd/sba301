import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import RecordForm from '../components/RecordForm.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { searchRecords, deletionReason } from '../services/dataService.js';
import { formatDate } from './DashboardPage.jsx';

/**
 * Cấu hình văn bản hiển thị cho từng loại thực thể (Categories, News, Users)
 */
const config = {
  categories: {
    title: 'Category',
    plural: 'categories',
    singular: 'category',
    description: 'Manage news categories and sections',
  },
  news: {
    title: 'News',
    plural: 'articles',
    singular: 'article',
    description: 'Create, edit and manage articles',
  },
  users: {
    title: 'Users',
    plural: 'users',
    singular: 'user',
    description: 'Manage system users and staff accounts',
  },
};

/**
 * Trang Quản lý dùng chung cho Category, News và Users (ManagementPage)
 * Cung cấp đầy đủ các thao tác: Tìm kiếm, Lọc, Thêm mới, Chỉnh sửa và Xóa.
 *
 * @param {string} entity - Loại thực thể đang quản lý ('categories' | 'news' | 'users')
 * @param {Object} data - Dữ liệu tổng thể từ App
 * @param {Function} onSave - Hàm lưu bản ghi (tạo mới hoặc cập nhật)
 * @param {Function} onDelete - Hàm xóa bản ghi
 * @param {boolean} initialCreate - Có tự động mở popup tạo mới ngay khi vào trang không
 */
export default function ManagementPage({ entity, data, onSave, onDelete, initialCreate = false }) {
  // State quản lý từ khóa tìm kiếm
  const [keyword, setKeyword] = useState('');

  // State quản lý bộ lọc trạng thái (all, 1 = Active, 0 = Inactive)
  const [status, setStatus] = useState('all');

  // State quản lý bộ lọc danh mục (chỉ áp dụng cho trang News)
  const [category, setCategory] = useState('all');

  // State quản lý popup Tạo/Sửa (null nếu đóng, { selected: null } nếu tạo mới, { selected: item } nếu sửa)
  const [dialog, setDialog] = useState(initialCreate ? { selected: null } : null);

  // State lưu bản ghi đang được chọn để yêu cầu xác nhận xóa
  const [deleting, setDeleting] = useState(null);

  // State lưu thông báo lỗi xóa nếu có
  const [deleteError, setDeleteError] = useState('');

  // Lấy các thông số cấu hình tương ứng với entity hiện tại
  const { title, plural, singular, description } = config[entity];

  // Danh sách gốc từ data
  const list = data[entity];

  // Danh sách sau khi áp dụng tìm kiếm và các bộ lọc
  const displayed = searchRecords(list, entity, keyword, status, category);

  // Kiểm tra lý do không cho phép xóa (ràng buộc khóa ngoại hoặc tài khoản cố định)
  const reason = deleting ? deletionReason(data, entity, deleting.id) : '';

  /**
   * Helper lấy tên hiển thị của bản ghi tùy theo thực thể
   * @param {Object} item - Bản ghi
   * @returns {string} Tên danh mục, tiêu đề bài viết hoặc tên người dùng
   */
  const recordName = (item) => item.name ?? item.title ?? item.username;

  /**
   * Hàm xóa tất cả bộ lọc về mặc định
   */
  function clearFilters() {
    setKeyword('');
    setStatus('all');
    setCategory('all');
  }

  return (
    <>
      {/* Tiêu đề trang quản lý và nút Tạo mới */}
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p className="muted">{description}</p>
        </div>
        <button className="button button-primary" onClick={() => setDialog({ selected: null })}>
          <Plus size={18} />
          Create {singular}
        </button>
      </div>

      <section className="panel">
        {/* Thanh công cụ: Ô tìm kiếm và các dropdown lọc */}
        <div className="management-toolbar">
          {/* Ô tìm kiếm từ khóa */}
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label={`Search ${plural}`}
              placeholder={`Search ${entity === 'news' ? 'title, content or tags' : entity === 'users' ? 'username' : 'category name'}…`}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            {keyword && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => setKeyword('')}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Các bộ lọc dropdown */}
          <div className="filter-controls">
            {/* Bộ lọc theo danh mục cho trang News */}
            {entity === 'news' && (
              <select
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">All categories</option>
                {data.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}

            {/* Bộ lọc theo trạng thái hoạt động */}
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </div>

        {/* Bảng hiển thị danh sách dữ liệu */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  {entity === 'categories'
                    ? 'Category name'
                    : entity === 'news'
                      ? 'Article'
                      : 'Username'}
                </th>
                {entity === 'categories' && <th>Description</th>}
                {entity === 'news' && (
                  <>
                    <th>Category</th>
                    <th>Created</th>
                  </>
                )}
                {entity === 'users' && <th>Role</th>}
                <th>Status</th>
                <th className="actions-heading">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((item) => (
                <tr key={item.id} data-testid="record-row">
                  {/* Cột thông tin chính */}
                  <td>
                    <div className="article-cell">
                      <div>
                        <strong>{recordName(item)}</strong>
                        {entity === 'news' && (
                          <small className="muted">
                            Author:{' '}
                            {data.users.find((user) => user.id === item.createdBy)?.username ||
                              'Unknown'}
                            {item.tags.length > 0 && ` · Tags: ${item.tags.join(', ')}`}
                          </small>
                        )}
                        {entity === 'users' && (
                          <small className="muted">
                            {item.id === 'user-admin' ? 'Default administrator' : 'User account'}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột mô tả cho danh mục */}
                  {entity === 'categories' && (
                    <td className="description-cell">{item.description || '—'}</td>
                  )}

                  {/* Các cột bổ sung cho tin tức */}
                  {entity === 'news' && (
                    <>
                      <td>
                        {data.categories.find((itemCategory) => itemCategory.id === item.categoryId)
                          ?.name || 'N/A'}
                      </td>
                      <td className="date-cell">{formatDate(item.createdAt)}</td>
                    </>
                  )}

                  {/* Cột vai trò cho người dùng */}
                  {entity === 'users' && (
                    <td>
                      <span className={`role-badge ${item.role === 1 ? 'admin' : ''}`}>
                        {item.role === 1 ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                  )}

                  {/* Cột trạng thái */}
                  <td>
                    <StatusBadge status={item.status} />
                  </td>

                  {/* Cột thao tác: Sửa và Xóa */}
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button"
                        aria-label={`Edit ${recordName(item)}`}
                        title="Edit"
                        onClick={() => setDialog({ selected: item })}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button danger-icon"
                        aria-label={`Delete ${recordName(item)}`}
                        title="Delete"
                        onClick={() => {
                          setDeleting(item);
                          setDeleteError('');
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Hiển thị khi danh sách trống hoặc không tìm thấy kết quả */}
          {!displayed.length && (
            <div className="empty-state">
              <h3>{list.length ? 'No results found' : `No ${plural} yet`}</h3>
              <p className="muted">
                {list.length
                  ? 'Try another search keyword or clear your filters.'
                  : `Create your first ${singular} to get started.`}
              </p>
              <button
                className="button button-outline"
                onClick={list.length ? clearFilters : () => setDialog({ selected: null })}
              >
                {list.length ? 'Clear filters' : `Create ${singular}`}
              </button>
            </div>
          )}
        </div>

        {/* Chân bảng: Thống kê số lượng bản ghi hiển thị */}
        <div className="panel-footer">
          <span>
            Showing {displayed.length} of {list.length} {plural}
          </span>
        </div>
      </section>

      {/* Modal biểu mẫu Tạo mới / Chỉnh sửa bản ghi */}
      {dialog && (
        <RecordForm
          key={dialog.selected?.id ?? 'create'}
          entity={entity}
          selected={dialog.selected}
          data={data}
          onClose={() => setDialog(null)}
          onSave={(form, id) => {
            const errors = onSave(entity, form, id);
            if (!Object.keys(errors).length) setDialog(null);
            return errors;
          }}
        />
      )}

      {/* Modal xác nhận xóa an toàn */}
      {deleting && (
        <Modal title={`Delete ${singular}?`} onClose={() => setDeleting(null)}>
          <div className="dialog-body">
            <div className="delete-symbol">
              <AlertTriangle size={24} />
            </div>
            <p>
              Are you sure you want to delete <strong>{recordName(deleting)}</strong>? This action
              cannot be undone.
            </p>
            {/* Hiển thị cảnh báo nếu không được phép xóa (ví dụ: bị ràng buộc dữ liệu) */}
            {(reason || deleteError) && (
              <p className="form-alert" role="alert">
                {reason || deleteError}
              </p>
            )}
          </div>
          <div className="dialog-actions end">
            <button className="button button-outline" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="button button-danger"
              disabled={Boolean(reason)}
              onClick={() => {
                const error = onDelete(entity, deleting.id);
                if (error) setDeleteError(error);
                else setDeleting(null);
              }}
            >
              Delete {singular}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
