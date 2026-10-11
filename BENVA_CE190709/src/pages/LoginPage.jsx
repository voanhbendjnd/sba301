import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Newspaper } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import { authenticate } from '../services/dataService.js';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  function submit(event) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Enter your username and password.');
      return;
    }
    const user = authenticate(username, password);
    if (!user) {
      setError('Incorrect username or password. Try Admin / Admin.');
      return;
    }
    onLogin(user);
  }
  return (
    <main className="login-page">
      <section className="login-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow light">THE EDITORIAL WORKSPACE</span>
          <h1>
            Good stories
            <br />
            bring us <em>together.</em>
          </h1>
          <p>One place to manage the news, ideas and moments that matter to your university.</p>
          <div className="story-illustration" aria-hidden="true">
            <div className="paper">
              <div className="paper-kicker">THE CAMPUS EDITION</div>
              <div className="paper-heading">
                A new chapter
                <br />
                starts here.
              </div>
              <div className="paper-rule" />
              <div className="paper-columns">
                <span />
                <span />
                <span />
              </div>
              <div className="paper-stamp">
                <Newspaper size={30} />
              </div>
            </div>
            <div className="story-caption">
              <span className="live-dot" />
              Every story starts with you.
            </div>
          </div>
        </div>
        <small>FUNews Management System · University newsroom</small>
      </section>
      <section className="login-form-region">
        <div className="login-form-wrap">
          <span className="eyebrow">WELCOME TO FUNEWS</span>
          <h2>Welcome back.</h2>
          <p className="muted">Sign in to your editorial workspace.</p>
          <form noValidate onSubmit={submit}>
            <div className="field">
              <label htmlFor="login-username">Username</label>
              <input
                id="login-username"
                autoComplete="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={visible ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}
            <button className="button button-primary login-submit" type="submit">
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="demo-credential">
            <span>DEMO ACCESS</span>
            <p>
              Username <strong>Admin</strong>
              <i>/</i>Password <strong>Admin</strong>
            </p>
          </div>
          <small className="login-footnote">An academic demo with mock authentication.</small>
        </div>
      </section>
    </main>
  );
}
