import { motion } from "framer-motion";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080810]">
      {/* Light rays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Fan of rays as a single conic gradient — no individual stripes */}
        <div
          className="ray absolute top-0 left-0 right-0 h-full"
          style={{
            background: "conic-gradient(from 270deg at 50% -10%, transparent 0deg, rgba(50,120,255,0.07) 12deg, rgba(77,159,255,0.18) 20deg, rgba(100,180,255,0.10) 28deg, transparent 38deg, transparent 322deg, rgba(100,180,255,0.10) 332deg, rgba(77,159,255,0.18) 340deg, rgba(50,120,255,0.07) 348deg, transparent 360deg)"
          }}
        />
        {/* Deep ambient blue glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[520px]" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(40,100,255,0.18) 0%, transparent 100%)" }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#080810] to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-white/60 text-[13px] font-medium mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4d9fff] shadow-[0_0_6px_#4d9fff]" />
            AI-генерация карточек для маркетплейсов
          </div>

          <h1 className="text-[68px] sm:text-[80px] lg:text-[96px] font-bold text-white leading-[1.0] tracking-[-0.04em] mb-6">
            Карточка товара
            <br />
            <span className="text-glow">за одну минуту.</span>
          </h1>

          <p className="text-[19px] text-white/50 max-w-[560px] mx-auto leading-relaxed mb-12">
            Загрузите фото — получите готовую карточку с инфографикой
            для <span className="text-white/80">Wildberries, Ozon</span> и <span className="text-white/80">Яндекс.Маркет</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link href="/generator">
              <button className="px-8 py-3.5 rounded-full bg-[#4d9fff] text-white text-[17px] font-semibold hover:bg-[#6aaeff] transition-all" style={{ boxShadow: "0 0 0 1px rgba(77,159,255,0.3), 0 0 32px rgba(77,159,255,0.45)" }}>
                Попробовать бесплатно
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-8 py-3.5 rounded-full glass text-white/70 text-[17px] font-medium hover:text-white hover:bg-white/10 transition-all">
                Войти в аккаунт
              </button>
            </Link>
          </div>

          <p className="text-[13px] text-white/30 mt-5">3 генерации бесплатно · Без привязки карты</p>
        </motion.div>

        {/* Marketplace pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 flex items-center justify-center gap-3 flex-wrap"
        >
          {[
            { name: "Wildberries", note: "до 60 симв." },
            { name: "Ozon", note: "до 200 симв." },
            { name: "Яндекс Маркет", note: "до 150 симв." },
          ].map(m => (
            <div key={m.name} className="glass rounded-2xl px-5 py-3.5 text-center min-w-[160px]">
              <p className="text-[15px] font-semibold text-white/90">{m.name}</p>
              <p className="text-[12px] text-white/40 mt-0.5">SEO-название {m.note}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
