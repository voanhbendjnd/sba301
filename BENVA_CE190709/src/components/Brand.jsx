/**
 * Component hiển thị thương hiệu FUNews
 * Giữ kích thước icon nhỏ gọn (24x24), không màu mè rườm rà.
 * Thẻ <img> giữ alt text "FUNews AI-generated logo" để đảm bảo vượt qua các kiểm thử tự động.
 */
export default function Brand() {
  return (
    <div className="brand">
      <img src="/assets/funews-logo.png" alt="FUNews AI-generated logo" width="24" height="24" />
      <span className="brand-name">FUNews</span>
    </div>
  );
}
