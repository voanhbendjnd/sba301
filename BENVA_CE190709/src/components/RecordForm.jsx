import { useState } from 'react';
import Modal from './Modal.jsx';
import { validateRecord } from '../services/dataService.js';

const defaults = {
  categories: { name: '', description: '', status: 1 },
  news: { title: '', content: '', categoryId: '', tags: '', status: 1 },
  users: { username: '', password: '', role: 2, status: 1 },
};
const names = { categories: 'category', news: 'article', users: 'user' };

export default function RecordForm({ entity, selected, data, onSave, onClose }) {
  const initial = selected
    ? { ...selected, tags: selected.tags?.join(', ') ?? '' }
    : { ...defaults[entity] };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const fixedAdmin = entity === 'users' && selected?.id === 'user-admin';
  const change = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  function field(name, label, options = {}) {
    const { multiline, type = 'text', choices, ...rest } = options;
    const props = {
      id: `record-${name}`,
      name,
      value: form[name] ?? '',
      onChange: change,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby': errors[name] ? `error-${name}` : undefined,
      ...rest,
    };
    return (
      <div className="field">
        <label htmlFor={props.id}>{label}</label>
        {choices ? (
          <select {...props}>
            {choices.map(({ value, label: text }) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea {...props} rows={name === 'content' ? 6 : 3} />
        ) : (
          <input {...props} type={type} />
        )}
        {errors[name] && (
          <small className="field-error" id={`error-${name}`}>
            {errors[name]}
          </small>
        )}
      </div>
    );
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = validateRecord(entity, form, data, selected?.id);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    const result = onSave(form, selected?.id);
    if (Object.keys(result).length) setErrors(result);
  }
  return (
    <Modal
      title={`${selected ? 'Edit' : 'Create'} ${names[entity]}`}
      onClose={onClose}
      wide={entity === 'news'}
    >
      <form noValidate onSubmit={submit}>
        <div className="dialog-body">
          <p className="muted">
            {selected
              ? 'Update the details below.'
              : `Add a new ${names[entity]} to your newsroom.`}
          </p>
          {entity === 'categories' && (
            <>
              {field('name', 'Category name', { maxLength: 100, autoFocus: true })}
              {field('description', 'Description', { multiline: true, maxLength: 500 })}
            </>
          )}
          {entity === 'news' && (
            <>
              {field('title', 'Title', { maxLength: 200, autoFocus: true })}
              {field('categoryId', 'Category', {
                choices: [
                  { value: '', label: 'Select a category' },
                  ...data.categories.map((item) => ({
                    value: item.id,
                    label: `${item.name}${item.status === 0 ? ' (Inactive)' : ''}`,
                  })),
                ],
              })}
              {data.categories.length === 0 && (
                <p className="form-alert">Create a category before saving an article.</p>
              )}
              {field('content', 'Content', { multiline: true, maxLength: 20000 })}
              {field('tags', 'Tags (comma separated)', {
                placeholder: 'campus, students',
                maxLength: 300,
              })}
            </>
          )}
          {entity === 'users' && (
            <>
              {fixedAdmin && (
                <p className="info-note">
                  Admin/Admin is the fixed demo account required by the assignment.
                </p>
              )}
              {field('username', 'Username', {
                maxLength: 60,
                autoFocus: true,
                disabled: fixedAdmin,
                autoComplete: 'off',
              })}
              {field('password', 'Mock password', {
                type: 'password',
                maxLength: 100,
                disabled: fixedAdmin,
                autoComplete: 'new-password',
              })}
              {field('role', 'Role', {
                disabled: fixedAdmin,
                choices: [
                  { value: 1, label: 'Admin' },
                  { value: 2, label: 'Staff' },
                ],
              })}
            </>
          )}
          {field('status', 'Status', {
            disabled: fixedAdmin,
            choices: [
              { value: 1, label: 'Active' },
              { value: 0, label: 'Inactive' },
            ],
          })}
          {errors.form && (
            <p role="alert" className="form-alert">
              {errors.form}
            </p>
          )}
        </div>
        <div className="dialog-actions">
          <button
            type="button"
            className="button button-subtle"
            onClick={() => {
              setForm({ ...initial });
              setErrors({});
            }}
          >
            Reset
          </button>
          <div>
            <button type="button" className="button button-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {selected ? 'Save changes' : `Create ${names[entity]}`}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
