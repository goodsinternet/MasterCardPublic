import { motion } from "framer-motion";
import { Zap, Image as ImageIcon, FileText, LayoutGrid } from "lucide-react";

const features = [
  { icon: Zap,        color: "#4d9fff", title: "Быстро",           description: "Готовая карточка за 30–60 секунд. Экономьте часы на дизайнерах." },
  { icon: ImageIcon,  color: "#30d158", title: "Премиум качество", description: "Студийное освещение, профессиональная инфографика, чистая композиция." },
  { icon: FileText,   color: "#ffd60a", title: "Продающий текст",  description: "AI пишет SEO-описания с ключевыми словами под каждую площадку." },
  { icon: LayoutGrid, color: "#bf5af2", title: "Все площадки",     description: "Идеальные форматы под стандарты WB, Ozon и Яндекс.Маркет." },
];

export function Features() {
  return (
    <section className="py-32 bg-[#080810] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_rgba(30,70,200,0.12)_0%,_transparent_70%)]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-[13px] font-semibold text-[#4d9fff] mb-4 uppercase tracking-[0.12em]">Возможности</p>
          <h2 className="text-[48px] font-bold text-white tracking-[-0.03em] leading-[1.08]">Почему CardMaker?</h2>
          <p className="text-[19px] text-white/40 mt-4 max-w-xl mx-auto">
            Нейросеть обучена на миллионах топовых карточек маркетплейсов.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="glass rounded-3xl p-6 hover:bg-white/[0.07] transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}18`, boxShadow: `0 0 20px ${f.color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-[17px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[14px] text-white/45 leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
