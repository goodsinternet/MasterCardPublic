export function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f5f5f7]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold text-[15px] text-[#1d1d1f]">CardMaker</span>
          <p className="text-[13px] text-[#6e6e73]">© 2026 CardMaker. Генератор карточек для маркетплейсов.</p>
          <div className="flex gap-5">
            <a href="#" className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Правила</a>
            <a href="#" className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">Конфиденциальность</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
