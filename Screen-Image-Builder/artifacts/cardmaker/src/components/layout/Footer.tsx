import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#060609] border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-[15px] text-white/70">CardMaker</span>
          <p className="text-[13px] text-white/30">© 2026 CardMaker. Генератор карточек для маркетплейсов.</p>
          <div className="flex gap-5">
            <Link href="/faq" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">FAQ</Link>
            <a href="#" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Правила</a>
            <Link href="/privacy" className="text-[13px] text-white/30 hover:text-white/60 transition-colors">Конфиденциальность</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
