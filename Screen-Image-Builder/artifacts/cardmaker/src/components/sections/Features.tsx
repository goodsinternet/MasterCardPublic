import { motion } from "framer-motion";
import { Zap, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";

const features = [
  {
    icon: Zap,
    color: "#0071e3",
    bg: "#f0f6ff",
    title: "Быстро",
    description: "Готовая карточка за 30–60 секунд. Экономьте часы на услугах дизайнеров.",
  },
  {
    icon: ImageIcon,
    color: "#30d158",
    bg: "#f0faf3",
    title: "Премиум качество",
    description: "Студийное освещение, профессиональная инфографика и продуманная композиция.",
  },
  {
    icon: FileText,
    color: "#ff9f0a",
    bg: "#fff8ed",
    title: "Продающий текст",
    description: "GPT‑4o пишет SEO-описания, выделяет ключевые преимущества под каждую площадку.",
  },
  {
    icon: LayoutGrid,
    color: "#bf5af2",
    bg: "#f9f0ff",
    title: "Все площадки",
    description: "Идеальные форматы под стандарты WB, Ozon и Яндекс.Маркет.",
  },
];

export function Features() {
  return (
    <section className="py-28 bg-[#f5f5f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-medium text-[#0071e3] mb-3 uppercase tracking-widest">Возможности</p>
          <h2 className="text-[48px] font-bold text-[#1d1d1f] tracking-[-0.03em] leading-[1.08]">
            Почему CardMaker?
          </h2>
          <p className="text-[19px] text-[#6e6e73] mt-4 max-w-xl mx-auto">
            Нейросеть обучена на миллионах топовых карточек маркетплейсов.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="apple-card apple-card-hover p-6"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: feature.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-2">{feature.title}</h3>
                <p className="text-[14px] text-[#6e6e73] leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
