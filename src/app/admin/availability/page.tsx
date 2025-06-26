'use client';

import { useEffect, useState } from 'react';
import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CalendarDays, Clock, Trash2 } from 'lucide-react';

export default function AdminAvailabilityPage() {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [availability, setAvailability] = useState<Record<string, string[]>>({});
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchAvailability = async () => {
            const snapshot = await getDocs(collection(db, 'availability'));
            const data: Record<string, string[]> = {};
            snapshot.forEach(doc => {
                data[doc.id] = doc.data().times || [];
            });
            setAvailability(data);
        };

        fetchAvailability();
    }, []);

    const addTimeSlot = async () => {
        if (!date || !startTime || !endTime) {
            setStatus('Please select a date, start time, and end time.');
            return;
        }

        const timeRange = `${startTime} - ${endTime}`;
        const docRef = doc(db, 'availability', date);
        const existingTimes = availability[date] || [];

        if (existingTimes.includes(timeRange)) {
            setStatus('This time range already exists.');
            return;
        }

        const updatedTimes = [...existingTimes, timeRange].sort();
        await setDoc(docRef, { times: updatedTimes });

        setAvailability(prev => ({
            ...prev,
            [date]: updatedTimes,
        }));

        setStartTime('');
        setEndTime('');
        setStatus('Time range added.');
    };


    const deleteTime = async (dateKey: string, time: string) => {
        const filtered = availability[dateKey].filter(t => t !== time);
        if (filtered.length === 0) {
            await deleteDoc(doc(db, 'availability', dateKey));
            const updated = { ...availability };
            delete updated[dateKey];
            setAvailability(updated);
        } else {
            await setDoc(doc(db, 'availability', dateKey), { times: filtered });
            setAvailability(prev => ({ ...prev, [dateKey]: filtered }));
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4"> Manage Booking Availability</h1>
                <p className="text-gray-400 mb-6">Set the dates and time slots your customers can book.</p>

                <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center mb-8">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={20} className="text-black" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="p-2 rounded border border-gray-300 text-black"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock size={20} className="text-black" />
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="p-2 rounded border border-gray-300 text-black"
                            placeholder="Start"
                        />
                        <span className="text-black">–</span>
                        <input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="p-2 rounded border border-gray-300 text-black"
                            placeholder="End"
                        />
                    </div>


                    <button
                        onClick={addTimeSlot}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                    >
                        Add Availability
                    </button>
                </div>

                {status && <p className="text-sm text-green-400 mb-6">{status}</p>}

                <div className="space-y-6">
                    {Object.keys(availability)
                        .sort()
                        .map((dateKey) => (
                            <div key={dateKey} className="bg-white p-4 rounded-lg text-black shadow">
                                <h2 className="text-lg font-semibold mb-2">
                                    {new Date(dateKey).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {availability[dateKey].map((time) => (
                                        <div
                                            key={time}
                                            className="flex items-center bg-gray-200 px-3 py-1 rounded-full text-sm"
                                        >
                                            <span>{time}</span>
                                            <button
                                                onClick={() => deleteTime(dateKey, time)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
