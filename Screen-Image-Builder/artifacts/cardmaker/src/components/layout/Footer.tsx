import { Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Star className="w-5 h-5 fill-primary/20" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              CardMaker
            </span>
          </div>
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © 2026 CardMaker. Генератор карточек для маркетплейсов.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Правила</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Конфиденциальность</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
