import { GoogleGenerativeAI } from "@google/generative-ai";

const API_ENDPOINT = "https://vip.apiyi.com";
const MODEL_NAME = "gemini-2.0-flash-preview-image-generation";

function feat(features: string[], i: number, fallback: string): string {
  return features[i]?.trim() || fallback;
}

function buildPrompt(
  productName: string,
  marketplace: string,
  price: string,
  features: string[],
  variantIndex: number,
): string {
  const f0 = feat(features, 0, "Высокое качество");
  const f1 = feat(features, 1, "Премиум материал");
  const f2 = feat(features, 2, "Оригинальный продукт");
  const v = variantIndex % 4;

  const base = `Создай профессиональную инфографику-карточку товара для маркетплейса ${marketplace}. Квадратный формат 1:1. Все тексты ТОЛЬКО на русском языке, чёткие и читаемые.

ТОВАР: ${productName}
ЦЕНА: ${price} руб.
ХАРАКТЕРИСТИКИ: ${f0} | ${f1} | ${f2}

ОБЯЗАТЕЛЬНЫЕ ЭЛЕМЕНТЫ НА ИЗОБРАЖЕНИИ:
- Крупный жирный заголовок с названием товара "${productName}" в верхней части
- Сам товар занимает центральную часть карточки (большой, детальный, реалистичный)
- 3 круглых значка-бейджа вокруг товара, каждый с иконкой и подписью на русском: "${f0}", "${f1}", "${f2}"
- Все надписи должны быть чёткими, без размытия, без орфографических ошибок`;

  if (v === 0) {
    return `${base}

СТИЛЬ: Тёплый золотой градиентный фон (#F5D78E → #C8940A). Продукт с золотистым свечением. Бейджи — полупрозрачные круги с золотой окантовкой и тематическими иконками. Заголовок — тёмно-коричневый жирный текст сверху. Роскошный премиальный вид.`;
  }

  if (v === 1) {
    return `${base}

СТИЛЬ: Тёмный фон (почти чёрный, глубокий синий градиент). Продукт с драматической подсветкой — золотые блики. 3 бейджа снизу в ряд — золотые круги с иконками и текстом под ними. Заголовок — крупный золотой текст сверху. Люкс-эстетика.`;
  }

  if (v === 2) {
    return `${base}

СТИЛЬ: Лайфстайл-фон, подходящий товару (красивый интерьер/природа/студия). Продукт в красивом окружении с атмосферным освещением. Бейджи слева и справа от продукта — круги с иконкой сверху и текстом снизу. Заголовок сверху белым жирным текстом с тенью.`;
  }

  return `${base}

СТИЛЬ: Чистый светлый фон (белый или нежный градиент). Продукт крупный в центре. 2 бейджа по бокам, 1 снизу по центру. Синие или тёмные акценты. Внизу цена "${price} руб." крупными цифрами. Современный минималистичный дизайн.`;
}

export async function generateWithNanoBanana(
  imageBase64: string,
  productName: string,
  marketplace: string,
  price: string,
  features: string[],
  variantIndex: number,
): Promise<string | null> {
  const apiKey = process.env.KIE_AI_API_KEY;
  if (!apiKey) {
    console.error("KIE_AI_API_KEY not set");
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: MODEL_NAME },
      { apiEndpoint: API_ENDPOINT },
    );

    const prompt = buildPrompt(productName, marketplace, price, features, variantIndex);

    const mimeType = imageBase64.startsWith("/9j/") ? "image/jpeg" : "image/png";
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"] as any,
        aspectRatio: "1:1",
        temperature: 0.7,
        topP: 0.95,
      } as any,
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = (part as any).inlineData;
      if (inline?.mimeType?.startsWith("image/")) {
        return `data:${inline.mimeType};base64,${inline.data}`;
      }
    }

    console.error("NanoBanana: no image in response", JSON.stringify(result.response).slice(0, 300));
    return null;
  } catch (err: any) {
    let msg = err?.message ?? String(err);
    if (msg.includes("401")) msg = "Неверный API-ключ KIE_AI_API_KEY";
    if (msg.includes("402")) msg = "Недостаточно кредитов в KIE/APIYI";
    if (msg.includes("429")) msg = "Превышен лимит запросов";
    console.error("NanoBanana error:", msg);
    return null;
  }
}
