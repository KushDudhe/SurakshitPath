import { useState } from 'react';
import Modal from './Modal';
import { useApp } from '../state/AppContext';
import { authRequest } from '../lib/api';

export default function LoginModal() {
  const { loginOpen, setLoginOpen, user, setUser } = useApp();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const signup = mode === 'signup';

  const close = () => { setLoginOpen(false); setError(''); setPassword(''); };
  const go = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const res = await authRequest(signup ? '/register' : '/login', { name, email, password });
    setBusy(false);
    if (res.user) { setUser({ id: res.user._id, name: res.user.name, email: res.user.email }); close(); return; }
    if (res.offline) { // server not running: keep the app usable with a local demo user
      setUser({ name: signup && name ? name : email ? email.split('@')[0] : 'Demo User' });
      close();
      return;
    }
    setError(res.error);
  };

  return (
    <Modal open={loginOpen} onClose={close} title="Login">
      <h3 className="text-xl font-semibold tracking-tight">{user ? `Signed in as ${user.name}` : signup ? 'Create your account' : 'Log in to SurakshitPath'}</h3>
      <p className="mt-1 text-sm text-muted">{user ? (user.email || 'Demo user on this device') : 'Accounts are stored in the PostgreSQL database. If the server is not running, you continue as a local demo user.'}</p>
      {user ? (
        <button onClick={() => { setUser(null); close(); }} className="btn-ghost mt-5 w-full">Log out</button>
      ) : (
        <form onSubmit={go} className="mt-5 space-y-3">
          {signup && <div><label className="label" htmlFor="nm">Name</label><input id="nm" className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required /></div>}
          <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" className="input" placeholder="••••••••" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button className="btn-primary w-full" type="submit" disabled={busy}>{busy ? 'Please wait…' : signup ? 'Sign up' : 'Log in'}</button>
          <button type="button" className="btn-ghost w-full" onClick={() => { setMode(signup ? 'login' : 'signup'); setError(''); }}>
            {signup ? 'Already have an account? Log in' : 'New here? Create an account'}
          </button>
        </form>
      )}
    </Modal>
  );
}
