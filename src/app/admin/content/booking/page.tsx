'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditBookingPage() {
    const [bookingInfo, setBookingInfo] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchBookingInfo = async () => {
            const docRef = doc(db, 'siteContent', 'booking');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setBookingInfo(snap.data().info || '');
            }
        };
        fetchBookingInfo();
    }, []);

    const saveBookingInfo = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteContent', 'booking'), { info: bookingInfo });
            alert('Booking info updated!');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Booking Info</h1>

            <label className="block font-semibold mb-2">Instructions / Policy Text</label>
            <textarea
                value={bookingInfo}
                onChange={(e) => setBookingInfo(e.target.value)}
                className="w-full p-3 mb-6 border border-gray-400 rounded bg-white text-black h-40"
            />

            <button
                onClick={saveBookingInfo}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}
