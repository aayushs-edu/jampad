import { Gamepad2, Zap, Target, Sparkles, Lightbulb, Clock } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Lightbulb,
    title: "Theme → Ideas",
    description: "Enter your jam theme and get instant game concepts matched to proven mechanics.",
  },
  {
    icon: Target,
    title: "Scope It Down",
    description: "AI-powered scoping ensures your idea fits within your jam's time limit.",
  },
  {
    icon: Gamepad2,
    title: "Real Examples",
    description: "Browse real jam winners for inspiration — see what worked and why.",
  },
  {
    icon: Zap,
    title: "Mechanic Library",
    description: "Explore a curated library of game mechanics tagged by complexity and genre.",
  },
  {
    icon: Clock,
    title: "Time Planner",
    description: "Break your jam into phases with realistic milestones you can actually hit.",
  },
  {
    icon: Sparkles,
    title: "Polish Checklist",
    description: "Don't forget juice! Get a checklist of polish items to elevate your submission.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Features = () => {
  return (
    <section className="py-24 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-pixel text-xs text-primary tracking-wider uppercase">
            // Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 text-foreground">
            Everything you need to <span className="text-gradient">ship your jam game</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Stop overthinking. Start building. JamPad connects the dots between theme, mechanics, and scope.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="font-pixel text-xs mb-3 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
