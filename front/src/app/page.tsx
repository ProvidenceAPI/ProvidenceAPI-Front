

import React from "react";
import TransformacionCTA from "@/components/TransformacionCTA";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Sección 1: Hero Principal */}
        <section className="relative bg-gradient-to-b from-black to-gray-900 text-white py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 uppercase tracking-wider">
              RESERVA TU TURNO Y ENTRENA EN<br />
              <span className="text-[#DC2626]">PROVIDENCE FITNESS</span>
            </h2>
            <button className="bg-[#DC2626] hover:bg-[#B01C1C] text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider mt-6 transition-colors">
              Ver Clases Disponibles
            </button>
          </div>
        </section>
      </main>
      <TransformacionCTA />
      <Footer />
    </>
  );
};

export default LandingPage;
