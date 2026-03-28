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

// Odd-indexed variants = infographic cards with Russian text overlays
// Even-indexed variants = clean lifestyle product photos (no text)
const INFOGRAPHIC_VARIANTS: VariantFn[] = [
  // 0 — LIFESTYLE: warm cozy indoor scene, no text
  (name, _mp, _features) =>
    `Premium product lifestyle photography, square format. Product: ${name}. ` +
    `Scene: product placed on a wooden table or shelf in a bright cozy interior. ` +
    `Complementary props nearby: ceramic mug, open book, small plant. Soft warm natural window light, shallow depth of field. ` +
    `NO text, NO labels, NO logos, NO overlay graphics. ` +
    `Studio-quality, photorealistic, ultra high resolution.`,

  // 1 — INFOGRAPHIC: bold title top + lifestyle background + 3 feature badges bottom
  (name, mp, features) =>
    `Square product card for ${mp} Russian marketplace. Style: professional Wildberries listing card. ` +
    `LAYOUT — top: large bold Russian headline "${name}" on white semi-transparent strip (black text). ` +
    `Center/background: product in a natural lifestyle scene matching the product category, bright daylight. ` +
    `Bottom row: 3 rounded badge boxes each with a thin line icon and short bold Russian label: ` +
    `"${feat(features, 0, "Высокое качество")}" | "${feat(features, 1, "Надёжный материал")}" | "${feat(features, 2, "Удобное применение")}". ` +
    `Clean modern design, photorealistic, high resolution.`,

  // 2 — LIFESTYLE: clean minimal surface, soft gradient background, no text
  (name, _mp, _features) =>
    `Premium product lifestyle photography, square format. Product: ${name}. ` +
    `Scene: product resting on soft fabric or light textured surface (linen, marble, or concrete). ` +
    `Background: blurred, soft neutral tones — warm beige, white, or sand gradient. ` +
    `A laptop or minimalist wooden object partially visible in background. Soft diffused studio lighting. ` +
    `NO text, NO labels, NO logos, NO overlay graphics. ` +
    `Studio-quality, photorealistic, ultra high resolution.`,

  // 3 — INFOGRAPHIC: full-bleed lifestyle photo + title top-left + vertical feature list bottom-right
  (name, mp, features) =>
    `Square product card for ${mp} Russian marketplace. Style: professional Ozon listing card. ` +
    `LAYOUT — full-bleed lifestyle photo background matching product category (outdoor or cozy interior). ` +
    `Top-left overlay: bold Russian title "${name}" in large white text with dark shadow. ` +
    `Rating row below title: "★★★★★ 4.9 (578 отзывов)" in yellow/white. ` +
    `Bottom-right: vertical list of 3 features with thin icons: ` +
    `"— ${feat(features, 0, "Высокое качество")}", "— ${feat(features, 1, "Надёжный материал")}", "— ${feat(features, 2, "Удобное применение")}". ` +
    `Premium feel, photorealistic, high resolution.`,

  // 4 — LIFESTYLE: premium studio pedestal/surface, dramatic atmospheric background, no text
  (name, _mp, _features) =>
    `Premium product lifestyle photography, square format. Product: ${name}. ` +
    `Scene: product placed on a minimalist concrete or stone pedestal. ` +
    `Background: dreamy atmospheric scene matching product mood — soft sand dunes, misty forest, or blurred park. ` +
    `Dramatic soft lighting with long shadows, premium feel. ` +
    `NO text, NO labels, NO logos, NO overlay graphics. ` +
    `Studio-quality, photorealistic, ultra high resolution.`,
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

  const domain = process.env.REPLIT_DEV_DOMAIN;
  if (!domain) {
    console.error("REPLIT_DEV_DOMAIN not set");
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
