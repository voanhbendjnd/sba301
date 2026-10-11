import { useState } from 'react';
import { Save, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function SettingsPage({ settings, onSave }) {
  const [form, setForm] = useState({ ...settings });
  const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault();
    if (!form.displayName.trim() || !form.publicationName.trim()) {
      setError('Display name and publication name are required.');
      return;
    }
    setError('');
    onSave({ displayName: form.displayName.trim(), publicationName: form.publicationName.trim() });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Settings</h1>
          <p>A few details to make your workspace feel like home.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                <SlidersHorizontal size={19} />
                Workspace preferences
              </h2>
              <p>These preferences are saved in this browser.</p>
            </div>
          </div>
          <form noValidate onSubmit={submit}>
            <div className="settings-body">
              <div className="field">
                <label htmlFor="display-name">Display name</label>
                <input
                  id="display-name"
                  value={form.displayName}
                  maxLength={60}
                  onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="publication-name">Publication name</label>
                <input
                  id="publication-name"
                  value={form.publicationName}
                  maxLength={100}
                  onChange={(event) => setForm({ ...form, publicationName: event.target.value })}
                />
              </div>
              {error && (
                <p role="alert" className="form-alert">
                  {error}
                </p>
              )}
              <button className="button button-primary" type="submit">
                <Save size={17} />
                Save preferences
              </button>
            </div>
          </form>
        </section>
        <aside className="settings-info">
          <ShieldCheck size={26} />
          <h2>About this workspace</h2>
          <p>FUNews Management System is a React application for managing university news.</p>
          <dl>
            <dt>Account</dt>
            <dd>Admin</dd>
            <dt>Role</dt>
            <dd>Administrator</dd>
            <dt>Storage</dt>
            <dd>This browser</dd>
            <dt>Version</dt>
            <dd>1.0.0</dd>
          </dl>
        </aside>
      </div>
    </>
  );
}
