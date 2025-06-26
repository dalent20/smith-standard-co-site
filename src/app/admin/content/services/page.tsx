'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface Service {
    name: string;
    desc: string;
}

export default function EditServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [newService, setNewService] = useState<Service>({ name: '', desc: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            const docRef = doc(db, 'siteContent', 'services');
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                setServices(snap.data().items || []);
            }
        };
        fetchServices();
    }, []);

    const handleAddService = () => {
        if (!newService.name.trim() || !newService.desc.trim()) return;
        setServices(prev => [...prev, newService]);
        setNewService({ name: '', desc: '' });
    };

    const handleRemove = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'siteContent', 'services'), { items: services });
            alert('Services updated!');
        } catch (err) {
            console.error('Failed to save:', err);
            alert('Failed to save services.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Edit Services</h1>

            {/* Service List */}
            <ul className="space-y-3 mb-8">
                {services.map((s, i) => (
                    <li
                        key={i}
                        className="bg-white text-black p-4 rounded flex justify-between items-start"
                    >
                        <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="text-sm">{s.desc}</p>
                        </div>
                        <button
                            onClick={() => handleRemove(i)}
                            className="text-red-600 font-medium ml-4"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            {/* Add New Service */}
            <div className="mb-8 space-y-2">
                <input
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black"
                />
                <textarea
                    placeholder="Service Description"
                    value={newService.desc}
                    onChange={e => setNewService({ ...newService, desc: e.target.value })}
                    className="w-full p-2 border border-gray-400 rounded bg-white text-black h-24"
                />
                <button
                    onClick={handleAddService}
                    className="bg-black border border-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    Add Service
                </button>
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                {saving ? 'Saving...' : 'Save All Services'}
            </button>
        </div>
    );
}
