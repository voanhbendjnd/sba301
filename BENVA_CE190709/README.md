# Benva-CE190709 — FUNewsManagementSystem

Frontend quản trị tin tức trường đại học cho SBA301 Assignment 01, dùng **ReactJS + Vite**, mock authentication và localStorage. Project được đặt tên theo thông tin người dùng cung cấp: `Benva-CE190709`.

## Cài đặt và chạy

Yêu cầu Node.js **20.19+ hoặc 22.12+** và npm. Đã kiểm tra với Node 22.23.2 trên Windows.

```powershell
cd Benva-CE190709
npm install
npm run dev
```

Mở địa chỉ Vite in trong terminal (mặc định `http://localhost:5173`). Dừng bằng `Ctrl+C`. Nếu cổng bận: `npm run dev -- --port 5175`.

Đăng nhập: username **Admin**, password **Admin**. Có phân biệt hoa/thường; không tự động bỏ khoảng trắng của credential.

```powershell
npm run build
npm run preview
```

`build` tạo thư mục `dist`; `preview` kiểm tra bản build (mặc định cổng 4173). Không mở `index.html` trực tiếp bằng file explorer.

## Chức năng

- Login controlled inputs, validate rỗng/sai, xem/ẩn password; logout xóa session.
- Header, logo AI, Sidebar, nội dung chung; đủ Dashboard / Category / News / Users / Settings.
- Dashboard tính số bài viết, danh mục, người dùng từ dữ liệu hiện có; bài mới nhất và thao tác tạo bài nhanh.
- Category: CRUD + tìm theo tên, description, status Active/Inactive.
- News: CRUD + tìm title/content/tags; categoryId, createdBy, thời gian, tags; lọc category và status.
- Users: CRUD + tìm username, role 1 = Admin / 2 = Staff, status 1 = Active / 0 = Inactive. Password chỉ phục vụ dữ liệu mock, không hiển thị trong bảng.
- Create/Update bằng popup dialog; prefill, validation, Cancel, Reset; Delete chỉ thực hiện sau confirmation.
- Empty state, no-result state, clear filters, thông báo thành công; navigation dạng state, không reload document.
- Settings lưu display name/publication name; giao diện responsive, menu drawer trên mobile, label và native dialog hỗ trợ bàn phím.

## Quyết định đơn giản cho phần đề chưa rõ

1. Chỉ `Admin/Admin` đăng nhập. Role Staff được quản lý như dữ liệu, không triển khai phân quyền/login Staff ngoài core scope.
2. Dùng localStorage key `funews.data.v1` cho danh sách và Settings; sessionStorage key `funews.session.v1` chỉ lưu ID tài khoản mock, không lưu credential trong session.
3. Reload giữ login trong cùng tab và dữ liệu; trang quay về Dashboard. Logout giữ dữ liệu và xóa session. Phiên sessionStorage hết theo vòng đời tab/browser.
4. Category đang được News tham chiếu không được xóa; chuyển/xóa bài trước. Tương tự User đang là tác giả; không cascade delete.
5. `Admin/Admin` là bản ghi cố định để luôn demo được: không thay username/password/role/status hoặc xóa. CRUD đầy đủ trên các người dùng khác. Có thể sửa/xóa người dùng không có bài viết.
6. Category name và username unique sau trim/lowercase. Title/content/category là bắt buộc với News. Category inactive vẫn có thể được chọn: status chỉ là nhãn dữ liệu, đề không yêu cầu hạn chế này.
7. Không có template lớp trong workspace. Sử dụng **Bootstrap 5.3.3 Dashboard example** làm HTML/CSS template tham khảo và phân rã thành component; giữ source + MIT license ở `docs/template/`. CSS Bootstrap runtime dùng 5.3.8. Ghi rõ đây không phải template riêng của giảng viên.
8. Không có backend/database thật; data/service riêng giúp xác định nơi thay API trong bài sau. Không thêm JWT, pagination hoặc thư viện quản lý state.

## Cấu trúc

