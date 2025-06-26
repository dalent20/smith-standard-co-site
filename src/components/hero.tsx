// src/components/Hero.tsx
export default function Hero() {
    return (
        <section
            className="relative h-screen bg-cover bg-center flex items-center justify-center text-white"
            style={{ backgroundImage: "url('/luxury-car.jpg')" }}
        >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 text-center px-4">
                <img
                    src="/Placeholder-Logo.png"
                    alt="Smith Standard & Co Logo"
                    className="mx-auto mb-6 h-20 w-auto"
                />
                <h1 className="text-4xl sm:text-6xl font-bold tracking-wide">
                    Premium Car Detailing
                </h1>
                <p className="mt-4 text-lg sm:text-xl max-w-xl mx-auto">
                    Experience unmatched quality and attention to detail with Smith Standard & Co — where every car gets the luxury treatment.
                </p>
                <div className="mt-6">
                    <a
                        href="#contact"
                        className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-gray-200 transition"
                    >
                        Book Now
                    </a>
                </div>
            </div>
        </section>
    );
}
