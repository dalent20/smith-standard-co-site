'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditContactPage() {
    const [contact, setContact] = useState({ phone: '', email: '', address: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchContactInfo = async () => {
            const docRef = doc(db, 'siteContent', 'contact');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setContact(snap.data());
            }
        };
        fetchContactInfo();
    }, []);

    const saveContactInfo = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteContent', 'contact'), contact);
            alert('Contact info updated!');
        } catch (err) {
            console.error('Save failed:', err);
            alert('Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Contact Info</h1>

            <div className="mb-4">
                <label className="block font-semibold mb-1">Phone</label>
                <input
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black"
                />
            </div>

            <div className="mb-4">
                <label className="block font-semibold mb-1">Email</label>
                <input
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black"
                />
            </div>

            <div className="mb-6">
                <label className="block font-semibold mb-1">Address</label>
                <textarea
                    value={contact.address}
                    onChange={(e) => setContact({ ...contact, address: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black h-24"
                />
            </div>

            <button
                onClick={saveContactInfo}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}
