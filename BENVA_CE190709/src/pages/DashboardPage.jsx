import { Newspaper, Folder, Users, ArrowUpRight, Plus, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';

export const formatDate = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));

export default function DashboardPage({ data, onNavigate, onCreateNews }) {
  const recent = [...data.news]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const active = data.news.filter((item) => item.status === 1).length;
  const stats = [
    {
      label: 'Total articles',
      value: data.news.length,
      detail: `${active} active articles`,
      icon: Newspaper,
      page: 'news',
    },
    {
      label: 'Categories',
      value: data.categories.length,
      detail: `${data.categories.filter((item) => item.status === 1).length} active categories`,
      icon: Folder,
      page: 'categories',
    },
    {
      label: 'Team members',
      value: data.users.length,
      detail: `${data.users.filter((item) => item.role === 2).length} staff members`,
      icon: Users,
      page: 'users',
    },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR NEWSROOM AT A GLANCE</span>
          <h1>Dashboard</h1>
          <p>A fresh perspective on everything you publish.</p>
        </div>
        <button className="button button-primary" onClick={onCreateNews}>
          <Plus size={18} />
          Create article
        </button>
      </div>
      <section className="welcome-banner">
        <div>
          <span className="eyebrow light">{data.settings.publicationName}</span>
          <h2>Make room for the next great story.</h2>
          <p>Keep your campus informed, inspired and connected.</p>
          <button className="text-button" onClick={() => onNavigate('news')}>
            Explore your articles
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <Newspaper size={82} strokeWidth={1.1} />
          <span className="art-spark">✦</span>
        </div>
      </section>
      <section className="stats-grid" aria-label="Newsroom statistics">
        {stats.map(({ label, value, detail, icon: Icon, page }) => (
          <button className="stat-card" key={page} onClick={() => onNavigate(page)}>
            <div className="stat-top">
              <span>{label}</span>
              <span className={`stat-icon ${page}`}>
                <Icon size={20} />
              </span>
            </div>
            <div className="stat-number">
              {value}
              <ArrowUpRight size={20} />
            </div>
            <p>{detail}</p>
          </button>
        ))}
      </section>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Latest articles</h2>
            <p>The most recent stories from your newsroom.</p>
          </div>
          <button className="button button-subtle" onClick={() => onNavigate('news')}>
            View all
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="article-cell">
                      <span className="article-symbol">
                        <Newspaper size={20} />
                      </span>
                      <div>
                        <strong>{item.title}</strong>
                        <small>
                          {data.users.find((user) => user.id === item.createdBy)?.username}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {data.categories.find((category) => category.id === item.categoryId)?.name}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="date-cell">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!recent.length && (
            <div className="empty-state">
              <Newspaper size={32} />
              <h3>Your next story starts here</h3>
              <p>Create your first article to see it in your newsroom.</p>
            </div>
          )}
        </div>
        <div className="panel-footer">
          <span>
            <span className="live-dot" />
            {active} active · {data.news.length - active} inactive
          </span>
          <span>All changes saved in this browser</span>
        </div>
      </section>
    </>
  );
}
