import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] opacity-30 mix-blend-multiply pointer-events-none">
         <img 
            src={`${import.meta.env.BASE_URL}images/mesh-bg.png`} 
            alt="" 
            className="w-full h-full object-cover"
         />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>AI-генерация карточек для маркетплейсов</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-[1.1] mb-6 text-foreground">
              Карточка товара <br/>
              <span className="text-gradient">за минуту</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Загрузите фото товара — получите готовую продающую карточку с инфографикой для Wildberries, Ozon и Яндекс.Маркет.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/generator">
                <Button size="lg" className="group">
                  Создать карточку
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Войти в аккаунт
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-secondary flex items-center justify-center">
                    <span className="text-[10px] text-primary">AI</span>
                  </div>
                ))}
              </div>
              <p>Уже создано более 100,000+ карточек</p>
            </div>
          </motion.div>

          {/* Visual/Image Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-square animate-float">
              {/* Decorative blur blob behind image */}
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full mix-blend-multiply"></div>
              <img
                src={`${import.meta.env.BASE_URL}images/hero-graphic.png`}
                alt="AI Card Generation Graphic"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
