import { motion } from "framer-motion";
import { Link } from "wouter";

export function CTA() {
  return (
    <section className="py-28 bg-[#f5f5f7]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-[13px] font-medium text-[#0071e3] mb-4 uppercase tracking-widest">Начать бесплатно</p>
          <h2 className="text-[48px] font-bold text-[#1d1d1f] tracking-[-0.03em] leading-[1.08] mb-5">
            Создайте первую
            <br />карточку прямо сейчас.
          </h2>
          <p className="text-[19px] text-[#6e6e73] mb-10 max-w-xl mx-auto">
            3 бесплатные генерации при регистрации. Привязка карты не нужна.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/generator">
              <button className="px-7 py-3 rounded-full bg-[#0071e3] text-white text-[17px] font-medium hover:bg-[#0077ed] transition-colors shadow-sm">
                Попробовать бесплатно
              </button>
            </Link>
            <Link href="/auth">
              <button className="px-7 py-3 rounded-full bg-white text-[#1d1d1f] text-[17px] font-medium hover:bg-[#e8e8ed] transition-colors border border-black/[0.08]">
                Создать аккаунт
              </button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-10 text-center">
            {[
              { val: "< 60с", label: "Время генерации" },
              { val: "5", label: "Вариантов карточки" },
              { val: "3", label: "Маркетплейса" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[28px] font-bold text-[#1d1d1f] tracking-[-0.02em]">{s.val}</p>
                <p className="text-[13px] text-[#6e6e73] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
