/**
 * Author: Võ Anh Ben - CE190709
 */

import { createSeed } from '../data/seed.js';

// Khóa lưu trữ dữ liệu chính trong LocalStorage
export const STORAGE_KEY = 'funews.data.v1';

// Khóa lưu thông tin phiên đăng nhập trong SessionStorage
export const SESSION_KEY = 'funews.session.v1';

/**
 * Hàm chuẩn hóa chuỗi: cắt khoảng trắng 2 đầu và chuyển về chữ thường
 * Giúp so sánh không phân biệt hoa/thường và khoảng trắng thừa
 *
 * @param {*} value - Giá trị cần chuẩn hóa
 * @returns {string} Chuỗi sau khi chuẩn hóa
 */
export const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/**
 * Hàm kiểm tra xem một giá trị có phải là chuỗi không rỗng hay không
 *
 * @param {*} value - Giá trị cần kiểm tra
 * @returns {boolean} True nếu là chuỗi có ký tự (không chỉ toàn khoảng trắng)
 */
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * Hàm kiểm tra trạng thái hợp lệ (chỉ chấp nhận 0 hoặc 1)
 *
 * @param {*} value - Giá trị cần kiểm tra
 * @returns {boolean} True nếu là 0 hoặc 1
 */
const validStatus = (value) => value === 0 || value === 1;

/**
 * Hàm kiểm tra tính hợp lệ toàn vẹn của cấu trúc dữ liệu lưu trong storage
 * Kiểm tra xem có đủ mảng categories, news, users không, các ID có duy nhất không,
 * và các ràng buộc khóa ngoại có thỏa mãn không.
 *
 * @param {Object} data - Đối tượng dữ liệu cần kiểm tra
 * @returns {boolean} True nếu cấu trúc dữ liệu hợp lệ
 */
export function isValidData(data) {
  // 1. Phải có đủ 3 mảng chính: categories, news, users
  if (!data || !['categories', 'news', 'users'].every((key) => Array.isArray(data[key])))
    return false;

  // 2. Mỗi phần tử trong từng mảng phải có id duy nhất và không rỗng
  for (const key of ['categories', 'news', 'users']) {
    if (
      data[key].some((item) => !item || !hasText(item.id)) ||
      new Set(data[key].map((item) => item.id)).size !== data[key].length
    )
      return false;
  }

  // 3. Kiểm tra tính hợp lệ của mảng categories (tên không rỗng, status 0 hoặc 1, tên không trùng)
  if (
    data.categories.some(
      (item) =>
        !hasText(item.name) ||
        (item.description !== undefined && typeof item.description !== 'string') ||
        !validStatus(item.status),
    )
  )
    return false;
  if (new Set(data.categories.map((item) => normalize(item.name))).size !== data.categories.length)
    return false;

  // 4. Kiểm tra tính hợp lệ của mảng users (username, password, role 1 hoặc 2, status 0 hoặc 1)
  if (
    data.users.some(
      (item) =>
        !hasText(item.username) ||
        !hasText(item.password) ||
        ![1, 2].includes(item.role) ||
        !validStatus(item.status),
    )
  )
    return false;
  if (new Set(data.users.map((item) => normalize(item.username))).size !== data.users.length)
    return false;

  // 5. Bắt buộc phải có tài khoản demo Admin/Admin cố định
  if (
    !data.users.some(
      (item) =>
        item.id === 'user-admin' &&
        item.username === 'Admin' &&
        item.password === 'Admin' &&
        item.role === 1 &&
        item.status === 1,
    )
  )
    return false;

  // 6. Kiểm tra tính hợp lệ của mảng news (tiêu đề, nội dung, categoryId tồn tại, author tồn tại, tags...)
  if (
    data.news.some(
      (item) =>
        !hasText(item.title) ||
        !hasText(item.content) ||
        !validStatus(item.status) ||
        !data.categories.some((category) => category.id === item.categoryId) ||
        !data.users.some((user) => user.id === item.createdBy) ||
        !Array.isArray(item.tags) ||
        item.tags.some((tag) => !hasText(tag)) ||
        !Number.isFinite(Date.parse(item.createdAt)),
    )
  )
    return false;

  // 7. Bắt buộc có thông tin settings
  return hasText(data.settings?.displayName) && hasText(data.settings?.publicationName);
}

/**
 * Hàm nạp dữ liệu từ localStorage của trình duyệt
 * Nếu không có dữ liệu hoặc dữ liệu bị hỏng/không hợp lệ, sẽ tự động nạp dữ liệu mẫu ban đầu (seed)
 *
 * @param {Storage} storage - Đối tượng localStorage
 * @returns {{ data: Object, warning: string }} Đối tượng dữ liệu và cảnh báo (nếu có)
 */
