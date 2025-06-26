'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AboutPage() {
    const [aboutText, setAboutText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const docRef = doc(db, 'siteContent', 'about');
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setAboutText(snap.data().text || '');
                } else {
                    setAboutText('About content not found.');
                }
            } catch (err) {
                console.error('Error loading About content:', err);
                setAboutText('Failed to load content.');
            } finally {
                setLoading(false);
            }
        };

        fetchAbout();
    }, []);

    return (
        <section className="min-h-screen bg-black text-white px-6 py-16 flex items-center justify-center">
            <div className="max-w-3xl text-center">
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-brand">
                    About Smith Standard & Co.
                </h1>

                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : (
                    <p className="text-lg sm:text-xl text-gray-300 leading-relaxed whitespace-pre-line mb-8">
                        {aboutText}
                    </p>
                )}
            </div>
        </section>
    );
}
