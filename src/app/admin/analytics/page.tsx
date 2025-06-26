'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type Booking = {
    service: string;
    timestamp: string; // assuming format is YYYY-MM-DD
};

export default function AnalyticsPage() {
    const [totalBookings, setTotalBookings] = useState(0);
    const [popularService, setPopularService] = useState('');
    const [avgBookingsPerWeek, setAvgBookingsPerWeek] = useState(0);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const snapshot = await getDocs(collection(db, 'bookings'));
            const bookings: Booking[] = snapshot.docs.map(doc => doc.data()) as Booking[];

            if (bookings.length === 0) return;

            // 1. Total bookings
            setTotalBookings(bookings.length);

            // 2. Most popular service
            const serviceCount: Record<string, number> = {};
            for (const b of bookings) {
                serviceCount[b.service] = (serviceCount[b.service] || 0) + 1;
            }
            const mostPopular = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
            setPopularService(mostPopular);

            // 3. Average bookings per week
            const dates = bookings
                .map(b => new Date(b.timestamp))
                .filter(date => !isNaN(date.getTime()))
                .sort((a, b) => a.getTime() - b.getTime());

            if (dates.length >= 2) {
                const first = dates[0];
                const last = dates[dates.length - 1];
                const totalWeeks = Math.max(1, Math.ceil((last.getTime() - first.getTime()) / (7 * 24 * 60 * 60 * 1000)));
                setAvgBookingsPerWeek(Number((bookings.length / totalWeeks).toFixed(1)));
            } else {
                setAvgBookingsPerWeek(bookings.length); // all bookings in one week
            }
        };

        fetchAnalytics();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white px-6 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4">Site Analytics</h1>
                <p className="text-gray-400 mb-10">Here’s a quick performance snapshot of your detailing business.</p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white text-black p-6 rounded-2xl shadow-md">
                        <h2 className="text-sm font-medium text-gray-600 mb-1">Total Bookings</h2>
                        <p className="text-4xl font-bold text-brand">{totalBookings}</p>
                    </div>

                    <div className="bg-white text-black p-6 rounded-2xl shadow-md">
                        <h2 className="text-sm font-medium text-gray-600 mb-1">Most Popular Service</h2>
                        <p className="text-lg font-semibold">{popularService || '—'}</p>
                    </div>

                    <div className="bg-white text-black p-6 rounded-2xl shadow-md">
                        <h2 className="text-sm font-medium text-gray-600 mb-1">Avg Bookings / Week</h2>
                        <p className="text-4xl font-bold text-brand">{avgBookingsPerWeek}</p>
                    </div>

                    <div className="bg-white text-black p-6 rounded-2xl shadow-md col-span-full lg:col-span-2">
                        <h2 className="text-sm font-medium text-gray-600 mb-2">Recent Activity</h2>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>{totalBookings} total bookings</li>
                            <li>{popularService ? `${popularService} is the most requested service` : '—'}</li>
                            <li>Average: {avgBookingsPerWeek} bookings per week</li>
                        </ul>
                    </div>
                </div>

                {/* Placeholder for future charts */}
                <div className="mt-16 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-500">
                    <p className="mb-2 font-semibold text-white">📊 Coming Soon</p>
                    <p>Live booking trends, service popularity breakdowns, and growth insights.</p>
                </div>
            </div>
        </div>
    );
}
