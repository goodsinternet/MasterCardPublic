import { motion } from "framer-motion";
import { UploadCloud, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "1. Загрузите фото",
    description: "Загрузите фотографию товара в формате JPEG или PNG в высоком качестве.",
    delay: 0.1,
  },
  {
    icon: Wand2,
    title: "2. Укажите данные",
    description: "Введите название, цену и краткое описание товара для инфографики.",
    delay: 0.2,
  },
  {
    icon: Download,
    title: "3. Скачайте карточку",
    description: "AI создаст продающую карточку с инфографикой. Просто скачайте и публикуйте.",
    delay: 0.3,
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-secondary/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-foreground">
            Как это работает
          </h2>
          <p className="text-xl text-muted-foreground">
            Три простых шага до готовой карточки, которая увеличит ваши продажи.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: step.delay }}
                className="bg-card rounded-3xl p-8 shadow-lg shadow-black/[0.03] border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
              >
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 -right-4 w-8 border-t-2 border-dashed border-primary/30 z-0" />
                )}
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold font-display mb-3 text-foreground">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
