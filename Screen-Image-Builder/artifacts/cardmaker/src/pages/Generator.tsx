import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Star, ArrowLeft, Upload, ImageIcon, X, Download, Loader2, Globe, ShoppingBag, Package, Sparkles, CheckCircle2, Images } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { api, isLoggedIn, type GenerateResult } from "@/lib/api";

const MARKETPLACES = [
  { id: "universal", label: "Универсальная", icon: Globe, color: "text-blue-500" },
  { id: "wildberries", label: "Wildberries", icon: ShoppingBag, color: "text-purple-600" },
  { id: "ozon", label: "Ozon", icon: ShoppingBag, color: "text-blue-600" },
  { id: "yandex", label: "Яндекс Маркет", icon: Package, color: "text-yellow-500" },
];

const INFOGRAPHIC_LABELS = [
  "Размеры",
  "Преимущества",
  "Материалы",
  "Применение",
  "Рейтинг",
];

type TabId = "data" | "result";

export default function Generator() {
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [marketplace, setMarketplace] = useState("universal");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageCount, setImageCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoggedIn()) navigate("/auth");
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setResult(null);
    setError("");

    const reader = new FileReader();
    reader.onload = e => {
      const base64 = (e.target?.result as string).split(",")[1];
      setImageBase64(base64 ?? "");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !imageBase64) return;
    setIsGenerating(true);
    setError("");
    setActiveImageIndex(0);
    try {
      const res = await api.generate.create({
        imageBase64,
        price,
        marketplace,
        productName,
        description,
        imageCount,
      });
      setResult(res);
      setActiveTab("result");
    } catch (err: any) {
      setError(err.message ?? "Ошибка генерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedMarketplace = MARKETPLACES.find(m => m.id === marketplace)!;

  const resultImages = result?.imageUrls ?? (result?.imageUrl ? [result.imageUrl] : []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <header className="bg-white border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            На главную
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Star className="w-4 h-4 fill-white/20" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">CardMaker</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Кабинет
          </Link>
        </div>
      </header>

      <div className="bg-white border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Генератор карточек</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Загрузите фото и получите готовую карточку для маркетплейса</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Tabs */}
            <div className="flex rounded-xl bg-white border border-border/40 p-1 shadow-sm">
              {[
                { id: "data" as TabId, label: "Данные товара", icon: "📦" },
                { id: "result" as TabId, label: "Результат", icon: result ? "✅" : "💫", disabled: !result },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : tab.disabled
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "data" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                {/* Photo Upload */}
                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Фото товара</h2>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileInput} />
                  {uploadedImage ? (
                    <div className="relative rounded-xl overflow-hidden bg-secondary/30 aspect-video flex items-center justify-center">
                      <img src={uploadedImage} alt="Фото товара" className="max-h-52 max-w-full object-contain" />
                      <button
                        onClick={() => { setUploadedImage(null); setImageBase64(""); setResult(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-border/40 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[160px]",
                        isDragging
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : "border-primary/30 bg-primary/3 hover:border-primary/60 hover:bg-primary/5"
                      )}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                        <ImageIcon className="w-7 h-7 text-primary" />
                      </div>
                      <p className="font-medium text-sm">Перетащите фото или нажмите для выбора</p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG до 10 МБ</p>
                    </div>
                  )}
                </div>

                {/* Marketplace */}
                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Маркетплейс</h2>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-sm font-medium",
                        dropdownOpen ? "border-primary ring-2 ring-primary/20 bg-white" : "border-border/50 hover:border-primary/50 bg-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <selectedMarketplace.icon className={cn("w-4 h-4", selectedMarketplace.color)} />
                        <span>{selectedMarketplace.label}</span>
                      </div>
                      <svg className={cn("w-4 h-4 text-muted-foreground transition-transform", dropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border border-border/40 rounded-xl shadow-lg z-10 overflow-hidden"
                        >
                          {MARKETPLACES.map(m => (
                            <button
                              key={m.id}
                              onClick={() => { setMarketplace(m.id); setDropdownOpen(false); }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left",
                                marketplace === m.id ? "bg-primary/10 text-primary" : "hover:bg-secondary/50 text-foreground"
                              )}
                            >
                              {marketplace === m.id && <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />}
                              {marketplace !== m.id && <span className="w-4 h-4 shrink-0 border border-border/50 rounded" />}
                              <m.icon className={cn("w-4 h-4 shrink-0", m.color)} />
                              {m.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Карточка будет оптимизирована под выбранный маркетплейс с SEO-описанием</p>
                </div>

                {/* Product Data */}
                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Данные товара</h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Название товара</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        placeholder="Например: Беспроводные наушники TWS Pro"
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Цена (₽)</label>
                      <input
                        type="text"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="2 990"
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Описание / особенности</label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Ключевые преимущества, особенности товара..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white placeholder:text-muted-foreground/60 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Count */}
                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Images className="w-5 h-5 text-primary" />
                    <h2 className="font-semibold">Количество изображений</h2>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setImageCount(n)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-150",
                          imageCount === n
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Каждое изображение — уникальный вариант инфографики: {Array.from({ length: imageCount }, (_, i) => INFOGRAPHIC_LABELS[i]).join(", ")}
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!uploadedImage || isGenerating}
                  className={cn(
                    "w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg",
                    uploadedImage && !isGenerating
                      ? "bg-gradient-to-r from-primary to-indigo-600 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      : "bg-muted-foreground/30 cursor-not-allowed shadow-none"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Создаю {imageCount} {imageCount === 1 ? "карточку" : imageCount < 5 ? "карточки" : "карточек"}... (может занять до минуты)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Создать {imageCount === 1 ? "карточку" : `${imageCount} карточки`}
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {activeTab === "result" && result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h2 className="font-semibold">Название</h2>
                  </div>
                  <p className="text-sm font-medium">{result.productName}</p>
                </div>

                <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                  <h2 className="font-semibold mb-3">Описание</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.description}</p>
                </div>

                {result.characteristics && (
                  <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                    <h2 className="font-semibold mb-3">Характеристики</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.characteristics}</p>
                  </div>
                )}

                {result.keywords && (
                  <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                    <h2 className="font-semibold mb-3">Ключевые слова</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.keywords}</p>
                  </div>
                )}

                {result.category && (
                  <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                    <h2 className="font-semibold mb-2">Категория</h2>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {result.category}
                    </span>
                  </div>
                )}

                {result.seoTips && (
                  <div className="bg-white rounded-2xl border border-border/40 p-5 shadow-sm">
                    <h2 className="font-semibold mb-3">SEO-советы</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{result.seoTips}</p>
                  </div>
                )}

                <button
                  onClick={() => { setActiveTab("data"); setResult(null); setUploadedImage(null); setImageBase64(""); }}
                  className="w-full py-3 rounded-2xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  Создать новую карточку
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column — Image Result */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-border/40 shadow-sm sticky top-24">
              <div className="p-5 border-b border-border/30 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">Изображения карточек</h2>
                {resultImages.length > 1 && (
                  <span className="ml-auto text-xs text-muted-foreground font-medium">{activeImageIndex + 1} / {resultImages.length}</span>
                )}
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Создаю карточки...</p>
                        <p className="text-xs text-muted-foreground mt-1">Генерирую {imageCount} вариант{imageCount === 1 ? "" : imageCount < 5 ? "а" : "ов"} с инфографикой</p>
                      </div>
                    </motion.div>
                  ) : resultImages.length > 0 ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
                      <div className="rounded-xl overflow-hidden border border-border/30 bg-secondary/20">
                        <img src={resultImages[activeImageIndex]} alt={`Вариант ${activeImageIndex + 1}`} className="w-full object-contain max-h-72" />
                      </div>

                      {resultImages.length > 1 && (
                        <div className="flex gap-2">
                          {resultImages.map((url, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              className={cn(
                                "flex-1 rounded-lg overflow-hidden border-2 transition-all duration-150 aspect-square",
                                i === activeImageIndex ? "border-primary shadow-sm" : "border-border/30 hover:border-primary/50"
                              )}
                            >
                              <img src={url} alt={`Вариант ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        {resultImages.length > 1 && (
                          <p className="text-xs text-center text-muted-foreground font-medium">
                            {INFOGRAPHIC_LABELS[activeImageIndex]} — вариант {activeImageIndex + 1}
                          </p>
                        )}
                        <a
                          href={resultImages[activeImageIndex]}
                          download={`cardmaker-${result?.id}-v${activeImageIndex + 1}.png`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Скачать{resultImages.length > 1 ? ` вариант ${activeImageIndex + 1}` : " карточку"}
                        </a>
                        {resultImages.length > 1 && (
                          <button
                            onClick={async () => {
                              for (let i = 0; i < resultImages.length; i++) {
                                const a = document.createElement("a");
                                a.href = resultImages[i];
                                a.download = `cardmaker-${result?.id}-v${i + 1}.png`;
                                a.target = "_blank";
                                a.click();
                                await new Promise(r => setTimeout(r, 300));
                              }
                            }}
                            className="w-full py-2.5 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Скачать все ({resultImages.length})
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-secondary/60 flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        Загрузите фото и нажмите «Создать карточку»
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
