import { motion } from "framer-motion";
import { Zap, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Быстро",
    description: "Готовая карточка за 30-60 секунд. Экономьте часы на услугах дизайнеров."
  },
  {
    icon: ImageIcon,
    title: "Премиум качество",
    description: "Студийное освещение, удаление фона и профессиональный дизайн композиции."
  },
  {
    icon: FileText,
    title: "Продающий текст",
    description: "Встроенный AI пишет конверсионные тексты и выделяет главные преимущества."
  },
  {
    icon: LayoutGrid,
    title: "Для всех площадок",
    description: "Идеальные размеры и форматы под стандарты WB, Ozon и Яндекс.Маркет."
  }
];

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-end justify-between mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-4 text-foreground">
              Почему CardMaker?
            </h2>
            <p className="text-xl text-muted-foreground">
              Нейросеть обучена на миллионах топовых товаров маркетплейсов для создания лучшей конверсии.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-6 rounded-3xl bg-secondary/50 border border-transparent hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
