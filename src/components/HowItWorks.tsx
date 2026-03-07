import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Enter your theme", description: "Paste the jam theme or constraints you're working with." },
  { step: "02", title: "Browse ideas", description: "Get matched game concepts with mechanics, scope, and examples." },
  { step: "03", title: "Plan & build", description: "Use the time planner and polish checklist to ship something great." },
];

const HowItWorks = () => {
  return (
    <section id="how" className="py-24 px-6 bg-card">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-pixel text-xs text-primary tracking-wider uppercase">
            // How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 text-foreground">
            From theme to shipped in <span className="text-gradient">3 steps</span>
          </h2>
        </div>

        <div className="space-y-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex items-start gap-6 group"
            >
              <div className="font-pixel text-2xl text-primary/30 group-hover:text-primary transition-colors min-w-[3rem]">
                {s.step}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{s.title}</h3>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-border mt-1 hidden lg:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
