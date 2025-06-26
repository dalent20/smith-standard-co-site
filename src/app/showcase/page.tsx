'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ShowcasePage() {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const snap = await getDoc(doc(db, 'siteContent', 'showcase'));
                if (snap.exists()) {
                    setImages(snap.data().images || []);
                }
            } catch (err) {
                console.error('Error loading showcase images:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <div className="bg-black text-white">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-black">
                <Image
                    src="/detailing-bay.jpg"
                    alt="Showroom Background"
                    fill
                    className="object-cover object-center opacity-40"
                />
                <div className="relative z-10 px-6 sm:px-12">
                    <h1 className="text-4xl sm:text-6xl font-bold mb-4">
                        The Smith Standard Gallery
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                        Explore our finest detailing transformations, delivered with precision and pride.
                    </p>
                </div>
            </section>

            {/* Showcase Grid */}
            <section className="px-6 sm:px-12 py-20 bg-black">
                {loading ? (
                    <p className="text-center text-gray-500">Loading gallery...</p>
                ) : images.length === 0 ? (
                    <p className="text-center text-gray-400">No showcase images found.</p>
                ) : (
                    <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((url, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden shadow-lg hover:scale-[1.02] transition"
                            >
                                <Image
                                    src={url}
                                    alt={`Showcase ${idx + 1}`}
                                    width={600}
                                    height={400}
                                    className="w-full h-64 object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Testimonial Strip */}
            <section className="bg-gray-900 py-16 text-center px-6 sm:px-12">
                <blockquote className="text-xl italic text-gray-200 max-w-2xl mx-auto">
                    “My Aston Martin looks better than it did brand new. Smith Standard is the real deal.”
                </blockquote>
                <p className="mt-4 text-gray-500">— J. Whitman, Palm Beach</p>
            </section>

            {/* CTA */}
            <section className="bg-gray-950 py-20 text-center px-6 sm:px-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Let Your Car Be Our Next Masterpiece
                </h2>
                <p className="text-gray-400 mb-6">
                    Book a premium detailing session and experience elite care.
                </p>
                <a
                    href="/#contact"
                    className="inline-block px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition"
                >
                    Book Now
                </a>
            </section>
        </div>
    );
}
