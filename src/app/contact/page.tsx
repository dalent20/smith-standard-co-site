'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ContactPage() {
    const [contact, setContact] = useState({ phone: '', email: '', address: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const snap = await getDoc(doc(db, 'siteContent', 'contact'));
                if (snap.exists()) {
                    setContact(snap.data());
                }
            } catch (err) {
                console.error('Error loading contact info:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContactInfo();
    }, []);

    return (
        <section className="max-w-2xl mx-auto py-20 px-6">
            <h1 className="text-3xl font-bold mb-6">Let’s Talk</h1>

            {/* Contact Info Section */}
            {loading ? (
                <p className="text-gray-500 mb-6">Loading contact info...</p>
            ) : (
                <div className="text-gray-700 mb-10 space-y-2">
                    {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                    {contact.email && <p><strong>Email:</strong> {contact.email}</p>}
                    {contact.address && <p><strong>Address:</strong> {contact.address}</p>}
                </div>
            )}

            {/* Contact Form */}
            <form className="space-y-4">
                <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <textarea
                    placeholder="How can we help?"
                    rows={5}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <button
                    type="submit"
                    className="bg-brand text-white px-6 py-3 rounded-md hover:bg-brand-dark transition font-semibold"
                >
                    Send Message
                </button>
            </form>
        </section>
    );
}
