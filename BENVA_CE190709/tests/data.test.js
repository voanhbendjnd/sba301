/**
 * Author: Võ Anh Ben - CE190709
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.js';
import {
  authenticate,
  isValidData,
  loadData,
  saveData,
  saveRecord,
  deleteRecord,
  searchRecords,
  STORAGE_KEY,
} from '../src/services/dataService.js';

const memoryStorage = () => {
  const map = new Map();
  return { getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) };
};

test('seed has unique IDs, valid relationships, roles and statuses', () =>
  assert.equal(isValidData(createSeed()), true));
test('only exact Admin/Admin authenticates; no password in the returned session', () => {
  assert.deepEqual(authenticate('Admin', 'Admin'), {
    id: 'user-admin',
    username: 'Admin',
    role: 1,
  });
  for (const credentials of [
    ['admin', 'Admin'],
    ['Admin', 'admin'],
    ['', ''],
    ['linh.editor', 'Demo123'],
  ])
    assert.equal(authenticate(...credentials), null);
});
test('first run hydrates the seed and valid data reloads without loss', () => {
  const storage = memoryStorage();
  const result = loadData(storage);
  assert.equal(result.warning, '');
  assert.equal(result.data.news.length, 4);
  result.data.categories[0].name = 'Changed';
  assert.equal(saveData(storage, result.data), '');
  assert.deepEqual(loadData(storage).data, result.data);
});
test('malformed JSON and invalid references recover with a warning', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  assert.ok(loadData(storage).warning);
  assert.ok(isValidData(loadData(storage).data));
  const bad = createSeed();
  bad.news[0].categoryId = 'missing';
  storage.setItem(STORAGE_KEY, JSON.stringify(bad));
  assert.ok(loadData(storage).warning);
});
test('storage exceptions return a recoverable warning', () => {
  const storage = {
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('quota');
    },
  };
  assert.ok(isValidData(loadData(storage).data));
  assert.ok(saveData(storage, createSeed()).includes('unavailable'));
});
test('semantically invalid stored data is rejected', () => {
  const variants = [
    (data) => {
      data.users[0].role = 2;
    },
    (data) => {
      data.categories[1].id = data.categories[0].id;
    },
    (data) => {
      data.categories[1].name = ' CAMPUS LIFE ';
    },
    (data) => {
      data.news[0].tags = [null];
    },
    (data) => {
      data.news[0].createdAt = 'not a date';
    },
    (data) => {
      data.users[1].username = 'admin';
    },
    (data) => {
      data.settings.displayName = ' ';
    },
    (data) => {
      data.categories[0] = null;
    },
  ];
  for (const mutate of variants) {
    const data = createSeed();
    mutate(data);
    assert.equal(isValidData(data), false);
  }
});
test('category create trims fields, generates an ID and does not mutate source', () => {
  const data = createSeed();
  const snapshot = structuredClone(data);
  const result = saveRecord(data, 'categories', {
    name: ' Sports ',
    description: ' Clubs ',
    status: '1',
  });
  assert.deepEqual(data, snapshot);
  assert.equal(result.data.categories.at(-1).name, 'Sports');
  assert.equal(result.data.categories.at(-1).description, 'Clubs');
  assert.equal(result.data.categories.at(-1).status, 1);
  assert.ok(result.data.categories.at(-1).id);
  assert.ok(isValidData(result.data));
});
test('whitespace-only fields and duplicates cannot be created', () => {
  const data = createSeed();
  assert.ok(saveRecord(data, 'categories', { name: '  ', status: 1 }).errors.name);
  assert.ok(saveRecord(data, 'categories', { name: ' CAMPUS LIFE ', status: 1 }).errors.name);
  assert.ok(
    saveRecord(data, 'users', { username: ' admin ', password: 'x', role: 2, status: 1 }).errors
      .username,
  );
});
test('update replaces the selected ID only, retains source and allows its own name', () => {
  const data = createSeed();
  const original = structuredClone(data);
  const result = saveRecord(
    data,
    'categories',
    { ...data.categories[2], name: 'Student events' },
    'cat-events',
  );
  assert.deepEqual(data, original);
  assert.equal(result.data.categories[2].name, 'Student events');
  assert.deepEqual(result.data.categories[0], data.categories[0]);
  assert.deepEqual(saveRecord(data, 'categories', data.categories[2], 'cat-events').errors, {});
  assert.ok(saveRecord(data, 'categories', { name: 'Missing', status: 1 }, 'missing').errors.form);
});
test('news requires title, content and an existing category', () => {
  const result = saveRecord(createSeed(), 'news', {
    title: ' ',
    content: '',
    categoryId: 'missing',
    status: 1,
  });
  assert.ok(result.errors.title);
  assert.ok(result.errors.content);
  assert.ok(result.errors.categoryId);
});
test('news creates tags, author and timestamp and edit retains authorship', () => {
  const data = createSeed();
  const result = saveRecord(data, 'news', {
    title: ' New ',
    content: ' A story ',
    categoryId: 'cat-campus',
    tags: ' campus, campus, news, ',
    status: '0',
  });
  const record = result.data.news.at(-1);
  assert.deepEqual(record.tags, ['campus', 'news']);
  assert.equal(record.createdBy, 'user-admin');
  assert.ok(Number.isFinite(Date.parse(record.createdAt)));
  assert.ok(isValidData(result.data));
  const existing = data.news[1];
  const edited = saveRecord(
    data,
    'news',
    { ...existing, title: 'Revised', tags: existing.tags.join(',') },
    existing.id,
  ).data.news[1];
  assert.equal(edited.createdBy, existing.createdBy);
  assert.equal(edited.createdAt, existing.createdAt);
});
test('valid user role/status are numbers and invalid domains are rejected', () => {
  const data = createSeed();
  const form = { username: 'editor', password: 'Mock123', role: '2', status: '0' };
  const result = saveRecord(data, 'users', form);
  assert.equal(result.data.users.at(-1).role, 2);
  assert.ok(isValidData(result.data));
  assert.ok(saveRecord(data, 'users', { ...form, role: 3, status: -1 }).errors.role);
  assert.ok(saveRecord(data, 'users', { ...form, role: 3, status: -1 }).errors.status);
});
test('category and author dependencies block deletion without mutation', () => {
  const data = createSeed();
  const snapshot = structuredClone(data);
  assert.ok(deleteRecord(data, 'categories', 'cat-campus').error);
  assert.ok(deleteRecord(data, 'users', 'user-linh').error);
  assert.deepEqual(data, snapshot);
});
test('fixed Admin/Admin cannot be deleted or changed', () => {
  const data = createSeed();
  assert.ok(deleteRecord(data, 'users', 'user-admin').error);
  for (const patch of [{ username: 'Root' }, { password: 'New' }, { role: 2 }, { status: 0 }])
    assert.ok(
      Object.keys(saveRecord(data, 'users', { ...data.users[0], ...patch }, 'user-admin').errors)
        .length,
    );
});
test('delete first, middle, last and only article uses ID without mutation', () => {
  for (const index of [0, 1, 3]) {
    const data = createSeed();
    const id = data.news[index].id;
    const result = deleteRecord(data, 'news', id);
    assert.equal(result.data.news.length, 3);
    assert.ok(!result.data.news.some((item) => item.id === id));
    assert.equal(data.news.length, 4);
  }
  const data = createSeed();
  data.news = [data.news[0]];
  assert.deepEqual(deleteRecord(data, 'news', data.news[0].id).data.news, []);
});
test('search trims and ignores case while preserving the original list', () => {
  const data = createSeed();
  const original = structuredClone(data);
  assert.equal(searchRecords(data.categories, 'categories', ' CAMPUS ').length, 1);
  assert.equal(searchRecords(data.users, 'users', ' LINH. ').length, 1);
  assert.equal(searchRecords(data.news, 'news', ' STUDENTS ').length, 4);
  assert.equal(searchRecords(data.news, 'news', 'zzzz').length, 0);
  assert.equal(searchRecords(data.news, 'news', '').length, 4);
  assert.deepEqual(data, original);
});
test('search combines keyword, category and status filters', () => {
  const data = createSeed();
  assert.equal(searchRecords(data.news, 'news', 'campus', '0', 'cat-campus').length, 1);
  assert.equal(searchRecords(data.news, 'news', 'campus', '1', 'cat-academic').length, 0);
  assert.equal(searchRecords(data.categories, 'categories', '', '0').length, 1);
});
test('empty arrays and missing searchable fields do not crash', () => {
  const data = createSeed();
  data.news = [];
  data.categories = [];
  assert.ok(isValidData(data));
  assert.deepEqual(searchRecords([], 'news', 'x'), []);
  assert.deepEqual(searchRecords([{ id: 'x' }], 'news', 'x'), []);
});
