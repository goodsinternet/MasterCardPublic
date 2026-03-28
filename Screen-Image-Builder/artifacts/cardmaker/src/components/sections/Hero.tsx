import { motion } from "framer-motion";
import { Link } from "wouter";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080810]">
      {/* Light rays — like in the reference */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central glow orb */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(ellipse,_rgba(40,100,255,0.25)_0%,_transparent_70%)]" />

        {/* Ray 1 — wide left */}
        <div className="ray absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-[90vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(77,159,255,0.9) 0%, rgba(77,159,255,0) 100%)", transform: "translateX(-50%) rotate(-28deg)", transformOrigin: "top center" }} />
        {/* Ray 2 */}
        <div className="ray-2 absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[85vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(100,180,255,0.7) 0%, rgba(100,180,255,0) 100%)", transform: "translateX(-50%) rotate(-14deg)", transformOrigin: "top center" }} />
        {/* Ray 4 */}
        <div className="ray-3 absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[80vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(77,159,255,0.6) 0%, rgba(77,159,255,0) 100%)", transform: "translateX(-50%) rotate(14deg)", transformOrigin: "top center" }} />
        {/* Ray 5 — wide right */}
        <div className="ray-2 absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-[90vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(77,159,255,0.9) 0%, rgba(77,159,255,0) 100%)", transform: "translateX(-50%) rotate(28deg)", transformOrigin: "top center" }} />
        {/* Ray 6 — far left subtle */}
        <div className="ray-3 absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[70vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(60,130,255,0.5) 0%, rgba(60,130,255,0) 100%)", transform: "translateX(-50%) rotate(-42deg)", transformOrigin: "top center" }} />
        {/* Ray 7 — far right subtle */}
        <div className="ray absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-[70vh] origin-top"
          style={{ background: "linear-gradient(to bottom, rgba(60,130,255,0.5) 0%, rgba(60,130,255,0) 100%)", transform: "translateX(-50%) rotate(42deg)", transformOrigin: "top center" }} />

        {/* Horizontal glow band at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4d9fff]/60 to-transparent" />
        {/* Bottom ambient */}
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
              <button className="px-8 py-3.5 rounded-full bg-[#4d9fff] text-white text-[17px] font-semibold hover:bg-[#6aaeff] transition-all glow-blue shadow-[0_0_40px_rgba(77,159,255,0.4)]">
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
