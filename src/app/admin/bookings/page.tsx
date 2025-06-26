'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

interface Booking {
    id: string;
    name: string;
    contact: string;
    service: string;
    date: string;
    time: string;
    status: string;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'bookings'));
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Booking[];
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const bookingRef = doc(db, 'bookings', id);
            await updateDoc(bookingRef, { status: newStatus });

            setBookings(prev =>
                prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
            );
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <section className="min-h-screen bg-black text-white p-6 sm:p-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">Customer Bookings</h1>
                <p className="text-gray-400 mb-8">Manage client appointments and update status.</p>

                {loading ? (
                    <p className="text-gray-300">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                    <div className="text-center mt-20">
                        <Image
                            src="/empty-folder.png"
                            alt="No Bookings"
                            width={150}
                            height={150}
                            className="mx-auto mb-6 opacity-50"
                        />
                        <h2 className="text-2xl font-semibold text-gray-200">No Bookings Found</h2>
                        <p className="text-gray-500">Once customers start booking services, they'll appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-md shadow-md mt-6">
                        <table className="min-w-full text-sm text-gray-800">
                            <thead className="bg-gray-200 text-left uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr
                                        key={booking.id}
                                        className={`border-t transition ${booking.status === 'Completed' ? 'bg-green-50' : 'bg-yellow-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4">{booking.name}</td>
                                        <td className="px-6 py-4">{booking.contact}</td>
                                        <td className="px-6 py-4">{booking.service}</td>
                                        <td className="px-6 py-4">{booking.date}</td>
                                        <td className="px-6 py-4">{booking.time}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="border border-gray-300 px-2 py-1 rounded"
                                                value={booking.status || 'Pending'}
                                                onChange={e => handleStatusChange(booking.id, e.target.value)}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
