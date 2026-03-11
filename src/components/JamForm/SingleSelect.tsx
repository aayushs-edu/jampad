import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SingleSelectProps {
  options: string[];
  selected?: string;
  onChange: (selected: string) => void;
  label: string;
  description?: string;
  required?: boolean;
}

const SingleSelect = ({ options, selected, onChange, label, description, required = true }: SingleSelectProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {label}
          {!required && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
          )}
        </h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "px-6 py-4 rounded-lg border-2 transition-all duration-200 text-left",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-lg"
                  : "bg-card border-border hover:border-primary/50 text-foreground hover:shadow-md"
              )}
            >
              <div className="font-medium">{option}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SingleSelect;
