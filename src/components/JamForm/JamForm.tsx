import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import FormProgress from "./FormProgress";
import SingleSelect from "./SingleSelect";
import MultiSelect from "./MultiSelect";
import {
  JamSubmission,
  TIME_OPTIONS,
  SKILL_LEVELS,
  ENGINES,
  GAME_TYPES,
  DIMENSIONS,
  TEAM_SIZES,
  MAIN_GOALS,
  SCOPE_PREFERENCES,
  MECHANICS,
} from "@/types/jamSubmission";

interface JamFormProps {
  initialTheme: string;
  onComplete: (submission: JamSubmission) => void;
  onBack: () => void;
}

const JamForm = ({ initialTheme, onComplete, onBack }: JamFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JamSubmission>({
    theme: initialTheme,
    game_types: [],
    mechanics_enjoy: [],
    mechanics_avoid: [],
  });

  const totalSteps = 11;

  const updateFormData = (field: keyof JamSubmission, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.theme;
      case 2:
        return !!formData.time_available;
      case 3:
        return !!formData.skill_level;
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const slideVariants = {
      enter: { opacity: 0, x: 50 },
      center: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -50 },
    };

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Jam Theme</h3>
                <p className="text-sm text-muted-foreground">What's the theme for this jam?</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => updateFormData("theme", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-primary/50 bg-card text-foreground text-lg font-semibold focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Time, Shadows, Connections..."
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Time Available"
              description="How much time do you have for this jam?"
              options={TIME_OPTIONS}
              selected={formData.time_available}
              onChange={(value) => updateFormData("time_available", value)}
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Skill Level"
              description="How would you rate your game development experience?"
              options={SKILL_LEVELS}
              selected={formData.skill_level}
              onChange={(value) => updateFormData("skill_level", value)}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Engine / Toolset"
              description="What will you be using to build your game?"
              options={ENGINES}
              selected={formData.engine}
              onChange={(value) => updateFormData("engine", value)}
              required={false}
            />
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <MultiSelect
              label="Preferred Game Type"
              description="What types of games do you enjoy making? (Optional, select all that apply)"
              options={GAME_TYPES}
              selected={formData.game_types || []}
              onChange={(value) => updateFormData("game_types", value)}
            />
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="2D or 3D"
              description="What dimension are you working in?"
              options={DIMENSIONS}
              selected={formData.dimension}
              onChange={(value) => updateFormData("dimension", value)}
              required={false}
            />
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            key="step7"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Team Size"
              description="How many people are working on this?"
              options={TEAM_SIZES}
              selected={formData.team_size}
              onChange={(value) => updateFormData("team_size", value)}
              required={false}
            />
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            key="step8"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Main Goal for This Jam"
              description="What's most important to you?"
              options={MAIN_GOALS}
              selected={formData.main_goal}
              onChange={(value) => updateFormData("main_goal", value)}
              required={false}
            />
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            key="step9"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <SingleSelect
              label="Scope Preference"
              description="How ambitious do you want to be?"
              options={SCOPE_PREFERENCES}
              selected={formData.scope_preference}
              onChange={(value) => updateFormData("scope_preference", value)}
              required={false}
            />
          </motion.div>
        );

      case 10:
        return (
          <motion.div
            key="step10"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <MultiSelect
              label="Mechanics I Enjoy Building"
              description="What do you like working on? (Optional, select all that apply)"
              options={MECHANICS}
              selected={formData.mechanics_enjoy || []}
              onChange={(value) => updateFormData("mechanics_enjoy", value)}
            />
          </motion.div>
        );

      case 11:
        return (
          <motion.div
            key="step11"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <MultiSelect
              label="Mechanics I Want to Avoid"
              description="What should we steer clear of? (Optional, select all that apply)"
              options={MECHANICS}
              selected={formData.mechanics_avoid || []}
              onChange={(value) => updateFormData("mechanics_avoid", value)}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
          <FormProgress currentStep={currentStep} totalSteps={totalSteps} />

          <div className="min-h-[400px] flex items-center justify-center py-6">
            <div className="w-full">
              <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {currentStep === totalSteps ? (
                <>
                  Generate Ideas
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JamForm;
