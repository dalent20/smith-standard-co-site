'use client';

import { useEffect, useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function ShowcaseAdminPage() {
    const [images, setImages] = useState<{ id: string; url: string }[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchImages = async () => {
            const snapshot = await getDocs(collection(db, 'showcase'));
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                url: doc.data().url,
            }));
            setImages(data);
        };

        fetchImages();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `showcase/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'showcase'), { url: downloadURL });

            setImages(prev => [...prev, { id: file.name, url: downloadURL }]);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string) => {
        try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
            await deleteDoc(doc(db, 'showcase', id));
            setImages(prev => prev.filter(img => img.id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <h1 className="text-3xl font-bold mb-4">Manage Showcase</h1>
            <p className="text-gray-400 mb-6">Upload and manage images for the public showcase.</p>

            {/* Upload */}
            <div className="mb-6">
                <input
                    type="file"
                    onChange={handleUpload}
                    accept="image/*"
                    className="text-white"
                />
                {uploading && <p className="mt-2 text-green-400">Uploading...</p>}
            </div>

            {/* Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((img, idx) => (
                    <div
                        key={img.id}
                        className="relative rounded-xl overflow-hidden shadow-md group"
                    >
                        <img
                            src={img.url}
                            alt={`Showcase ${idx + 1}`}
                            className="w-full h-48 object-cover"
                        />
                        <button
                            onClick={() => handleDelete(img.id, img.url)}
                            className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
