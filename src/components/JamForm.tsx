import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: "theme", title: "Theme" },
  { id: "time", title: "Time" },
  { id: "skill", title: "Skill" },
  { id: "engine", title: "Engine" },
  { id: "genre", title: "Genre" },
  { id: "dimensions", title: "2D / 3D" },
  { id: "team", title: "Team" },
];

const MIN_HOURS = 6;
const MAX_HOURS = 720; // 1 month

function sliderToHours(val: number): number {
  return Math.round(MIN_HOURS + (MAX_HOURS - MIN_HOURS) * Math.pow(val / 100, 2));
}

function hoursToSlider(hours: number): number {
  return Math.round(Math.sqrt((hours - MIN_HOURS) / (MAX_HOURS - MIN_HOURS)) * 100);
}

function formatHours(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? "1 day" : `${days} days`;
  const weeks = Math.round(days / 7);
  if (weeks < 4) return weeks === 1 ? "1 week" : `${weeks} weeks`;
  return "1 month";
}

const timeTicks = [6, 24, 72, 168, 336, 720].map((h) => ({
  hours: h,
  label: formatHours(h),
  pos: hoursToSlider(h),
}));

const engineOptions = [
  { value: "unity", label: "Unity", logo: "/unity.png" },
  { value: "godot", label: "Godot", logo: "/godot.png" },
  { value: "unreal", label: "Unreal", logo: "/unreal.png" },
  { value: "other", label: "Other / Any", logo: null },
];

const genreOptions = [
  "Platformer", "Puzzle", "Top-down", "Narrative", "Horror",
  "Physics-based", "Arcade", "Strategy", "Exploration", "Other",
];

interface FormData {
  theme: string;
  timeHours: number;
  customTime: string;
  skillLevel: string;
  engine: string;
  genres: string[];
  dimensions: string;
  teamSize: string;
}

