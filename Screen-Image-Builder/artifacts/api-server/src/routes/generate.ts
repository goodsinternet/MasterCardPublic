import { Router } from "express";
import { randomUUID } from "crypto";
import { db, usersTable, generationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";
import { tmpImageStore } from "./tmpImages.js";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;

function buildMarketplacePrompt(
  marketplace: string,
  price: string,
  productName?: string,
  description?: string,
): string {
  const priceStr = price ? `Цена: ${price} руб.` : "";
  const nameStr = productName ? `Рабочее название: ${productName}` : "";
  const descStr = description ? `Дополнительная информация от продавца: ${description}` : "";
  const extras = [nameStr, priceStr, descStr].filter(Boolean).join("\n");

  switch (marketplace) {
    case "wildberries":
      return `Ты SEO-специалист Wildberries с опытом вывода карточек в ТОП.
${extras}

Проанализируй все предоставленные изображения товара и создай оптимизированную карточку для Wildberries.

ТРЕБОВАНИЯ WILDBERRIES:
• Название: строго до 60 символов. Ключевое слово — в самом начале. Формат: "Ключевое слово Характеристика / Бренд". Без запятых.
• Описание: до 1000 символов. Первые 2 предложения — главные преимущества (попадают в поиск). Используй ключевые слова естественно. Закончи призывом к действию.
• Характеристики: каждое свойство с новой строки в формате "Свойство: значение". Заполни максимально подробно — влияет на фильтры поиска.
• Ключевые слова: 10–15 LSI-ключей через запятую (синонимы, смежные запросы, которые не вошли в название/описание).

Верни JSON:
{
  "name": "название до 60 символов",
  "description": "продающее SEO-описание до 1000 символов",
  "characteristics": "Материал: ...\nЦвет: ...\nРазмер: ...\nСостав: ...\nСтрана: ...",
  "keywords": "ключ1, ключ2, ключ3...",
  "category": "Категория > Подкатегория",
  "seoTips": "2–3 кратких совета специфично для этой карточки на WB"
}`;

    case "ozon":
      return `Ты SEO-специалист Ozon с опытом продвижения карточек.
${extras}

Проанализируй все предоставленные изображения товара и создай оптимизированную карточку для Ozon.

ТРЕБОВАНИЯ OZON:
• Название: до 200 символов. Формат: "Тип товара + Ключевые атрибуты + Бренд/Модель". Включи пол, материал, цвет если применимо.
• Описание rich-text: до 3000 символов. Структура: абзац с главными выгодами → список преимуществ (используй символ •) → технические детали → информация о бренде/гарантии. Пиши для человека, но с ключевыми словами.
• Характеристики: подробный список атрибутов — всё что можно указать, влияет на показы.
• Ключевые слова: 15–20 запросов через запятую для поля "Поисковые запросы" Ozon.

Верни JSON:
{
  "name": "название до 200 символов",
  "description": "rich-text описание с •-списками, до 3000 символов",
  "characteristics": "Тип: ...\nМатериал: ...\nЦвет: ...\nРазмер/Объём: ...\nКомплектация: ...\nСтрана производства: ...",
  "keywords": "запрос1, запрос2, запрос3...",
  "category": "Категория / Подкатегория",
  "seoTips": "2–3 специфичных совета для этой карточки на Ozon"
}`;

    case "yandex":
      return `Ты SEO-специалист Яндекс Маркет.
${extras}

Проанализируй все предоставленные изображения товара и создай оптимизированную карточку для Яндекс Маркет.

ТРЕБОВАНИЯ ЯНДЕКС МАРКЕТ:
• Название: до 150 символов. Формат: "Тип + Бренд + Модель + Ключевой атрибут". Точное и информативное.
• Описание: до 3000 символов. Чёткий деловой стиль. Абзацы: преимущества → применение → технические параметры → условия гарантии/доставки. Без воды.
• Характеристики: все технические параметры — Яндекс использует их для формирования карточки модели.
• Ключевые слова: 10–15 точных поисковых запросов под Яндекс.

Верни JSON:
{
  "name": "название до 150 символов",
  "description": "деловое описание до 3000 символов",
  "characteristics": "Тип: ...\nМодель: ...\nПроизводитель: ...\nМатериал: ...\nРазмеры: ...\nВес: ...\nЦвет: ...",
  "keywords": "запрос1, запрос2...",
  "category": "Категория > Тип",
  "seoTips": "2–3 специфичных совета для Яндекс Маркет"
}`;

    default:
      return `Ты эксперт по e-commerce и маркетплейсам.
${extras}

Проанализируй все предоставленные изображения товара и создай универсальную продающую карточку.

Верни JSON:
{
  "name": "SEO-название до 100 символов",
  "description": "продающее описание 300–500 слов с ключевыми словами",
  "characteristics": "Материал: ...\nЦвет: ...\nРазмер: ...",
  "keywords": "ключ1, ключ2, ключ3...",
  "category": "Категория товара",
  "seoTips": "2–3 общих SEO-совета"
}`;
  }
}

async function analyzeImagesWithOpenAI(
  imagesBase64: string[],
  price: string,
  marketplace: string,
  productName?: string,
  description?: string,
): Promise<{
  name: string;
  description: string;
  characteristics: string;
  keywords: string;
  category: string;
  seoTips: string;
  fullText: string;
}> {
  const prompt = buildMarketplacePrompt(marketplace, price, productName, description);

  const imageContents: OpenAI.Chat.ChatCompletionContentPart[] = imagesBase64.map(b64 => ({
    type: "image_url" as const,
    image_url: { url: `data:image/jpeg;base64,${b64}`, detail: "high" as const },
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageContents,
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  return {
    name: parsed.name ?? "Товар",
    description: parsed.description ?? "",
    characteristics: parsed.characteristics ?? "",
    keywords: parsed.keywords ?? "",
    category: parsed.category ?? "",
    seoTips: parsed.seoTips ?? "",
    fullText: JSON.stringify(parsed),
  };
}

type VariantFn = (name: string, mp: string, features: string[]) => string;

function feat(features: string[], i: number, fallback: string): string {
  return features[i]?.trim() || fallback;
}

const INFOGRAPHIC_VARIANTS: VariantFn[] = [
  // 0 — Pure white studio: isolated product on perfect white background
  (name, _mp, _features) =>
    `Professional commercial product photography of ${name}. ` +
    `Pure white seamless background, perfect studio lighting from multiple angles, no shadows. ` +
    `Product centered, sharp focus, high-key lighting, commercial catalog style. ` +
    `Ultra clean, no clutter, professional e-commerce photo. ` +
    `No text, no graphics, no watermarks.`,

  // 1 — Infographic card: white bg + product top + feature icons below
  (name, mp, features) =>
    `Professional product infographic card for ${mp} marketplace listing. Square format, white background. ` +
    `TOP HALF: product image with soft drop shadow, centered. ` +
    `BOTTOM HALF: 3 feature icons in a row, each with label below: ` +
    `icon 1 checkmark "✓ ${feat(features, 0, "Высокое качество")}", ` +
    `icon 2 star "★ ${feat(features, 1, "Премиум материал")}", ` +
    `icon 3 shield "⊕ ${feat(features, 2, "Гарантия качества")}". ` +
    `Bold product title "${name}" at very top in dark navy blue. ` +
    `Clean modern flat design, professional marketplace card.`,

  // 2 — Dark luxury: product on dark gradient background with gold accents
  (name, _mp, _features) =>
    `Luxury premium product photography of ${name}. ` +
    `Dark background: deep navy blue to black gradient. ` +
    `Product lit with dramatic rim lighting, golden hour glow, specular highlights. ` +
    `Smoke or mist effect around the product base. Atmospheric, high-end luxury brand aesthetic. ` +
    `Rich colors, deep contrast, magazine cover quality. No text.`,

  // 3 — Benefits banner: colored bg + large product left + text list right
  (name, mp, features) =>
    `Professional product card for ${mp} marketplace. Square format. ` +
    `LEFT HALF: large product photo with white glow halo on light blue gradient background. ` +
    `RIGHT HALF: white panel with product benefits list: ` +
    `"✓ ${feat(features, 0, "Высокое качество")}" ` +
    `"✓ ${feat(features, 1, "Надёжный материал")}" ` +
    `"✓ ${feat(features, 2, "Удобное применение")}" ` +
    `"★★★★★ Топ продаж". ` +
    `Blue and white color scheme, bold clean typography, modern flat design. ` +
    `Product name "${name}" in large bold text top right.`,

  // 4 — Lifestyle context: product in natural real-world setting
  (name, _mp, _features) =>
    `Lifestyle product photography of ${name} in real-world context. ` +
    `Scene: product placed in a beautiful natural environment matching product category — ` +
    `luxury bathroom counter with marble, elegant dressing table, or outdoor garden setting. ` +
    `Warm cinematic lighting, golden bokeh background, depth of field. ` +
    `Complementary lifestyle props around the product. Magazine-quality commercial photo. No text.`,
];

const KIE_AI_BASE = "https://api.kie.ai/api/v1";

async function pollKieTask(taskId: string, timeoutMs = 300_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const res = await fetch(`${KIE_AI_BASE}/jobs/record-info?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KIE_AI_API_KEY}` },
      });
      if (!res.ok) continue;
      const data = await res.json() as any;
      const item = data?.data;
      if (!item) continue;
      if (item.successFlag === 1) {
        const urls: string[] = item.response?.result_urls ?? [];
        return urls[0] ?? null;
      }
      if (item.successFlag === 2) {
        console.error("KIE AI task failed:", item);
        return null;
      }
    } catch (err) {
      console.error("KIE AI poll error:", err);
    }
  }
  console.error("KIE AI task timed out:", taskId);
  return null;
}