export function loadData(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    // Nếu chưa có dữ liệu lần nào -> nạp seed data mặc định
    if (!raw) return { data: createSeed(), warning: '' };

    const data = JSON.parse(raw);
    // Nếu dữ liệu bị sai cấu trúc -> ném lỗi để nhảy vào catch
    if (!isValidData(data)) throw new Error('Invalid stored data');

    return { data, warning: '' };
  } catch {
    // Phục hồi an toàn bằng cách nạp lại dữ liệu mẫu nếu có lỗi
    return {
      data: createSeed(),
      warning: 'Saved data could not be read. Demo data has been loaded.',
    };
  }
}

/**
 * Hàm lưu toàn bộ dữ liệu vào localStorage dưới dạng chuỗi JSON
 *
 * @param {Storage} storage - Đối tượng localStorage
 * @param {Object} data - Toàn bộ dữ liệu của ứng dụng
 * @returns {string} Chuỗi cảnh báo lỗi nếu lưu thất bại (storage đầy/bị chặn), hoặc rỗng nếu thành công
 */
export function saveData(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return '';
  } catch {
    return 'Browser storage is unavailable or full. Changes remain available in this tab only.';
  }
}

/**
 * Hàm kiểm tra tính hợp lệ của dữ liệu nhập trên form trước khi lưu (Validation)
 *
 * @param {string} entity - Loại thực thể ('categories' | 'news' | 'users')
 * @param {Object} form - Dữ liệu biểu mẫu người dùng nhập
 * @param {Object} data - Dữ liệu hiện tại trong hệ thống
 * @param {string|null} editingId - ID bản ghi đang sửa (để tránh tự so sánh trùng với chính nó)
 * @returns {Object} Đối tượng chứa danh sách lỗi { fieldName: errorMessage }
 */
export function validateRecord(entity, form, data, editingId = null) {
  const errors = {};

  // Kiểm tra trạng thái chung
  if (!validStatus(Number(form.status))) errors.status = 'Choose a valid status.';

  // Kiểm tra cho Danh mục (Categories)
  if (entity === 'categories') {
    if (!hasText(form.name)) errors.name = 'Category name is required.';
    else if (
      data.categories.some(
        (item) => item.id !== editingId && normalize(item.name) === normalize(form.name),
      )
    )
      errors.name = 'A category with this name already exists.';
  }

  // Kiểm tra cho Tin tức (News)
  if (entity === 'news') {
    if (!hasText(form.title)) errors.title = 'Title is required.';
    if (!hasText(form.content)) errors.content = 'Content is required.';
    if (!data.categories.some((item) => item.id === form.categoryId))
      errors.categoryId = 'Choose an existing category.';
  }

  // Kiểm tra cho Người dùng (Users)
  if (entity === 'users') {
    if (!hasText(form.username)) errors.username = 'Username is required.';
    else if (
      data.users.some(
        (item) => item.id !== editingId && normalize(item.username) === normalize(form.username),
      )
    )
      errors.username = 'This username is already in use.';

    if (!hasText(form.password)) errors.password = 'Mock password is required.';
    if (![1, 2].includes(Number(form.role))) errors.role = 'Choose Admin or Staff.';

    // Bảo vệ tài khoản Admin cố định không cho phép sửa đổi thông tin
    if (
      editingId === 'user-admin' &&
      (form.username !== 'Admin' ||
        form.password !== 'Admin' ||
        Number(form.role) !== 1 ||
        Number(form.status) !== 1)
    )
      errors.username = 'The required Admin/Admin demo account cannot be changed.';
  }

  return errors;
}

/**
 * Hàm lưu bản ghi (Tạo mới nếu editingId là null, Cập nhật nếu editingId đã tồn tại)
 * Sử dụng nguyên lý Immutability (không làm thay đổi trực tiếp dữ liệu cũ mà trả về bản copy mới)
 *
 * @param {Object} data - Dữ liệu gốc
 * @param {string} entity - Loại thực thể ('categories' | 'news' | 'users')
 * @param {Object} form - Dữ liệu biểu mẫu
 * @param {string|null} editingId - ID bản ghi đang sửa
 * @returns {{ data: Object, errors: Object }} Dữ liệu mới và lỗi nếu có
 */
