import { createSeed } from '../data/seed.js';

export const STORAGE_KEY = 'funews.data.v1';
export const SESSION_KEY = 'funews.session.v1';
export const normalize = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const validStatus = (value) => value === 0 || value === 1;

export function isValidData(data) {
  if (!data || !['categories', 'news', 'users'].every((key) => Array.isArray(data[key])))
    return false;
  for (const key of ['categories', 'news', 'users']) {
    if (
      data[key].some((item) => !item || !hasText(item.id)) ||
      new Set(data[key].map((item) => item.id)).size !== data[key].length
    )
      return false;
  }
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
  return hasText(data.settings?.displayName) && hasText(data.settings?.publicationName);
}

export function loadData(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { data: createSeed(), warning: '' };
    const data = JSON.parse(raw);
    if (!isValidData(data)) throw new Error('Invalid stored data');
    return { data, warning: '' };
  } catch {
    return {
      data: createSeed(),
      warning: 'Saved data could not be read. Demo data has been loaded.',
    };
  }
}

export function saveData(storage, data) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return '';
  } catch {
    return 'Browser storage is unavailable or full. Changes remain available in this tab only.';
  }
}

export function validateRecord(entity, form, data, editingId = null) {
  const errors = {};
  if (!validStatus(Number(form.status))) errors.status = 'Choose a valid status.';
  if (entity === 'categories') {
    if (!hasText(form.name)) errors.name = 'Category name is required.';
    else if (
      data.categories.some(
        (item) => item.id !== editingId && normalize(item.name) === normalize(form.name),
      )
    )
      errors.name = 'A category with this name already exists.';
  }
  if (entity === 'news') {
    if (!hasText(form.title)) errors.title = 'Title is required.';
    if (!hasText(form.content)) errors.content = 'Content is required.';
    if (!data.categories.some((item) => item.id === form.categoryId))
      errors.categoryId = 'Choose an existing category.';
  }
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

export function saveRecord(data, entity, form, editingId = null) {
  const errors = validateRecord(entity, form, data, editingId);
  if (Object.keys(errors).length) return { data, errors };
  const existing = data[entity].find((item) => item.id === editingId);
  if (editingId && !existing) return { data, errors: { form: 'This record no longer exists.' } };
  const record = { id: existing?.id ?? crypto.randomUUID(), status: Number(form.status) };
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
  const list = existing
    ? data[entity].map((item) => (item.id === editingId ? record : item))
    : [...data[entity], record];
  return { data: { ...data, [entity]: list }, errors: {} };
}

export function deletionReason(data, entity, id) {
  if (entity === 'categories' && data.news.some((item) => item.categoryId === id))
    return 'This category is used by news articles. Reassign or delete those articles first.';
  if (entity === 'users' && id === 'user-admin')
    return 'The required Admin/Admin demo account cannot be deleted.';
  if (entity === 'users' && data.news.some((item) => item.createdBy === id))
    return 'This user is an article author. Delete their articles before deleting the user.';
  return '';
}

export function deleteRecord(data, entity, id) {
  const error = deletionReason(data, entity, id);
  return error
    ? { data, error }
    : { data: { ...data, [entity]: data[entity].filter((item) => item.id !== id) }, error: '' };
}

export function searchRecords(list, entity, keyword, status = 'all', categoryId = 'all') {
  const query = normalize(keyword);
  return list.filter((item) => {
    const text =
      entity === 'categories'
        ? item.name
        : entity === 'users'
          ? item.username
          : `${item.title} ${item.content} ${(item.tags ?? []).join(' ')}`;
    return (
      normalize(text).includes(query) &&
      (status === 'all' || item.status === Number(status)) &&
      (entity !== 'news' || categoryId === 'all' || item.categoryId === categoryId)
    );
  });
}

// Authentication is intentionally limited to the exact mock credential required by the assignment.
export function authenticate(username, password) {
  return username === 'Admin' && password === 'Admin'
    ? { id: 'user-admin', username: 'Admin', role: 1 }
    : null;
}
