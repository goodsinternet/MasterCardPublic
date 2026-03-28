import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-primary via-indigo-600 to-purple-800 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl shadow-primary/30 relative overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4">
              Готовы создать карточку?
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Бесплатные пробные генерации — без регистрации и привязки карты. Оцените качество нейросети прямо сейчас.
            </p>
            
            <Link href="/generator">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
                Попробовать бесплатно →
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