async function generateCardImageWithKieAI(
  imageBase64: string,
  productName: string,
  marketplace: string,
  variantIndex: number = 0,
  features: string[] = [],
): Promise<string | null> {
  if (!KIE_AI_API_KEY) return null;

  const uuid = randomUUID();
  const TTL = 15 * 60 * 1000;
  tmpImageStore.set(uuid, { data: imageBase64, mime: "image/jpeg", expiresAt: Date.now() + TTL });

  const replitDomains = process.env.REPLIT_DOMAINS;
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  const domain = replitDomains ? replitDomains.split(",")[0].trim() : devDomain;
  if (!domain) {
    console.error("No domain env var set (REPLIT_DOMAINS or REPLIT_DEV_DOMAIN)");
    tmpImageStore.delete(uuid);
    return null;
  }

  const imageUrl = `https://${domain}/api/tmp/${uuid}`;

  try {
    const marketplaceNames: Record<string, string> = {
      wildberries: "Wildberries",
      ozon: "Ozon",
      yandex: "Яндекс Маркет",
      universal: "marketplace",
    };
    const marketplaceName = marketplaceNames[marketplace] ?? "marketplace";
    const idx = variantIndex % INFOGRAPHIC_VARIANTS.length;
    const prompt = INFOGRAPHIC_VARIANTS[idx](productName, marketplaceName, features);

    const createRes = await fetch(`${KIE_AI_BASE}/jobs/createTask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "nano-banana-pro",
        input: {
          prompt,
          image_input: [imageUrl],
          aspect_ratio: "1:1",
          resolution: "1K",
        },
      }),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("KIE AI createTask error:", createRes.status, text);
      return null;
    }

    const createData = await createRes.json() as any;
    const taskId = createData?.data?.taskId;
    if (!taskId) {
      console.error("KIE AI: no taskId in response", createData);
      return null;
    }

    const resultUrl = await pollKieTask(taskId);
    return resultUrl;
  } catch (err) {
    console.error("KIE AI generation failed:", err);
    return null;
  } finally {
    tmpImageStore.delete(uuid);
  }
}

async function generateMultipleCardImages(
  imageBase64: string,
  productName: string,
  marketplace: string,
  count: number,
  features: string[] = [],
): Promise<string[]> {
  const tasks = Array.from({ length: count }, (_, i) =>
    generateCardImageWithKieAI(imageBase64, productName, marketplace, i, features),
  );
  const results = await Promise.all(tasks);
  return results.filter((url): url is string => url !== null);
}

router.post("/", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const { imagesBase64, imageBase64, price, marketplace, productName, description, imageCount } = req.body;
    const userId = req.userId!;

    // Support both single (legacy) and multiple images
    const images: string[] = Array.isArray(imagesBase64)
      ? imagesBase64
      : imageBase64
        ? [imageBase64]
        : [];

    if (images.length === 0 || !marketplace) {
      res.status(400).json({ error: "Необходимо загрузить минимум одно фото и выбрать маркетплейс" });
      return;
    }

    if (images.length > 5) {
      res.status(400).json({ error: "Максимум 5 изображений" });
      return;
    }

    const count = Math.min(Math.max(Number(imageCount) || 1, 1), 5);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "Пользователь не найден" });
      return;
    }
    const totalGenerations = user.isAdmin ? Infinity : user.bonusGenerations + user.freeGenerations;
    if (!user.isAdmin && totalGenerations <= 0) {
      res.status(403).json({ error: "Недостаточно генераций. Пригласите друга по реферальному коду для получения +3 бонусных генераций." });
      return;
    }

    const [gen] = await db.insert(generationsTable).values({
      userId,
      marketplace,
      price,
      productName,
      status: "processing",
    }).returning();

    if (!user.isAdmin) {
      if (user.bonusGenerations > 0) {
        await db.update(usersTable)
          .set({ bonusGenerations: sql`${usersTable.bonusGenerations} - 1` })
          .where(eq(usersTable.id, userId));
      } else {
        await db.update(usersTable)
          .set({ freeGenerations: sql`${usersTable.freeGenerations} - 1` })
          .where(eq(usersTable.id, userId));
      }
    }

    const aiResult = await analyzeImagesWithOpenAI(images, price ?? "", marketplace, productName, description);

    // Extract top 3 key features from characteristics for infographic badges
    const featureLines: string[] = (aiResult.characteristics ?? "")
      .split(/\n|;/)
      .map((s: string) => s.replace(/^[-–•*\d.]+\s*/, "").trim())
      .filter((s: string) => s.length > 3 && s.length < 60)
      .slice(0, 3);

    // Generate multiple card images in parallel, each with a different infographic variant
    const imageUrls = await generateMultipleCardImages(images[0], aiResult.name, marketplace, count, featureLines);

    const outputImageUrl = imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;

    await db.update(generationsTable).set({
      outputText: aiResult.fullText,
      outputImageUrl,
      productName: aiResult.name,
      status: "done",
    }).where(eq(generationsTable.id, gen.id));

    res.json({
      id: gen.id,
      description: aiResult.description,
      imageUrl: imageUrls[0] ?? `data:image/jpeg;base64,${images[0]}`,
      imageUrls: imageUrls.length > 0 ? imageUrls : [`data:image/jpeg;base64,${images[0]}`],
      productName: aiResult.name,
      characteristics: aiResult.characteristics,
      keywords: aiResult.keywords,
      category: aiResult.category,
      seoTips: aiResult.seoTips,
      marketplace,
    });
  } catch (err) {
    req.log.error({ err }, "Generate error");
    res.status(500).json({ error: "Ошибка генерации карточки" });
  }
});

router.get("/", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const generations = await db.select().from(generationsTable)
      .where(eq(generationsTable.userId, userId))
      .orderBy(generationsTable.createdAt);

    res.json({
      generations: generations.map(g => ({
        id: g.id,
        outputText: g.outputText,
        outputImageUrl: g.outputImageUrl,
        marketplace: g.marketplace,
        price: g.price,
        productName: g.productName,
        status: g.status,
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Get generations error");
    res.status(500).json({ error: "Ошибка получения истории" });
  }
});

export default router;