export function saveRecord(data, entity, form, editingId = null) {
  // Validate trước khi lưu
  const errors = validateRecord(entity, form, data, editingId);
  if (Object.keys(errors).length) return { data, errors };

  // Tìm bản ghi cũ nếu đang trong chế độ chỉnh sửa
  const existing = data[entity].find((item) => item.id === editingId);
  if (editingId && !existing) return { data, errors: { form: 'This record no longer exists.' } };

  // Tạo đối tượng bản ghi với id mới (hoặc giữ id cũ)
  const record = { id: existing?.id ?? crypto.randomUUID(), status: Number(form.status) };

  // Gán các trường dữ liệu tùy theo loại thực thể
  if (entity === 'categories')
    Object.assign(record, {
      name: form.name.trim(),
      description: String(form.description ?? '').trim(),
    });

  if (entity === 'users')
    Object.assign(record, {
      username: form.username.trim(),
      password: form.password,
      role: Number(form.role),
    });

  if (entity === 'news')
    Object.assign(record, {
      title: form.title.trim(),
      content: form.content.trim(),
      categoryId: form.categoryId,
      createdBy: existing?.createdBy ?? 'user-admin',
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      tags: [
        ...new Set(
          String(form.tags ?? '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ],
    });

  // Cập nhật danh sách một cách bất biến (immutable)
  const list = existing
    ? data[entity].map((item) => (item.id === editingId ? record : item))
    : [...data[entity], record];

  return { data: { ...data, [entity]: list }, errors: {} };
}

/**
 * Hàm kiểm tra lý do không cho phép xóa bản ghi (Kiểm tra ràng buộc khóa ngoại / bảo vệ tài khoản)
 *
 * @param {Object} data - Dữ liệu hệ thống
 * @param {string} entity - Loại thực thể
 * @param {string} id - ID bản ghi muốn xóa
 * @returns {string} Chuỗi giải thích lý do chặn xóa, hoặc rỗng nếu được phép xóa
 */
export function deletionReason(data, entity, id) {
  // 1. Nếu là Category: không cho xóa nếu có bài viết đang thuộc danh mục này
  if (entity === 'categories' && data.news.some((item) => item.categoryId === id))
    return 'This category is used by news articles. Reassign or delete those articles first.';

  // 2. Nếu là User: không cho xóa tài khoản demo Admin/Admin
  if (entity === 'users' && id === 'user-admin')
    return 'The required Admin/Admin demo account cannot be deleted.';

  // 3. Nếu là User: không cho xóa người dùng đã từng viết bài báo trong hệ thống
  if (entity === 'users' && data.news.some((item) => item.createdBy === id))
    return 'This user is an article author. Delete their articles before deleting the user.';

  return '';
}

/**
 * Hàm xóa bản ghi theo ID (áp dụng immutable filter)
 *
 * @param {Object} data - Dữ liệu hệ thống
 * @param {string} entity - Loại thực thể
 * @param {string} id - ID bản ghi cần xóa
 * @returns {{ data: Object, error: string }} Dữ liệu sau khi xóa và lỗi nếu có
 */
export function deleteRecord(data, entity, id) {
  const error = deletionReason(data, entity, id);
  return error
    ? { data, error }
    : { data: { ...data, [entity]: data[entity].filter((item) => item.id !== id) }, error: '' };
}

/**
 * Hàm tìm kiếm và lọc bản ghi
 *
 * @param {Array} list - Danh sách mảng gốc
 * @param {string} entity - Loại thực thể
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {string} status - Bộ lọc trạng thái ('all' | '1' | '0')
 * @param {string} categoryId - Bộ lọc danh mục ('all' | categoryId)
 * @returns {Array} Danh sách bản ghi thỏa mãn điều kiện
 */
export function searchRecords(list, entity, keyword, status = 'all', categoryId = 'all') {
  const query = normalize(keyword);

  return list.filter((item) => {
    // Xác định nội dung văn bản dùng để tìm kiếm
    const text =
      entity === 'categories'
        ? item.name
        : entity === 'users'
          ? item.username
          : `${item.title} ${item.content} ${(item.tags ?? []).join(' ')}`;

    // Kiểm tra từ khóa, trạng thái và danh mục
    return (
      normalize(text).includes(query) &&
      (status === 'all' || item.status === Number(status)) &&
      (entity !== 'news' || categoryId === 'all' || item.categoryId === categoryId)
    );
  });
}

/**
 * Hàm xác thực đăng nhập người dùng (Mock authentication theo yêu cầu đề bài)
 * Chỉ chấp nhận tài khoản đúng chính xác: Username 'Admin' và Password 'Admin'
 *
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Object|null} Thông tin người dùng nếu đúng, hoặc null nếu sai
 */
export function authenticate(username, password) {
  return username === 'Admin' && password === 'Admin'
    ? { id: 'user-admin', username: 'Admin', role: 1 }
    : null;
}
