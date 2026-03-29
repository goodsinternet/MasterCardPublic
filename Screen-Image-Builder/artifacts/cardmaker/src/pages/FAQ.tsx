import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  badge?: string;
  answer: React.ReactNode;
}

interface FAQCategory {
  icon: string;
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    icon: "🎨",
    title: "Генерация карточек",
    items: [
      {
        question: "Сколько времени занимает создание одной карточки?",
        answer: (
          <>
            <p><strong className="text-white/90">30–60 секунд.</strong> Это в 20–30 раз быстрее, чем нанимать дизайнера или делать карточку самому в Photoshop. Вы загружаете фото, указываете цену, выбираете маркетплейс — AI делает всё остальное.</p>
          </>
        ),
      },
      {
        question: "Какие форматы фото можно загружать?",
        answer: (
          <>
            <p>Поддерживаются форматы <strong className="text-white/90">JPEG</strong> и <strong className="text-white/90">PNG</strong>. Максимальный размер файла — <strong className="text-white/90">10 МБ</strong>. Можно загрузить до 5 фотографий одного товара, чтобы AI лучше распознал детали.</p>
            <div className="mt-3 p-3 rounded-xl bg-[#ffd60a]/[0.08] border-l-4 border-[#ffd60a]/60 text-[13px] text-white/60">
              💡 <strong className="text-white/80">Совет:</strong> Чем лучше качество исходного фото (чёткое, товар в центре, без посторонних предметов), тем качественнее итоговая карточка.
            </div>
          </>
        ),
      },
      {
        question: "Сколько вариантов карточки я получу?",
        answer: (
          <>
            <p>Сервис генерирует <strong className="text-white/90">до 4 вариантов инфографики</strong> для одного товара. Вы можете:</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-white/55">
              <li>Выбрать лучший вариант и использовать его</li>
              <li>Скачать все варианты и протестировать, какой лучше конвертирует</li>
              <li>Создать заново с изменёнными параметрами (ценой, описанием)</li>
            </ul>
          </>
        ),
      },
      {
        question: "Могу ли я редактировать карточку после генерации?",
        answer: (
          <>
            <p>Прямого редактирования готовой карточки пока нет. Но вы можете:</p>
            <ol className="mt-2 ml-5 list-decimal space-y-1 text-white/55">
              <li>Изменить исходные данные (название, цену, описание, характеристики)</li>
              <li>Нажать «Создать карточку» заново</li>
              <li>AI сгенерирует новый вариант с учётом ваших правок</li>
            </ol>
            <p className="mt-3 text-white/40 text-[13px]">В будущем мы добавим возможность редактировать текст прямо на карточке.</p>
          </>
        ),
      },
      {
        question: "Что такое инфографика и почему она важна?",
        answer: (
          <>
            <p><strong className="text-white/90">Инфографика</strong> — это визуальные элементы на карточке: иконки, бейджи, выделенные характеристики. Она помогает покупателю за 3 секунды понять главные преимущества товара, не читая длинное описание.</p>
            <div className="mt-3 p-3 rounded-xl bg-[#30d158]/[0.08] border-l-4 border-[#30d158]/50 text-[13px] text-white/60">
              📊 Карточки с хорошей инфографикой получают <strong className="text-white/80">на 30–40% больше кликов</strong>.
            </div>
          </>
        ),
      },
    ],
  },
  {
    icon: "🎁",
    title: "Бесплатные и бонусные генерации",
    items: [
      {
        question: "Сколько генераций я получаю при регистрации?",
        answer: (
          <>
            <p>Каждый новый пользователь получает <strong className="text-white/90">3 бесплатные генерации</strong>. Этого достаточно, чтобы:</p>
            <ul className="mt-2 ml-5 list-disc space-y-1 text-white/55">
              <li>Протестировать сервис на 1–3 товарах</li>
              <li>Понять качество работы AI</li>
              <li>Решить, подходит ли вам CardMaker</li>
            </ul>
          </>
        ),
      },
      {
        question: "Как получить бонусные генерации?",
        badge: "⭐ Важно",
        answer: (
          <>
            <p><strong className="text-white/90">Пригласите друга</strong> по вашей реферальной ссылке. Когда друг зарегистрируется, вы получите <strong className="text-white/90">+3 бонусные генерации</strong>. Друг тоже получит свои 3 бесплатные генерации.</p>
            <p className="mt-3"><strong className="text-white/80">Правила:</strong></p>
            <ul className="mt-1 ml-5 list-disc space-y-1 text-white/55">
              <li>Нет ограничений на количество приглашённых</li>
              <li>Каждый новый друг = +3 генерации на ваш счёт</li>
              <li>Друг может ввести ваш реферальный код даже если перешёл не по ссылке</li>
            </ul>
            <div className="mt-3 p-3 rounded-xl bg-[#4d9fff]/[0.08] border-l-4 border-[#4d9fff]/50 text-[13px] text-white/60">
              📍 <strong className="text-white/80">Где взять ссылку?</strong> В личном кабинете → раздел «Партнёрская программа». Там же есть кнопка «Копировать».
            </div>
          </>
        ),
      },
      {
        question: "Сколько можно накопить бонусных генераций?",
        answer: (
          <>
            <p><strong className="text-white/90">Безлимитно.</strong> Вы можете пригласить 10 друзей и получить 30 бонусных генераций, 100 друзей → 300 генераций. Единственное ограничение — каждый друг может зарегистрироваться только один раз.</p>
            <div className="mt-3 p-3 rounded-xl bg-[#ffd60a]/[0.08] border-l-4 border-[#ffd60a]/60 text-[13px] text-white/60">
              💡 <strong className="text-white/80">Совет:</strong> Поделитесь реферальной ссылкой в соцсетях, чатах селлеров, тематических каналах — так вы быстро накопите много генераций.
            </div>
          </>
        ),
      },
      {
        question: "В каком порядке списываются генерации?",
        answer: (
          <>
            <p>Система списывает генерации в следующем порядке:</p>
            <ol className="mt-2 ml-5 list-decimal space-y-1 text-white/55">
              <li><strong className="text-white/80">Сначала бонусные</strong> — полученные за приглашение друзей</li>
              <li><strong className="text-white/80">Потом бесплатные</strong> — 3 при регистрации</li>
              <li><strong className="text-white/80">Затем платные</strong> — купленные пакеты</li>
            </ol>
          </>
        ),
      },
      {
        question: "Что делать, если генерации закончились?",
        answer: (
          <>
            <p>У вас есть несколько вариантов:</p>
            <ol className="mt-2 ml-5 list-decimal space-y-1 text-white/55">
              <li><strong className="text-white/80">Купить пакет</strong> — 5, 10 или 25 генераций по выгодной цене (раздел «Пополнить» в личном кабинете)</li>
              <li><strong className="text-white/80">Пригласить друзей</strong> — получить +3 бонусные генерации за каждого нового пользователя</li>
            </ol>
          </>
        ),
      },
      {
        question: "Могут ли бонусные генерации сгореть?",
        answer: (
          <p><strong className="text-white/90">Нет.</strong> Бонусные генерации, полученные за приглашение друзей, <strong className="text-white/90">не сгорают</strong> и не имеют срока действия. Используйте их в любое время.</p>
        ),
      },
    ],
  },
];

function AccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "glass rounded-2xl border transition-colors duration-200",
        open ? "border-[#4d9fff]/30" : "border-white/[0.07] hover:border-white/[0.14]"
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[15px] font-semibold text-white/90 flex-1">
          {item.question}
          {item.badge && (
            <span className="ml-2 text-[11px] font-bold text-[#ffd60a] bg-[#ffd60a]/10 px-2 py-0.5 rounded-full align-middle">
              {item.badge}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 text-[#4d9fff] shrink-0 transition-transform duration-300", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 text-[14px] text-white/55 leading-relaxed border-t border-white/[0.07] space-y-2">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#080810]">
      {/* Nav */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[16px] text-white/80 tracking-[-0.01em]">CardMaker</Link>
          <div className="flex items-center gap-3">
            <Link href="/auth">
              <button className="text-[14px] text-white/50 hover:text-white/80 transition-colors">Войти</button>
            </Link>
            <Link href="/generator">
              <button className="px-4 py-1.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium hover:bg-[#6aaeff] transition-colors">
                Попробовать
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[13px] font-semibold text-[#4d9fff] mb-4 uppercase tracking-[0.12em]">Поддержка</p>
          <h1 className="text-[42px] sm:text-[52px] font-bold text-white tracking-[-0.03em] leading-[1.08] mb-4">
            Часто задаваемые<br />вопросы
          </h1>
          <p className="text-[18px] text-white/40 max-w-lg mx-auto">
            Всё о генерации карточек, бонусах и партнёрской программе
          </p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-col gap-12">
          {FAQ_DATA.map((cat, ci) => (
            <motion.div
              key={ci}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: ci * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/[0.07]">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="text-[20px] font-bold text-white/90">{cat.title}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {cat.items.map((item, ii) => (
                  <AccordionItem key={ii} item={item} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 glass rounded-3xl p-8 text-center"
        >
          <p className="text-[17px] font-semibold text-white/90 mb-2">Остались вопросы?</p>
          <p className="text-[14px] text-white/40 mb-6">Попробуйте сервис — 3 генерации бесплатно, без привязки карты.</p>
          <Link href="/generator">
            <button className="px-7 py-3 rounded-full bg-[#4d9fff] text-white text-[15px] font-semibold hover:bg-[#6aaeff] transition-colors" style={{ boxShadow: "0 0 24px rgba(77,159,255,0.35)" }}>
              Попробовать бесплатно
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
