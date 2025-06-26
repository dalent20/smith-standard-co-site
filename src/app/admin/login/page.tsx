'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Make sure this points to your Firebase config

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);

            // OPTIONAL: Set a local cookie or flag if you want to guard admin pages with middleware
            document.cookie = 'admin-auth=true; path=/';

            // Redirect to admin dashboard
            router.push('/admin/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
            <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

                <input
                    type="email"
                    className="w-full p-3 mb-4 bg-gray-800 rounded text-white placeholder-gray-400"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    className="w-full p-3 mb-4 bg-gray-800 rounded text-white placeholder-gray-400"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className="w-full bg-white text-black py-3 rounded hover:bg-gray-200 font-semibold"
                >
                    Log In
                </button>

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
            </form>
        </div>
    );
}
