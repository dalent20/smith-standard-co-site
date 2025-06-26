'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function EditShowcasePage() {
    const [images, setImages] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            const docRef = doc(db, 'siteContent', 'showcase');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setImages(snap.data().images || []);
            }
        };
        fetchImages();
    }, []);

    const addImage = () => {
        if (!newImageUrl.trim()) return;
        setImages(prev => [...prev, newImageUrl.trim()]);
        setNewImageUrl('');
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const saveImages = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteContent', 'showcase'), { images });
            alert('Showcase updated!');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to update showcase.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Showcase Images</h1>

            {/* Existing Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {images.map((url, i) => (
                    <div
                        key={i}
                        className="bg-white text-black p-3 rounded shadow relative group"
                    >
                        <img src={url} alt={`Showcase ${i + 1}`} className="w-full h-40 object-cover rounded" />
                        <button
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Add New Image */}
            <div className="mb-6 space-y-2">
                <input
                    placeholder="Image URL"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black"
                />
                <button
                    onClick={addImage}
                    className="bg-black border border-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Add Image
                </button>
            </div>

            {/* Save All */}
            <button
                onClick={saveImages}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {saving ? 'Saving...' : 'Save All Changes'}
            </button>
        </div>
    );
}
