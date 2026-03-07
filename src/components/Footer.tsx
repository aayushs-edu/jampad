import { Gamepad2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <span className="font-pixel text-xs text-foreground">JamPad</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built for game jammers, by game jammers. Ship it! 🚀
        </p>
      </div>
    </footer>
  );
};

export default Footer;
