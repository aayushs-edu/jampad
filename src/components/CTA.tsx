import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";

const CTA = () => {
  return (
    <section id="cta" className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 glow-primary">
          <Gamepad2 className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Ready to jam?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Stop staring at a blank screen. Let JamPad turn your next jam theme into a polished, shippable game idea.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg">
            Get started free
          </Button>
          <Button variant="heroOutline" size="lg">
            See it in action
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6 font-pixel">
          {">"} no signup required. just vibes.
        </p>
      </motion.div>
    </section>
  );
};

export default CTA;
