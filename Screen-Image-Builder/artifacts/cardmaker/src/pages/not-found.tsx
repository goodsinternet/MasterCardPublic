import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold font-display text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Кажется, вы заблудились. Такой страницы не существует.
        </p>
        <Link href="/">
          <Button size="lg">Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  );
}
