export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${status === 1 ? 'active' : 'inactive'}`}>
      <span />
      {status === 1 ? 'Active' : 'Inactive'}
    </span>
  );
}
