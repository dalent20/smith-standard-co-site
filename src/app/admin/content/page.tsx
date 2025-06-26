'use client';

import { useRouter } from 'next/navigation';

export default function SiteContentDashboard() {
    const router = useRouter();

    const pages = [
        { label: 'Home Page', path: '/admin/content/home-page' },
        { label: 'About', path: '/admin/content/about' },
        { label: 'Booking Info', path: '/admin/content/booking' },
        { label: 'Contact Info', path: '/admin/content/contact' },
        { label: 'Services', path: '/admin/content/services' },
        { label: 'Showcase', path: '/admin/content/showcase' },
    ];

    return (
        <div className="p-6 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">Site Content Manager</h1>
            <p className="text-gray-400 mb-10">
                Click a section below to edit the content on your website.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map(({ label, path }) => (
                    <button
                        key={path}
                        onClick={() => router.push(path)}
                        className="bg-white text-black rounded-xl px-6 py-4 font-semibold text-lg shadow hover:bg-gray-100 transition"
                    >
                        Edit {label}
                    </button>
                ))}
            </div>
        </div>
    );
}
