'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, CalendarDays } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [totalBookings, setTotalBookings] = useState<number>(0);
    const [completedJobs, setCompletedJobs] = useState<number>(0);
    const [newInquiries, setNewInquiries] = useState<number>(0);
    const [notes, setNotes] = useState<string[]>([]);
    const [newNote, setNewNote] = useState('');
    const [saving, setSaving] = useState(false);

    // Fetch booking stats
    useEffect(() => {
        const fetchStats = async () => {
            const snapshot = await getDocs(collection(db, 'bookings'));
            const bookings = snapshot.docs.map(doc => doc.data());

            setTotalBookings(bookings.length);
            setCompletedJobs(bookings.filter(b => b.status === 'Completed').length);
            setNewInquiries(bookings.filter(b => b.status === 'Pending').length);
        };

        fetchStats();
    }, []);

    // Fetch dashboard notes
    useEffect(() => {
        const fetchNotes = async () => {
            const docRef = doc(db, 'adminContent', 'dashboardNotes');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setNotes(docSnap.data().notes || []);
            } else {
                await setDoc(docRef, { notes: [] });
            }
        };

        fetchNotes();
    }, []);

    const addNote = () => {
        if (newNote.trim() === '') return;
        setNotes(prev => [...prev, newNote]);
        setNewNote('');
    };

    const removeNote = (index: number) => {
        setNotes(prev => prev.filter((_, i) => i !== index));
    };

    const saveNotes = async () => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'adminContent', 'dashboardNotes'), { notes });
        } catch (err) {
            console.error('Error saving notes:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 bg-black min-h-screen text-white space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard Overview</h1>
                <button
                    onClick={() => router.push('/admin/availability')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-md shadow hover:bg-gray-100 transition"
                >
                    <CalendarDays size={18} />
                    Update Availability
                </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white text-black p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-2">Total Bookings</h2>
                    <p className="text-3xl font-bold">{totalBookings}</p>
                </div>
                <div className="bg-white text-black p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-2">Completed Jobs</h2>
                    <p className="text-3xl font-bold">{completedJobs}</p>
                </div>
                <div className="bg-white text-black p-6 rounded-xl shadow-lg">
                    <h2 className="text-lg font-semibold mb-2">New Inquiries</h2>
                    <p className="text-3xl font-bold">{newInquiries}</p>
                </div>
            </div>

            {/* Editable Notes */}
            <div className="bg-white text-black p-6 rounded-xl border border-gray-300">
                <h3 className="text-xl font-semibold mb-4">Latest Notes</h3>

                <ul className="space-y-2 mb-6">
                    {notes.map((note, i) => (
                        <li key={i} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
                            <span className="text-gray-800">{note}</span>
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => removeNote(i)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Add a new note"
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        className="flex-1 border border-gray-300 px-3 py-2 rounded"
                    />
                    <button
                        onClick={addNote}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center gap-1"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>

                <button
                    onClick={saveNotes}
                    disabled={saving}
                    className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800 transition"
                >
                    {saving ? 'Saving...' : 'Save Notes'}
                </button>
            </div>
        </div>
    );
}
