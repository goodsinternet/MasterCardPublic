import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Upload, ImageIcon, X, Download, Loader2, ChevronLeft, ChevronRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { api, isLoggedIn, type GenerateResult } from "@/lib/api";

const MARKETPLACES = [
  { id: "wildberries", label: "Wildberries" },
  { id: "ozon", label: "Ozon" },
  { id: "yandex", label: "Яндекс Маркет" },
  { id: "universal", label: "Универсальная" },
];

const inputCls = "w-full px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] text-[15px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#4d9fff]/60 focus:ring-3 focus:ring-[#4d9fff]/15 transition-all";
type TabId = "data" | "result";

async function svgToPng(svgDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, 1000, 1000);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = svgDataUrl;
  });
}

async function downloadAsPng(url: string, filename: string) {
  let href = url;
  if (url.startsWith("data:image/svg")) {
    href = await svgToPng(url);
  } else if (url.startsWith("http")) {
    // Fetch external URL via blob to force download
    const res = await fetch(url);
    const blob = await res.blob();
    href = URL.createObjectURL(blob);
  }
  const a = document.createElement("a");
  a.href = href;
  a.download = filename.endsWith(".png") ? filename : filename + ".png";
  a.click();
  if (href.startsWith("blob:")) URL.revokeObjectURL(href);
}

