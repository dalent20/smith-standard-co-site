'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/auth/admin-session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'This account does not have manager access.');
      router.replace('/admin/dashboard');
      router.refresh();
    } catch (loginError: any) {
      console.error('Admin login error', loginError);
      setError(loginError?.message || 'Unable to sign in.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 py-20 text-white">
      <form onSubmit={handleLogin} className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-8 shadow-2xl">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-black"><ShieldCheck className="h-5 w-5" /></div>
        <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Smith Standard OS</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Manager access</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500">Only employee profiles with the Owner or Manager role can enter the operating portal or initiate customer balance charges.</p>
        <div className="mt-7 space-y-4">
          <input type="email" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none focus:border-white/40" placeholder="Work email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input type="password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 outline-none focus:border-white/40" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="rounded-xl bg-red-950/50 p-3 text-sm text-red-300">{error}</p> : null}
          <button disabled={loading} type="submit" className="w-full rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50">{loading ? 'Verifying access…' : 'Sign in to Smith Standard OS'}</button>
        </div>
      </form>
    </main>
  );
}
