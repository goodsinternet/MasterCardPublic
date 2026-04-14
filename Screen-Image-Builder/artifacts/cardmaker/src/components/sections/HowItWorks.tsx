import { motion } from "framer-motion";
import { UploadCloud, Wand2, Download } from "lucide-react";

const steps = [
  { num: "01", icon: UploadCloud, title: "Загрузите фото",    description: "JPEG или PNG. Поддерживается до 5 изображений товара." },
  { num: "02", icon: Wand2,       title: "Укажите данные",    description: "Выберите маркетплейс, название, цену и описание товара." },
  { num: "03", icon: Download,    title: "Скачайте карточку", description: "AI создаст до 5 вариантов инфографики. Скачайте и публикуйте." },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-32 bg-[#060609] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(77,159,255,0.06)_0%,_transparent_65%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-semibold text-[#4d9fff] mb-4 uppercase tracking-[0.12em]">Процесс</p>
          <h2 className="text-[28px] sm:text-[40px] md:text-[48px] font-bold text-white tracking-[-0.03em] leading-[1.08]">Три шага до результата.</h2>
          <p className="text-[15px] sm:text-[19px] text-white/40 mt-4 max-w-xl mx-auto">Никаких дизайнеров. Никаких шаблонов. Только ваше фото и AI.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass rounded-3xl p-8 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-[48px] font-bold text-white/[0.06] leading-none select-none">{step.num}</span>
                  <div className="w-12 h-12 rounded-2xl bg-[#4d9fff]/15 border border-[#4d9fff]/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#4d9fff]" />
                  </div>
                </div>
                <h3 className="text-[19px] font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
