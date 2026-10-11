import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import LoginPage from './pages/LoginPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ManagementPage from './pages/ManagementPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import {
  loadData,
  saveData,
  saveRecord,
  deleteRecord,
  SESSION_KEY,
} from './services/dataService.js';

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'user-admin'
      ? { id: 'user-admin', username: 'Admin', role: 1 }
      : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [loaded] = useState(() => loadData(browserStorage()));
  const [data, setData] = useState(loaded.data);
  const [user, setUser] = useState(readSession);
  const [page, setPage] = useState('dashboard');
  const [createNews, setCreateNews] = useState(false);
  const [warning, setWarning] = useState(loaded.warning);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const error = saveData(browserStorage(), data);
    if (error) setWarning(error);
  }, [data]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  function login(currentUser) {
    setUser(currentUser);
    setPage('dashboard');
    try {
      sessionStorage.setItem(SESSION_KEY, currentUser.id);
    } catch {
      setWarning('Session storage is unavailable. Sign in again after a reload.');
    }
  }
  function logout() {
    setUser(null);
    setPage('dashboard');
    setCreateNews(false);
    setNotice('');
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* In-memory session is already cleared. */
    }
  }
  function navigate(nextPage) {
    setPage(nextPage);
    setCreateNews(false);
  }
  function save(entity, form, id) {
    const result = saveRecord(data, entity, form, id);
    if (!Object.keys(result.errors).length) {
      setData(result.data);
      setNotice(
        `${entity === 'news' ? 'Article' : entity === 'users' ? 'User' : 'Category'} ${id ? 'updated' : 'created'} successfully.`,
      );
    }
    return result.errors;
  }
  function remove(entity, id) {
    const result = deleteRecord(data, entity, id);
    if (!result.error) {
      setData(result.data);
      setNotice('Record deleted successfully.');
    }
    return result.error;
  }
  if (!user)
    return (
      <>
        <LoginPage onLogin={login} />
        {warning && (
          <div className="login-storage-warning" role="alert">
            {warning}
          </div>
        )}
      </>
    );
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <AdminLayout
        page={page}
        onNavigate={navigate}
        onLogout={logout}
        displayName={data.settings.displayName}
      >
        {warning && (
          <div className="storage-warning" role="alert">
            {warning}
            <button
              className="icon-button"
              aria-label="Dismiss storage warning"
              onClick={() => setWarning('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {page === 'dashboard' && (
          <DashboardPage
            data={data}
            onNavigate={navigate}
            onCreateNews={() => {
              setCreateNews(true);
              setPage('news');
            }}
          />
        )}
        {['categories', 'news', 'users'].includes(page) && (
          <ManagementPage
            key={page}
            entity={page}
            data={data}
            onSave={save}
            onDelete={remove}
            initialCreate={createNews}
          />
        )}
        {page === 'settings' && (
          <SettingsPage
            settings={data.settings}
            onSave={(settings) => {
              setData({ ...data, settings });
              setNotice('Preferences saved successfully.');
            }}
          />
        )}
      </AdminLayout>
      {notice && (
        <div className="toast-message" role="status">
          <CheckCircle2 size={19} />
          {notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
