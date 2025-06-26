'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditHomePage() {
    const [heroTitle, setHeroTitle] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchHero = async () => {
            const docRef = doc(db, 'siteContent', 'hero');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setHeroTitle(snap.data().title);
            }
        };
        fetchHero();
    }, []);

    const saveHero = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteContent', 'hero'), { title: heroTitle });
            alert('Home page title saved!');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Home Page</h1>

            <label className="block font-semibold mb-2">Hero Title</label>
            <input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full p-2 mb-6 border border-gray-400 rounded bg-white text-black"
            />

            <button
                onClick={saveHero}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}
