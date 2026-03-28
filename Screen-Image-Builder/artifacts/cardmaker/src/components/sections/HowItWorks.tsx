import { motion } from "framer-motion";
import { UploadCloud, Wand2, Download } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UploadCloud,
    title: "Загрузите фото",
    description: "Загрузите фотографию товара в JPEG или PNG. Поддерживается до 5 изображений.",
  },
  {
    num: "02",
    icon: Wand2,
    title: "Укажите данные",
    description: "Выберите маркетплейс, введите название, цену и краткое описание товара.",
  },
  {
    num: "03",
    icon: Download,
    title: "Скачайте карточку",
    description: "AI создаст до 5 вариантов карточки с инфографикой. Скачайте и публикуйте.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium text-[#0071e3] mb-3 uppercase tracking-widest">Процесс</p>
          <h2 className="text-[48px] font-bold text-[#1d1d1f] tracking-[-0.03em] leading-[1.08]">
            Три шага до результата.
          </h2>
          <p className="text-[19px] text-[#6e6e73] mt-4 max-w-xl mx-auto">
            Никаких дизайнеров. Никаких шаблонов. Только ваше фото и AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="apple-card apple-card-hover p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[40px] font-bold text-[#f5f5f7] leading-none select-none">{step.num}</span>
                  <div className="w-11 h-11 rounded-2xl bg-[#0071e3] flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">{step.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
