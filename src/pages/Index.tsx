import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import TypewriterHero from "@/components/TypewriterHero";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/2 -translate-x-1/3 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block font-pixel text-[10px] text-primary bg-primary/10 px-4 py-2 rounded-full mb-8 tracking-wider">
              ✨ NEW — Now in beta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            Your game jam
            <br />
            <TypewriterHero />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Turn any jam theme into a scoped, polished game idea — with proven mechanics and real examples to guide you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative flex items-center bg-card border-2 border-primary/20 rounded-xl overflow-hidden shadow-xl group-hover:border-primary/40 transition-colors duration-300">
                <span className="pl-5 text-muted-foreground text-lg">🎮</span>
                <input
                  type="text"
                  placeholder='Enter your jam theme…'
                  className="flex-1 bg-transparent px-4 py-4 text-base md:text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
                <Button variant="hero" size="lg" className="m-1.5 rounded-lg">
                  Start jamming →
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-pixel text-[10px] text-muted-foreground mt-8"
          >
            {">"} works with Ludum Dare, GMTK, Global Game Jam & more
          </motion.p>
        </div>
      </section>

      <div id="features">
        <Features />
      </div>
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
