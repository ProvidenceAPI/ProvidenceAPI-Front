import React from "react";
<<<<<<< HEAD
import TransformacionCTA from "@/components/TransformacionCTA";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";


=======
import TransformacionCTA from "src/components/TransformacionCTA";
import { Navbar } from "src/components/Navbar";
import { Footer } from "src/components/Footer";
import Link from "next/link";

>>>>>>> 68ba516b3d89ff10059a4e10873ca3b301a4ddba
const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* Sección 1: Hero Principal CON VIDEO DE FONDO */}
        <section className="relative h-[80vh] md:h-[90vh] overflow-hidden">
          {/* Video de fondo */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/ProviVideo.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
            {/* Overlay oscuro para mejor contraste del texto */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Contenido sobre el video */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-6">
            <div className="max-w-4xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 uppercase tracking-wider">
                RESERVA TU TURNO Y ENTRENA EN<br />
                <span className="text-[#DC2626]">PROVIDENCE FITNESS</span>
              </h2>
              <Link href="/home" className="bg-[#DC2626] hover:bg-[#B01C1C] text-white px-8 py-4 rounded-md text-xl font-bold uppercase tracking-wider mt-6 transition-colors hover:scale-105">
                Ver Clases Disponibles
              </Link>
            </div>
          </div>
        </section>
      </main>
      <TransformacionCTA />
      <Footer />
    </>
  );
};

export default LandingPage;