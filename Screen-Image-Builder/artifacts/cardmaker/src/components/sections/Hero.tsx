import { motion } from "framer-motion";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative pt-40 pb-28 overflow-hidden bg-white">
      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_top,_#e8f0fe_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-[#6e6e73] text-[13px] font-medium mb-8 border border-black/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            AI-генерация для маркетплейсов
          </div>

          <h1 className="text-[64px] sm:text-[72px] lg:text-[80px] font-bold text-[#1d1d1f] leading-[1.05] tracking-[-0.035em] mb-6">
            Карточка товара
            <br />
            <span className="text-gradient">за одну минуту.</span>
          </h1>

          <p className="text-[19px] text-[#6e6e73] max-w-[600px] mx-auto leading-relaxed mb-10">
            Загрузите фото — получите готовую карточку с инфографикой для&nbsp;
            <span className="text-[#1d1d1f] font-medium">Wildberries, Ozon</span> и&nbsp;
            <span className="text-[#1d1d1f] font-medium">Яндекс.Маркет</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/generator">
              <button className="px-7 py-3 rounded-full bg-[#0071e3] text-white text-[17px] font-medium hover:bg-[#0077ed] transition-colors shadow-sm">
                Попробовать бесплатно
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-7 py-3 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[17px] font-medium hover:bg-[#e8e8ed] transition-colors">
                Войти в аккаунт
              </button>
            </Link>
          </div>

          <p className="text-[13px] text-[#6e6e73] mt-5">
            3 генерации бесплатно · Без привязки карты
          </p>
        </motion.div>

        {/* Feature highlight cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-20 grid grid-cols-3 gap-4 max-w-2xl mx-auto"
        >
          {[
            { label: "Wildberries", sub: "до 60 симв." },
            { label: "Ozon", sub: "до 200 симв." },
            { label: "Яндекс Маркет", sub: "до 150 симв." },
          ].map(m => (
            <div key={m.label} className="apple-card p-4 text-center">
              <p className="text-[15px] font-semibold text-[#1d1d1f]">{m.label}</p>
              <p className="text-[12px] text-[#6e6e73] mt-0.5">SEO-название {m.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
