import { Router } from "express";
import { db, usersTable, generationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";
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

async function generateCardImageWithKieAI(
  imageBase64: string,
  productName: string,
  marketplace: string,
): Promise<string | null> {
  if (!KIE_AI_API_KEY) return null;

  try {
    const marketplaceNames: Record<string, string> = {
      wildberries: "Wildberries",
      ozon: "Ozon",
      yandex: "Яндекс Маркет",
      universal: "marketplace",
    };
    const marketplaceName = marketplaceNames[marketplace] ?? "marketplace";
    const prompt = `Professional product card for ${marketplaceName}. Clean white background, studio lighting. Product: ${productName}. Add infographic elements: key features icons, quality marks. Modern e-commerce design, high quality, photorealistic.`;

    const response = await fetch("https://api.kie.ai/v1/image/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${KIE_AI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image: imageBase64,
        model: "nano-banana-pro",
        width: 1024,
        height: 1024,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("KIE AI error:", response.status, text);
      return null;
    }

    const data = await response.json() as any;
    return data.imageUrl ?? data.url ?? data.image_url ?? null;
  } catch (err) {
    console.error("KIE AI generation failed:", err);
    return null;
  }
}

router.post("/", requireAuth as any, async (req: AuthRequest, res) => {
  try {
    const { imagesBase64, imageBase64, price, marketplace, productName, description } = req.body;
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

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user || user.bonusGenerations <= 0) {
      res.status(403).json({ error: "Недостаточно генераций. Используйте реферальный код для получения бонусных генераций." });
      return;
    }

    const [gen] = await db.insert(generationsTable).values({
      userId,
      marketplace,
      price,
      productName,
      status: "processing",
    }).returning();

    await db.update(usersTable)
      .set({ bonusGenerations: sql`${usersTable.bonusGenerations} - 1` })
      .where(eq(usersTable.id, userId));

    const aiResult = await analyzeImagesWithOpenAI(images, price ?? "", marketplace, productName, description);
    // Use first image for card generation
    const imageUrl = await generateCardImageWithKieAI(images[0], aiResult.name, marketplace);

    await db.update(generationsTable).set({
      outputText: aiResult.fullText,
      outputImageUrl: imageUrl,
      productName: aiResult.name,
      status: "done",
    }).where(eq(generationsTable.id, gen.id));

    res.json({
      id: gen.id,
      description: aiResult.description,
      imageUrl: imageUrl ?? `data:image/jpeg;base64,${images[0]}`,
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