```text
src/
  App.jsx                  auth, navigation, shared data và event handlers
  components/              Brand, Header/Sidebar/AdminLayout, Modal, RecordForm, StatusBadge
  pages/                   Login, Dashboard, Management, Settings
  data/seed.js             dữ liệu mẫu và settings
  services/dataService.js   load/save, validation, CRUD immutable, search, mock login
  styles.css               styles và responsive
public/assets/             logo AI
public/fonts/              font local + giấy phép OFL
tests/data.test.js          unit tests Node
tests/e2e/app.spec.js       browser tests Playwright
docs/                      phân tích, thiết kế, test matrix, debug, AI log, hướng dẫn giải thích
```

## Kiểm thử và evidence

```powershell
npm test
npx playwright install chromium --no-shell
npm run test:e2e
```

Playwright tự chạy Vite tại `127.0.0.1:5174`, mỗi test dùng browser context riêng. Các test không làm đổi dữ liệu trên trình duyệt bạn đang dùng. Lần đầu cài Chromium cần internet. Dependency được khóa bằng `package-lock.json`; máy sạch có thể dùng `npm ci`.

Test mặc định dùng Chromium full với headless mode, nên không cần tải thêm headless shell. Nếu muốn dùng Microsoft Edge đã cài trên Windows: `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run test:e2e`.

- [Requirement matrix](docs/requirements.md): R01–R12, constraint và IPO.
- [Thiết kế](docs/design.md): component tree, data/state sketch, 6 quyết định thiết kế và ảnh hưởng khi đổi yêu cầu.
- [Test matrix](docs/test-matrix.md): 35 case trong PDF và case mở rộng; expected/actual/test tương ứng.
- [Debug log](docs/debug-log.md): lỗi quan sát thực tế, nguyên nhân, sửa và retest.
- [Hướng dẫn giải thích và luyện thay đổi](docs/code-guide.md): vị trí code và luồng event/state.
- [AI usage](docs/ai-usage.md): hỗ trợ thực tế và phần sinh viên cần tự kiểm chứng/điều chỉnh.
- `docs/evidence/`: screenshots và kết quả Playwright JSON; `verification.txt` ghi kết quả build/unit/browser.

## Giới hạn và quy định học thuật

Đây là bài demo chạy trong browser. Mock password được lưu trong dữ liệu localStorage, không phải authentication production. Người dùng có thể chỉnh storage bằng DevTools. Không dùng password thật. Không có API, đồng bộ giữa máy/tab hoặc deployment production.

PDF yêu cầu sinh viên tự phân tích, hiểu, kiểm thử, giải thích và thực hiện modification; mục 0.3/9.2 không cho phép nộp nguyên vẹn source AI mà không làm chủ. **Code của bản này có AI hỗ trợ triển khai; không được trình bày là hoàn toàn tự viết.** Hãy đọc/chỉnh sửa, tự chạy test, luyện thay đổi không dùng AI, xác nhận với quy định lớp trước khi nộp. Tài liệu hướng dẫn không thay thế interview và năng lực cá nhân. Không giả lập Git history, điểm tự chấm hoặc xác nhận năng lực của sinh viên.

## Nguồn tham khảo và assets

- Yêu cầu: `../SBA301_Assignment01_Student_Guide.pdf` (20 trang).
- [Vite Guide](https://vite.dev/guide/) — cài đặt, dev/build/preview.
- [React: Updating arrays in state](https://react.dev/learn/updating-arrays-in-state) — spread/map/filter immutable.
- [Playwright web server](https://playwright.dev/docs/test-webserver) — tự chạy dev server để test browser.
- [Bootstrap Dashboard template 5.3.3](https://github.com/twbs/bootstrap/tree/v5.3.3/site/content/docs/5.3/examples/dashboard) — bố cục HTML/CSS, MIT license trong `docs/template/LICENSE`.
- [Lucide](https://lucide.dev/) — icon React, ISC license trong dependency.
- [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans), [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope) — font local và OFL trong `public/fonts`.
- Logo `public/assets/funews-logo.png`: tạo bằng built-in imagegen; prompt và provenance trong AI log.

Không cần gửi `node_modules`, `dist` hoặc `test-results` khi nộp source; giữ `package-lock.json`, assets, docs, tests. Screenshot/video/GitHub và hạn nộp riêng của lớp cần làm theo giảng viên.
