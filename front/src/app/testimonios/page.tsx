'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import TransformacionCTA from '@/components/TransformacionCTA';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  rating: number;
  highlighted?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Providence Fitness transformed my life! Lost 30 pounds and gained incredible strength.",
    author: "Sarah Johnson",
    role: "Providence Fitness Member",
    rating: 5,
  },
  {
    id: 2,
    quote: "The trainers are amazing and the community is so supportive!",
    author: "Mike Chen",
    role: "Providence Fitness Member",
    rating: 5,
  },
  {
    id: 3,
    quote: "Best investment I've made! I'm stronger and more confident than ever before.",
    author: "Jessica Rodriguez",
    role: "Providence Fitness Member",
    rating: 5,
    highlighted: true,
  },
  {
    id: 4,
    quote: "From couch potato to marathon runner in 8 months. Providence made it possible!",
    author: "David Thompson",
    role: "Providence Fitness Member",
    rating: 5,
  },
  {
    id: 5,
    quote: "The personal training sessions are incredible. I've never felt this strong!",
    author: "Amanda Park",
    role: "Providence Fitness Member",
    rating: 5,
  },
  {
    id: 6,
    quote: "Providence Fitness helped me get back in shape after my injury. Professional and caring staff.",
    author: "Carlos Martinez",
    role: "Providence Fitness Member",
    rating: 5,
  },
];

export default function TestimoniosPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        {/* Header Section */}
        <section className="py-16 px-6 md:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            HISTORIAS DE <span className="text-red-600">ÉXITO</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Transformaciones reales de personas reales. Mira lo que es posible cuando te comprometes con la excelencia.
          </p>
        </section>

        {/* Testimonials Grid */}
        <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`p-8 rounded-lg transition-all duration-300 ${
                  testimonial.highlighted
                    ? 'border-2 border-red-600 bg-white'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">
                      ★
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div>
                  <p className="font-bold text-black text-lg">{testimonial.author}</p>
                  <p className="text-blue-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <TransformacionCTA/>
      <Footer />
    </>
  );
}
