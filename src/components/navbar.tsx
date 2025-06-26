// src/components/navbar.tsx
"use client";

import Link from "next/link";

export default function Navbar() {
    return (
        <header className="bg-black text-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold tracking-tight">
                    Smith Standard & Co.
                </Link>
                <nav className="space-x-6 text-sm sm:text-base">
                    <Link href="/showcase" className="hover:text-brand transition">Showcase</Link>
                    <Link href="/booking" className="hover:text-brand transition">Booking</Link>
                    <Link href="/about" className="hover:text-brand transition">About</Link> {/* New link */}
                </nav>
            </div>
        </header>
    );
}

//still want to add detail services , most likely include that in a dropdown menu