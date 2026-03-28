import { motion } from "framer-motion";
import { Link } from "wouter";

export function CTA() {
  return (
    <section className="py-32 bg-[#080810] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-[radial-gradient(ellipse,_rgba(50,120,255,0.18)_0%,_transparent_65%)]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[13px] font-semibold text-[#4d9fff] mb-5 uppercase tracking-[0.12em]">Начать бесплатно</p>
          <h2 className="text-[52px] font-bold text-white tracking-[-0.035em] leading-[1.06] mb-5">
            Создайте первую карточку
            <br /><span className="text-glow">прямо сейчас.</span>
          </h2>
          <p className="text-[19px] text-white/45 mb-12 max-w-xl mx-auto">
            3 бесплатные генерации при регистрации. Привязка карты не нужна.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/generator">
              <button className="px-8 py-3.5 rounded-full bg-[#4d9fff] text-white text-[17px] font-semibold hover:bg-[#6aaeff] transition-all shadow-[0_0_40px_rgba(77,159,255,0.45)]">
                Попробовать бесплатно
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-8 py-3.5 rounded-full glass text-white/70 text-[17px] font-medium hover:text-white hover:bg-white/10 transition-all">
                Создать аккаунт
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-12">
            {[
              { val: "< 60с", label: "Время генерации" },
              { val: "5",     label: "Вариантов карточки" },
              { val: "3",     label: "Маркетплейса" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-[32px] font-bold text-white tracking-[-0.03em]">{s.val}</p>
                <p className="text-[13px] text-white/35 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
