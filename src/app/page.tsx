// src/app/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  return (
    <div className="bg-black text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center">
        <Image
          src="/luxury-car.jpg"
          alt="Luxury Car"
          fill
          className="object-cover object-center absolute inset-0 opacity-70 z-0"
        />
        <div className="z-10">
          <Image
            src="/Placeholder-Logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">Smith Standard & Co.</h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-xl mx-auto mb-8">
            Precision detailing for those who demand perfection.
          </p>
          <Link
            href="/booking"
            className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            Book Now
          </Link>
        </div>
      </section>

      {/* SERVICES PREVIEW */}
      <section className="py-20 px-6 bg-gray-900 text-center">
        <h2 className="text-3xl font-semibold mb-4">Our Services</h2>
        <p className="text-gray-400 mb-8">Tailored detailing for every car — from daily drivers to exotic machines.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {['Exterior Detail', 'Interior Restoration', 'Ceramic Coating'].map((service) => (
            <div key={service} className="bg-gray-800 p-6 rounded-lg shadow hover:shadow-xl transition">
              <h3 className="text-xl font-bold mb-2">{service}</h3>
              <p className="text-gray-400 text-sm">Premium service with high-end products and careful precision.</p>
            </div>
          ))}
        </div>
        <Link href="/booking" className="inline-block mt-8 text-brand hover:underline">
          View All Services →
        </Link>
      </section>

      {/* SHOWCASE PREVIEW */}
      <section className="py-20 px-6 bg-black text-center">
        <h2 className="text-3xl font-semibold mb-4">Showcase</h2>
        <p className="text-gray-400 mb-8">See the results that speak for themselves.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-800 rounded-lg shadow-md">
              {/* Replace with real images later */}
              <Image
                src={`/luxury-car.jpg`}
                alt={`Showcase ${i}`}
                width={500}
                height={500}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          ))}
        </div>
        <Link href="/showcase" className="inline-block mt-8 text-brand hover:underline">
          View Full Gallery →
        </Link>
      </section>

      {/* ABOUT PREVIEW */}
      <section className="py-20 px-6 bg-gray-900 text-center">
        <h2 className="text-3xl font-semibold mb-4">About Us</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          At Smith Standard & Co., we’re not just washing cars — we’re perfecting machines. With years of experience
          and a passion for automotive excellence, we deliver detailing at the highest level.
        </p>
        <Link href="/about" className="inline-block mt-8 text-brand hover:underline">
          Learn More →
        </Link>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-black text-center">
        <h2 className="text-3xl font-semibold mb-4">What Our Clients Say</h2>
        <TestimonialCarousel />
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-brand text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Ride?</h2>
        <p className="text-lg mb-6">Book your detailing session with Smith Standard & Co. today.</p>
        <Link
          href="/booking"
          className="inline-block px-8 py-3 rounded-full bg-black text-white hover:bg-gray-800 transition"
        >
          Book an Appointment
        </Link>
      </section>
    </div>
  );
}

// Simple testimonials carousel (rotating text)
function TestimonialCarousel() {
  const testimonials = [
    "“Absolutely flawless detail. My BMW has never looked better.” – Marcus R.",
    "“Professional, timely, and next-level work. Highly recommended.” – Jasmine L.",
    "“Feels like I just drove it out of the dealership.” – Devin M.",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-xl italic text-gray-300 max-w-2xl mx-auto">
      {testimonials[index]}
    </p>
  );
}
