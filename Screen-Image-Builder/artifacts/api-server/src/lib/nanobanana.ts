import { randomUUID } from "crypto";
import { tmpImageStore } from "../routes/tmpImages.js";

const KIE_AI_BASE = "https://api.kie.ai/api/v1";
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;

function feat(features: string[], i: number, fallback: string): string {
  return features[i]?.trim() || fallback;
}

type VariantFn = (name: string, mp: string, features: string[], price: string) => string;

const VARIANTS: VariantFn[] = [
  // 0 — Gold luxury: product centered on golden gradient, feature badges around
  (name, _mp, features, price) =>
    `Premium product infographic card for marketplace. Square 1:1 format. ` +
    `Warm golden gradient background (#F5D78E to #C8940A). ` +
    `Product "${name}" large and centered with golden glow and realistic shadows. ` +
    `3 circular badge icons around the product — translucent gold circles with icons and Russian labels: ` +
    `"${feat(features, 0, "Высокое качество")}", "${feat(features, 1, "Премиум материал")}", "${feat(features, 2, "Оригинал")}". ` +
    `Bold dark-brown Russian title "${name}" at very top. ` +
    `Price "${price} руб." in large bold dark text at bottom. ` +
    `Luxury premium aesthetic, no clutter, professional commercial design.`,

  // 1 — Dark luxury: product on deep dark bg, gold accents, badges at bottom
  (name, _mp, features, price) =>
    `Luxury dark premium product card. Square 1:1 format. ` +
    `Deep dark background — near-black with subtle deep blue gradient. ` +
    `Product "${name}" dramatically lit with golden rim light, floating centered. ` +
    `3 gold circular badges in a row at bottom with icons and Russian text labels: ` +
    `"${feat(features, 0, "Высокое качество")}", "${feat(features, 1, "Надёжность")}", "${feat(features, 2, "Гарантия")}". ` +
    `Bold gold Russian title "${name}" at top center. Price "${price} руб." gold text bottom right. ` +
    `High-end luxury brand aesthetic, dramatic cinematic lighting.`,

  // 2 — Infographic split: product left, features right, white/light bg
  (name, mp, features, price) =>
    `Professional product infographic banner for ${mp}. Square 1:1 format, white/light blue background. ` +
    `LEFT HALF: large product "${name}" photo with soft white glow halo. ` +
    `RIGHT HALF: clean white panel with: bold Russian product title at top, ` +
    `feature list: "✓ ${feat(features, 0, "Высокое качество")}", "✓ ${feat(features, 1, "Премиум материал")}", "✓ ${feat(features, 2, "Удобное применение")}", "★★★★★ Топ продаж". ` +
    `Price "${price} руб." large bold at bottom right. ` +
    `Modern clean flat design, blue and white color scheme, professional marketplace card.`,

  // 3 — Lifestyle: product in real-world elegant setting, minimal text
  (name, _mp, features, _price) =>
    `Lifestyle commercial photography of product "${name}". Square format. ` +
    `Beautiful real-world setting matching product category — marble counter, elegant interior, or natural outdoor scene. ` +
    `Warm cinematic lighting, golden bokeh background, shallow depth of field. ` +
    `Product prominently featured, magazine quality. ` +
    `Minimal overlay: 3 small feature badges with Russian labels: ` +
    `"${feat(features, 0, "Высокое качество")}", "${feat(features, 1, "Премиум")}", "${feat(features, 2, "Оригинал")}". ` +
    `Aspirational luxury feel, professional editorial photography.`,
];

async function pollKieTask(taskId: string, timeoutMs = 120_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const res = await fetch(`${KIE_AI_BASE}/jobs/record-info?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KIE_AI_API_KEY}` },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as any;
      const item = data?.data;
      if (!item) continue;
      if (item.successFlag === 1) {
        const urls: string[] = item.response?.result_urls ?? [];
        return urls[0] ?? null;
      }
      if (item.successFlag === 2) {
        console.error("KIE AI task failed:", JSON.stringify(item).slice(0, 200));
        return null;
      }
    } catch (err) {
      console.error("KIE AI poll error:", err);
    }
  }
  console.error("KIE AI task timed out after", timeoutMs / 1000, "s");
  return null;
}

export async function generateWithNanoBanana(
  imageBase64: string,
  productName: string,
  marketplace: string,
  price: string,
  features: string[],
  variantIndex: number,
): Promise<string | null> {
  if (!KIE_AI_API_KEY) {
    console.error("KIE_AI_API_KEY not set");
    return null;
  }

  const uuid = randomUUID();
  const TTL = 15 * 60 * 1000;
  const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  tmpImageStore.set(uuid, { data: cleanBase64, mime: "image/jpeg", expiresAt: Date.now() + TTL });

  const replitDomains = process.env.REPLIT_DOMAINS;
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  const domain = replitDomains ? replitDomains.split(",")[0].trim() : devDomain;
  if (!domain) {
    console.error("No domain env var (REPLIT_DOMAINS / REPLIT_DEV_DOMAIN)");
    tmpImageStore.delete(uuid);
    return null;
  }

  const imageUrl = `https://${domain}/api/tmp/${uuid}`;
  const idx = variantIndex % VARIANTS.length;
  const prompt = VARIANTS[idx](productName, marketplace, features, price);

  try {
    console.log(`🍌 NanoBanana variant ${variantIndex}: submitting task...`);

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
      console.error("KIE AI createTask error:", createRes.status, text.slice(0, 300));
      return null;
    }

    const createData = (await createRes.json()) as any;
    const taskId = createData?.data?.taskId;
    if (!taskId) {
      console.error("KIE AI: no taskId in response", JSON.stringify(createData).slice(0, 200));
      return null;
    }

    console.log(`🍌 NanoBanana variant ${variantIndex}: polling taskId=${taskId}...`);
    const resultUrl = await pollKieTask(taskId);
    if (resultUrl) console.log(`✅ NanaBanana variant ${variantIndex}: done`);
    return resultUrl;
  } catch (err) {
    console.error("KIE AI generation failed:", err);
    return null;
  } finally {
    tmpImageStore.delete(uuid);
  }
}