interface JamFormProps {
  initialTheme?: string;
  onComplete?: (data: FormData) => void;
  onBack?: () => void;
}

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const JamForm = ({ initialTheme = "", onComplete, onBack }: JamFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    theme: initialTheme,
    timeHours: 24,
    customTime: "",
    skillLevel: "",
    engine: "",
    genres: [],
    dimensions: "",
    teamSize: "",
  });

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGenre = (genre: string) => {
    setFormData((prev) => {
      const genres = [...prev.genres];
      if (genres.includes(genre)) {
        return { ...prev, genres: genres.filter((g) => g !== genre) };
      }
      return { ...prev, genres: [...genres, genre] };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack?.();
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete?.(formData);
      toast.success("Generating your game idea…");
    }, 1500);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return formData.theme.trim() !== "";
      case 2: return formData.skillLevel !== "";
      default: return true;
    }
  };

  const isRecommendedSection = currentStep >= 3;

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-2">
      {/* Progress bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div key={index} className="flex flex-col items-center" whileHover={{ scale: 1.1 }}>
              <motion.div
                className={cn(
                  "w-3.5 h-3.5 rounded-full cursor-pointer transition-colors duration-300",
                  index < currentStep
                    ? "bg-primary"
                    : index === currentStep
                    ? "bg-primary ring-4 ring-primary/20"
                    : "bg-muted",
                )}
                onClick={() => { if (index <= currentStep) setCurrentStep(index); }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className={cn(
                  "text-[10px] mt-1.5 hidden sm:block font-pixel",
                  index === currentStep ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <AnimatePresence>
          {isRecommendedSection && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-muted-foreground mt-2 text-center font-pixel"
            >
              recommended — helps craft better ideas
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="border shadow-md rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              {/* Step 0 — Theme */}
              {currentStep === 0 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Jam Theme</CardTitle>
                    <CardDescription>What's the theme you're working with?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Input
                        id="theme"
                        placeholder='"Strange Places," "Growth," "Nothing Can Go Wrong"…'
                        value={formData.theme}
                        onChange={(e) => updateFormData("theme", e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && isStepValid()) nextStep(); }}
                        autoFocus
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 1 — Time */}
              {currentStep === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Time Available</CardTitle>
                    <CardDescription>How long do you have for this jam?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6 pt-2">
                      <div className="text-center">
                        <span className="text-5xl font-bold text-primary font-pixel">
                          {formData.customTime || formatHours(formData.timeHours)}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[hoursToSlider(formData.timeHours)]}
                        onValueChange={(val) => {
                          updateFormData("timeHours", sliderToHours(val[0]));
                          updateFormData("customTime", "");
                        }}
                        className="w-full"
                      />
                      <div className="relative h-4">
                        {timeTicks.map((tick, i) => (
                          <span
                            key={tick.hours}
                            className={cn(
                              "absolute text-[10px] text-muted-foreground",
                              i === 0
                                ? "left-0"
                                : i === timeTicks.length - 1
                                ? "right-0"
                                : "-translate-x-1/2",
                            )}
                            style={i === 0 || i === timeTicks.length - 1 ? undefined : { left: `${tick.pos}%` }}
                          >
                            {tick.label}
                          </span>
                        ))}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-xs text-muted-foreground">or enter custom</span>
                        </div>
                      </div>
                      <Input
                        placeholder='e.g. "3 days", "36h", "10 days"…'
                        value={formData.customTime}
                        onChange={(e) => updateFormData("customTime", e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 2 — Skill Level */}
              {currentStep === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Skill Level</CardTitle>
                    <CardDescription>How would you rate your game dev experience?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.skillLevel}
                      onValueChange={(val) => updateFormData("skillLevel", val)}
                      className="space-y-3"
                    >
                      {[
                        { value: "beginner", label: "Beginner", desc: "Just starting out — learning the ropes" },
                        { value: "intermediate", label: "Intermediate", desc: "Shipped a few projects, know your tools" },
                        { value: "advanced", label: "Advanced", desc: "Confident with complex systems & polish" },
                      ].map((level, index) => (
                        <motion.div
                          key={level.value}
                          className={cn(
                            "flex items-start space-x-3 rounded-xl border p-4 cursor-pointer transition-colors",
                            formData.skillLevel === level.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50",
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: 0.08 * index } }}
                          onClick={() => updateFormData("skillLevel", level.value)}
                        >
                          <RadioGroupItem value={level.value} id={`skill-${level.value}`} className="mt-0.5 border-current" />
                          <div>
                            <Label htmlFor={`skill-${level.value}`} className="font-semibold cursor-pointer">
                              {level.label}
                            </Label>
                            <p className="text-xs mt-0.5 opacity-70">{level.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </>
              )}

              {/* Step 3 — Engine */}
              {currentStep === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Engine / Toolset</CardTitle>
                    <CardDescription>What are you building with?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {engineOptions.map((engine, index) => (
                        <motion.button
                          key={engine.value}
                          type="button"
                          className={cn(
                            "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all text-left w-full",
                            formData.engine === engine.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50",
                          )}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                          onClick={() => updateFormData("engine", engine.value)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted overflow-hidden">
                            {engine.logo ? (
                              <img src={engine.logo} alt={engine.label} className="w-6 h-6 object-contain" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{engine.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 4 — Genre */}
              {currentStep === 4 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Game Type</CardTitle>
                    <CardDescription>Pick any genres that interest you (multi-select)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {genreOptions.map((genre, index) => (
                        <motion.div
                          key={genre}
                          className={cn(
                            "flex items-center space-x-2 rounded-xl border p-3 cursor-pointer transition-all",
                            formData.genres.includes(genre)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50",
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.04 * index } }}
                          onClick={() => toggleGenre(genre)}
                        >
                          <Checkbox
                            id={`genre-${genre}`}
                            checked={formData.genres.includes(genre)}
                            onCheckedChange={() => toggleGenre(genre)}
                            className={formData.genres.includes(genre) ? "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary" : ""}
                          />
                          <Label htmlFor={`genre-${genre}`} className="cursor-pointer text-sm">
                            {genre}
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 5 — 2D / 3D */}
              {currentStep === 5 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Dimensions</CardTitle>
                    <CardDescription>Are you going flat or spatial?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "2d", label: "2D" },
                        { value: "3d", label: "3D" },
                        { value: "either", label: "Either" },
                      ].map((dim, index) => (
                        <motion.button
                          key={dim.value}
                          type="button"
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border p-6 cursor-pointer transition-all w-full",
                            formData.dimensions === dim.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50",
                          )}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 * index } }}
                          onClick={() => updateFormData("dimensions", dim.value)}
                        >
                          <span className="font-semibold text-sm">{dim.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 6 — Team Size */}
              {currentStep === 6 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-pixel text-sm">Team Size</CardTitle>
                    <CardDescription>Who's making this game?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.teamSize}
                      onValueChange={(val) => updateFormData("teamSize", val)}
                      className="space-y-3"
                    >
                      {[
                        { value: "solo", label: "Solo", desc: "Just me, myself, and I" },
                        { value: "duo", label: "Duo", desc: "Two-person dream team" },
                        { value: "small", label: "Small Team", desc: "3–4 people" },
                        { value: "full", label: "Full Team", desc: "5 or more jammers" },
                      ].map((team, index) => (
                        <motion.div
                          key={team.value}
                          className={cn(
                            "flex items-start space-x-3 rounded-xl border p-4 cursor-pointer transition-colors",
                            formData.teamSize === team.value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "hover:border-primary/50",
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: 0.08 * index } }}
                          onClick={() => updateFormData("teamSize", team.value)}
                        >
                          <RadioGroupItem value={team.value} id={`team-${team.value}`} className="mt-0.5 border-current" />
                          <div>
                            <Label htmlFor={`team-${team.value}`} className="font-semibold cursor-pointer">
                              {team.label}
                            </Label>
                            <p className="text-xs mt-0.5 opacity-70">{team.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between pt-4 pb-5">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-1 rounded-2xl"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center gap-1 rounded-2xl"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
                ) : currentStep === steps.length - 1 ? (
                  <><Check className="h-4 w-4" /> Generate Ideas</>
                ) : (
                  <>Next <ChevronRight className="h-4 w-4" /></>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.div
        className="mt-4 text-center font-pixel text-[10px] text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Step {currentStep + 1} of {steps.length} — {steps[currentStep].title}
      </motion.div>
    </div>
  );
};

export default JamForm;
