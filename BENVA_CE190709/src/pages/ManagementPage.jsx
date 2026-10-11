import { useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Folder,
  Newspaper,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import RecordForm from '../components/RecordForm.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { searchRecords, deletionReason } from '../services/dataService.js';
import { formatDate } from './DashboardPage.jsx';

const config = {
  categories: {
    title: 'Category',
    plural: 'categories',
    singular: 'category',
    description: 'Give every story a place to belong.',
    icon: Folder,
  },
  news: {
    title: 'News',
    plural: 'articles',
    singular: 'article',
    description: 'Create, refine and manage your campus stories.',
    icon: Newspaper,
  },
  users: {
    title: 'Users',
    plural: 'users',
    singular: 'user',
    description: 'The people behind your university newsroom.',
    icon: Users,
  },
};

export default function ManagementPage({ entity, data, onSave, onDelete, initialCreate = false }) {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [dialog, setDialog] = useState(initialCreate ? { selected: null } : null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const { title, plural, singular, description, icon: Icon } = config[entity];
  const list = data[entity];
  const displayed = searchRecords(list, entity, keyword, status, category);
  const reason = deleting ? deletionReason(data, entity, deleting.id) : '';
  const recordName = (item) => item.name ?? item.title ?? item.username;
  function clearFilters() {
    setKeyword('');
    setStatus('all');
    setCategory('all');
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MANAGE YOUR WORKSPACE</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="button button-primary" onClick={() => setDialog({ selected: null })}>
          <Plus size={18} />
          Create {singular}
        </button>
      </div>
      <section className="panel">
        <div className="management-toolbar">
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
          <div className="filter-controls">
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
                  <td>
                    <div className="article-cell">
                      <span className={`article-symbol ${entity}`}>
                        <Icon size={19} />
                      </span>
                      <div>
                        <strong>{recordName(item)}</strong>
                        {entity === 'news' && (
                          <small>
                            {data.users.find((user) => user.id === item.createdBy)?.username}
                            {item.tags.length > 0 && ` · ${item.tags.join(', ')}`}
                          </small>
                        )}
                        {entity === 'users' && (
                          <small>
                            {item.id === 'user-admin' ? 'Default administrator' : 'Newsroom member'}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>
                  {entity === 'categories' && (
                    <td className="description-cell">{item.description || '—'}</td>
                  )}
                  {entity === 'news' && (
                    <>
                      <td>
                        {
                          data.categories.find(
                            (itemCategory) => itemCategory.id === item.categoryId,
                          )?.name
                        }
                      </td>
                      <td className="date-cell">{formatDate(item.createdAt)}</td>
                    </>
                  )}
                  {entity === 'users' && (
                    <td>
                      <span className={`role-badge ${item.role === 1 ? 'admin' : ''}`}>
                        {item.role === 1 ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                  )}
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
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
          {!displayed.length && (
            <div className="empty-state">
              <Icon size={36} />
              <h3>{list.length ? 'No results found' : `No ${plural} yet`}</h3>
              <p>
                {list.length
                  ? 'Try another search or clear your filters.'
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
        <div className="panel-footer">
          <span>
            Showing {displayed.length} of {list.length} {plural}
          </span>
          <span>
            <span className="live-dot" />
            Your newsroom, organised
          </span>
        </div>
      </section>
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
      {deleting && (
        <Modal title={`Delete ${singular}?`} onClose={() => setDeleting(null)}>
          <div className="dialog-body">
            <div className="delete-symbol">
              <AlertTriangle size={26} />
            </div>
            <p>
              You're about to delete <strong>{recordName(deleting)}</strong>. This action cannot be
              undone.
            </p>
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