export default function Generator() {
  const [activeTab, setActiveTab] = useState<TabId>("data");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [marketplace, setMarketplace] = useState("wildberries");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageCount, setImageCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!isLoggedIn()) navigate("/auth"); }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploadedImage(URL.createObjectURL(file));
    setResult(null);
    setError("");
    const reader = new FileReader();
    reader.onload = e => setImageBase64((e.target?.result as string).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleGenerate = async () => {
    if (!uploadedImage || !imageBase64) return;
    setIsGenerating(true);
    setError("");
    setActiveImageIndex(0);
    try {
      const res = await api.generate.create({ imageBase64, price, marketplace, productName, description, imageCount });
      setResult(res);
      setActiveTab("result");
    } catch (err: any) {
      setError(err.message ?? "Ошибка генерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const resultImages = result?.imageUrls ?? (result?.imageUrl ? [result.imageUrl] : []);

  return (
    <div className="min-h-screen bg-[#080810]">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-[14px] text-white/50 hover:text-white/90 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Назад
          </Link>
          <span className="font-semibold text-[16px] text-white/80 tracking-[-0.01em]">CardMaker</span>
          <Link href="/dashboard" className="text-[14px] font-medium text-[#4d9fff] hover:text-[#7ec4ff] transition-colors">
            Кабинет
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold text-white tracking-[-0.025em]">Генератор карточек</h1>
          <p className="text-[15px] text-white/40 mt-1">Загрузите фото — AI создаст карточку для маркетплейса</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Tabs */}
            <div className="flex glass rounded-2xl p-1">
              {([["data", "Данные товара"], ["result", result ? "Результат ✓" : "Результат"]] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => (id !== "result" || result) && setActiveTab(id)}
                  disabled={id === "result" && !result}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-all",
                    activeTab === id
                      ? "bg-[#4d9fff] text-white shadow-sm"
                      : result || id !== "result"
                        ? "text-white/45 hover:text-white/80"
                        : "text-white/20 cursor-not-allowed"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === "data" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
                {/* Upload */}
                <div className="glass rounded-3xl p-5">
                  <h2 className="text-[15px] font-semibold text-white/90 mb-4">Фото товара</h2>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                  {uploadedImage ? (
                    <div className="relative rounded-2xl overflow-hidden bg-white/[0.04] aspect-video flex items-center justify-center">
                      <img src={uploadedImage} alt="" className="max-h-52 max-w-full object-contain" />
                      <button onClick={() => { setUploadedImage(null); setImageBase64(""); setResult(null); }} className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]",
                        isDragging ? "border-[#4d9fff]/60 bg-[#4d9fff]/10" : "border-white/[0.1] hover:border-[#4d9fff]/40 hover:bg-white/[0.03]"
                      )}
                    >
                      <Upload className="w-8 h-8 text-white/25 mb-3" />
                      <p className="text-[14px] font-medium text-white/60">Перетащите фото или нажмите</p>
                      <p className="text-[12px] text-white/30 mt-1">JPEG, PNG, WebP · до 10 МБ</p>
                    </div>
                  )}
                </div>

                {/* Marketplace */}
                <div className="glass rounded-3xl p-5">
                  <h2 className="text-[15px] font-semibold text-white/90 mb-3">Маркетплейс</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKETPLACES.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMarketplace(m.id)}
                        className={cn(
                          "py-2.5 px-4 rounded-xl text-[14px] font-medium transition-all border",
                          marketplace === m.id
                            ? "bg-[#4d9fff] text-white border-[#4d9fff] shadow-[0_0_16px_rgba(77,159,255,0.3)]"
                            : "border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/[0.15] hover:bg-white/[0.04]"
                        )}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                <div className="glass rounded-3xl p-5 flex flex-col gap-4">
                  <h2 className="text-[15px] font-semibold text-white/90">Данные товара</h2>
                  {[
                    { label: "Название товара", value: productName, setter: setProductName, placeholder: "Беспроводные наушники TWS Pro", type: "text" },
                    { label: "Цена (₽)", value: price, setter: setPrice, placeholder: "2 990", type: "text" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[13px] font-medium text-white/50 mb-1.5">{f.label}</label>
                      <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className={inputCls} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[13px] font-medium text-white/50 mb-1.5">Описание / особенности</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Ключевые преимущества..." rows={3} className={cn(inputCls, "resize-none")} />
                  </div>
                </div>

                {/* Count */}
                <div className="glass rounded-3xl p-5">
                  <h2 className="text-[15px] font-semibold text-white/90 mb-1">Количество вариантов</h2>
                  <p className="text-[13px] text-white/35 mb-4">Каждый — уникальный стиль инфографики</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setImageCount(n)}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-[15px] font-semibold transition-all",
                          imageCount === n
                            ? "bg-[#4d9fff] text-white shadow-[0_0_16px_rgba(77,159,255,0.3)]"
                            : "bg-white/[0.05] text-white/40 hover:bg-white/[0.09] hover:text-white/70"
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-[13px] text-red-400">{error}</div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!uploadedImage || isGenerating}
                  className={cn(
                    "w-full py-3.5 rounded-full text-white text-[16px] font-semibold flex items-center justify-center gap-2 transition-all",
                    uploadedImage && !isGenerating
                      ? "bg-[#4d9fff] hover:bg-[#6aaeff] shadow-[0_0_40px_rgba(77,159,255,0.4)]"
                      : "bg-white/[0.08] text-white/25 cursor-not-allowed"
                  )}
                >
                  {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Создаю карточки…</> : <><Sparkles className="w-5 h-5" /> Создать {imageCount === 1 ? "карточку" : `${imageCount} варианта`}</>}
                </button>
              </motion.div>
            )}

            {activeTab === "result" && result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4">
                {[
                  { label: "Название", val: result.productName },
                  { label: "Описание", val: result.description },
                  result.characteristics && { label: "Характеристики", val: result.characteristics },
                  result.keywords && { label: "Ключевые слова", val: result.keywords },
                  result.seoTips && { label: "SEO-советы", val: result.seoTips },
                ].filter(Boolean).map((item: any) => (
                  <div key={item.label} className="glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                      <h3 className="text-[14px] font-semibold text-white/80">{item.label}</h3>
                    </div>
                    <p className="text-[14px] text-white/50 leading-relaxed whitespace-pre-wrap">{item.val}</p>
                  </div>
                ))}
                {result.category && (
                  <div className="glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-[#30d158]" /><h3 className="text-[14px] font-semibold text-white/80">Категория</h3></div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#4d9fff]/15 text-[#4d9fff] text-[13px] font-medium">{result.category}</span>
                  </div>
                )}
                <button onClick={() => { setActiveTab("data"); setResult(null); setUploadedImage(null); setImageBase64(""); }} className="w-full py-3 rounded-full border border-white/[0.1] text-[15px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors">
                  Создать новую карточку
                </button>
              </motion.div>
            )}
          </div>

          {/* Right — Image panel */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <div className="glass rounded-3xl sticky top-20 overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-white/40" />
                <h2 className="text-[15px] font-semibold text-white/80">Изображения</h2>
                {resultImages.length > 1 && (
                  <span className="ml-auto text-[13px] text-white/35">{activeImageIndex + 1} / {resultImages.length}</span>
                )}
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 gap-4">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
                        <div className="absolute inset-0 rounded-full border-[3px] border-[#4d9fff] border-t-transparent animate-spin" />
                      </div>
                      <div className="text-center">
                        <p className="text-[15px] font-semibold text-white/80">Создаю карточки…</p>
                        <p className="text-[12px] text-white/35 mt-1">Анализирую товар и формирую дизайн</p>
                      </div>
                    </motion.div>
                  ) : resultImages.length > 0 ? (
                    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                      <div className="relative rounded-2xl overflow-hidden bg-white/[0.04] group">
                        <img src={resultImages[activeImageIndex]} alt="" className="w-full object-contain max-h-72" />
                        {resultImages.length > 1 && (
                          <>
                            <button onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))} disabled={activeImageIndex === 0} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none">
                              <ChevronLeft className="w-5 h-5 text-white" />
                            </button>
                            <button onClick={() => setActiveImageIndex(i => Math.min(resultImages.length - 1, i + 1))} disabled={activeImageIndex === resultImages.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-all disabled:opacity-0 disabled:pointer-events-none">
                              <ChevronRight className="w-5 h-5 text-white" />
                            </button>
                            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {resultImages.map((_, i) => (
                                <button key={i} onClick={() => setActiveImageIndex(i)} className={cn("h-1.5 rounded-full transition-all", i === activeImageIndex ? "w-5 bg-[#4d9fff]" : "w-1.5 bg-white/30")} />
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {resultImages.length > 1 && (
                        <div className="flex gap-2">
                          {resultImages.map((url, i) => (
                            <button key={i} onClick={() => setActiveImageIndex(i)} className={cn("flex-1 rounded-xl overflow-hidden border-2 aspect-square transition-all", i === activeImageIndex ? "border-[#4d9fff]" : "border-white/10 hover:border-[#4d9fff]/40")}>
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}

                      <button onClick={() => downloadAsPng(resultImages[activeImageIndex], `cardmaker-v${activeImageIndex + 1}.png`)} className="w-full py-2.5 rounded-full bg-[#4d9fff] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#6aaeff] transition-colors">
                        <Download className="w-4 h-4" />
                        Скачать{resultImages.length > 1 ? ` вариант ${activeImageIndex + 1}` : ""}
                      </button>
                      {resultImages.length > 1 && (
                        <button onClick={async () => { for (let i = 0; i < resultImages.length; i++) { await downloadAsPng(resultImages[i], `cardmaker-v${i + 1}.png`); await new Promise(r => setTimeout(r, 400)); } }} className="w-full py-2.5 rounded-full border border-white/[0.1] text-[14px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Скачать все ({resultImages.length})
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-white/[0.04] flex items-center justify-center">
                        <ImageIcon className="w-7 h-7 text-white/20" />
                      </div>
                      <p className="text-[13px] text-white/30 max-w-[180px] leading-relaxed">Загрузите фото и нажмите «Создать»</p>
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
