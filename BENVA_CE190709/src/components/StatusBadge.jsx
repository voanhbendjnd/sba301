/**
 * Component hiển thị huy hiệu trạng thái (StatusBadge)
 * - status = 1: Active (Hoạt động - màu xanh lá nhẹ)
 * - status = 0: Inactive (Không hoạt động - màu xám)
 *
 * @param {number} status - Mã trạng thái (0 hoặc 1)
 */
export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status === 1 ? 'active' : 'inactive'}`}>
      <span className="status-dot" />
      {status === 1 ? 'Active' : 'Inactive'}
    </span>
  );
}
