// src/components/SocialIcons.tsx
"use client";

import { FaInstagram, FaFacebookF, FaTiktok } from "react-icons/fa";

export default function SocialIcons() {
    return (
        <div className="fixed bottom-4 left-4 z-50 flex space-x-4">
            <a href="https://www.instagram.com/smithstandardco" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="w-6 h-6 text-white hover:text-brand transition" />
            </a>
            <a href="https://www.facebook.com/smithstandardco" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF className="w-6 h-6 text-white hover:text-brand transition" />
            </a>
            <a href="https://www.tiktok.com/@smithstandardco" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok className="w-6 h-6 text-white hover:text-brand transition" />
            </a>
        </div>
    );
}
