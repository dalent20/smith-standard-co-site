// src/app/admin/layout.tsx
import Link from "next/link";
import "@/app/globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="bg-gray-100 text-gray-900 font-sans">
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <aside className="w-64 bg-black text-white flex flex-col p-6 space-y-4">
                        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
                        <Link href="/admin/dashboard" className="hover:text-blue-400">Dashboard</Link>
                        <Link href="/admin/bookings" className="hover:text-blue-400">Bookings</Link>
                        <Link href="/admin/content" className="hover:text-blue-400">Site Content</Link>
                        <Link href="/admin/analytics" className="hover:text-blue-400">Analytics</Link>
                    </aside>

                    {/* Page Content */}
                    <main className="flex-grow p-10 bg-white shadow-inner">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
