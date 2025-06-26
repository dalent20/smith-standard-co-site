'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';

const availableServices = [
    'Interior Detailing',
    'Exterior Detailing',
    'Interior + Exterior Combo',
    'Ceramic Coating',
    'Paint Correction',
    'Luxury Steam Clean',
];

export default function BookingPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        service: '',
        date: '',
        time: '',
        carCount: '',
        carModels: [] as string[],
    });


    const [status, setStatus] = useState('');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<{ time: string; disabled: boolean }[]>([]);
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        const fetchAvailableDates = async () => {
            const snapshot = await getDocs(collection(db, 'availability'));
            const today = new Date().toISOString().split('T')[0];
            const dates = snapshot.docs
                .map((doc) => doc.id)
                .filter((date) => date >= today); // Only future dates
            setAvailableDates(dates);
        };

        fetchAvailableDates();
    }, []);


    useEffect(() => {
        const fetchAvailableTimes = async () => {
            if (!form.date || !form.carCount) return;

            const availabilityRef = doc(db, 'availability', form.date);
            const availabilitySnap = await getDoc(availabilityRef);

            const bookingSnapshot = await getDocs(collection(db, 'bookings'));
            const bookedSlots = bookingSnapshot.docs
                .filter(doc => doc.data().date === form.date)
                .map(doc => {
                    const time = doc.data().time; // e.g., '09:00'
                    const carCount = parseInt(doc.data().carCount) || 1;
                    const duration = carCount * 3.5 * 60; // in minutes
                    const [h, m] = time.split(':').map(Number);
                    const start = h * 60 + m;
                    const end = start + duration;
                    return { start, end };
                });

            if (availabilitySnap.exists()) {
                const ranges = availabilitySnap.data().times || [];
                const possibleTimes: { time: string; disabled: boolean }[] = [];

                ranges.forEach((range: string) => {
                    const [start, end] = range.split(' - ');
                    const [startH, startM] = start.split(':').map(Number);
                    const [endH, endM] = end.split(':').map(Number);

                    const startTotal = startH * 60 + (startM || 0);
                    const endTotal = endH * 60 + (endM || 0);

                    for (let t = startTotal; t <= endTotal - 30; t += 30) {
                        const duration = parseInt(form.carCount) * 3.5 * 60; // in minutes
                        const requestedStart = t;
                        const requestedEnd = t + duration;

                        const conflicts = bookedSlots.some(
                            booking =>
                                requestedStart < booking.end &&
                                requestedEnd > booking.start
                        );

                        const hour = Math.floor(t / 60);
                        const min = t % 60;
                        const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                        possibleTimes.push({ time: timeStr, disabled: conflicts });
                    }
                });

                setAvailableTimes(possibleTimes);
            } else {
                setAvailableTimes([]);
            }
        };

        fetchAvailableTimes();
    }, [form.date, form.carCount]);




    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        if (name === 'carCount') {
            const count = Math.max(1, parseInt(value) || 1);
            const updatedModels = [...form.carModels];

            // Adjust array size based on count
            while (updatedModels.length < count) updatedModels.push('');
            while (updatedModels.length > count) updatedModels.pop();

            setForm({
                ...form,
                carCount: value,
                carModels: updatedModels,
            });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleCarModelChange = (index: number, value: string) => {
        const updated = [...form.carModels];
        updated[index] = value;
        setForm({ ...form, carModels: updated });
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Submitting...');

        // Remove the selected time from availability
        const availRef = doc(db, 'availability', form.date);
        const docSnap = await getDoc(availRef);

        if (docSnap.exists()) {
            const currentTimes = docSnap.data().times || [];
            const updated = currentTimes.filter((range: string) => {
                const [start] = range.split(' - ');
                return !form.time.startsWith(start); // crude but functional match
            });

            await setDoc(availRef, { times: updated });
        }


        try {
            await addDoc(collection(db, 'bookings'), form);

            await emailjs.send(
                process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
                process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
                {
                    user_name: form.name,
                    user_email: form.email,
                    booking_date: form.date,
                    booking_time: form.time,
                    service_name: form.service,
                    car_model: form.carModels.join(', '),
                    car_count: form.carCount,
                },
                process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
            );

            setStatus('Booking confirmed and email sent!');
            setForm({
                name: '',
                email: '',
                service: '',
                date: '',
                time: '',
                carCount: '',
                carModels: [],
            });
            setShowSummary(false);
        } catch (err) {
            console.error(err);
            setStatus('Something went wrong. Try again.');
        }
    };

    const renderSummary = () => {
        const totalHours = Number(form.carCount) * 3.5;
        return (
            <div className="bg-gray-100 p-4 rounded text-black">
                <h2 className="text-lg font-bold mb-2">Booking Summary</h2>
                <p><strong>Name:</strong> {form.name}</p>
                <p><strong>Email:</strong> {form.email}</p>
                <p><strong>Service:</strong> {form.service}</p>
                <p><strong>Date:</strong> {form.date}</p>
                <p><strong>Start Time:</strong> {form.time}</p>
                <p><strong>Estimated Duration:</strong> {totalHours} hours</p>
                <p><strong>Cars:</strong> {form.carCount}</p>
                <p><strong>Vehicle:</strong> {form.carModels}</p>
            </div>
        );
    };

    return (
        <section className="max-w-xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-6 text-center">Book Your Detail</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow text-black">
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                    className="w-full p-2 border rounded"
                />
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    required
                    className="w-full p-2 border rounded"
                />
                <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select a Service</option>
                    {availableServices.map((service) => (
                        <option key={service} value={service}>
                            {service}
                        </option>
                    ))}
                </select>
                <input
                    name="carCount"
                    type="number"
                    min={1}
                    value={form.carCount}
                    onChange={handleChange}
                    placeholder="How many cars?"
                    required
                    className="w-full p-2 border rounded"
                />
                {Array.from({ length: Number(form.carCount) || 0 }).map((_, i) => (
                    <input
                        key={i}
                        name={`carModel-${i}`}
                        value={form.carModels?.[i] || ''}
                        onChange={(e) => {
                            const updated = [...(form.carModels || [])];
                            updated[i] = e.target.value;
                            setForm((prev) => ({ ...prev, carModels: updated }));
                        }}
                        placeholder={`Car ${i + 1} - Year + Make/Model (e.g. 2022 BMW M5)`}
                        required
                        className="w-full p-2 border rounded"
                    />
                ))}

                <select
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select a Date</option>
                    {availableDates.map((date) => (
                        <option key={date} value={date}>
                            {date}
                        </option>
                    ))}
                </select>
                <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select a Start Time</option>
                    {availableTimes.map(({ time, disabled }) => (
                        <option key={time} value={time} disabled={disabled}>
                            {time}
                        </option>
                    ))}

                </select>


                {form.name && form.email && form.service && form.date && form.time && form.carCount && form.carModels && renderSummary()}

                <button
                    type="submit"
                    className="w-full py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                    Confirm Booking
                </button>
                {status && <p className="text-center text-sm text-gray-700 mt-2">{status}</p>}
            </form>
        </section>
    );
}
