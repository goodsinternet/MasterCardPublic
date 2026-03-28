import { randomUUID } from "crypto";
import { tmpImageStore } from "../routes/tmpImages.js";

const KIE_AI_BASE = "https://api.kie.ai/api/v1";
const KIE_AI_API_KEY = process.env.KIE_AI_API_KEY;

function feat(features: string[], i: number, fallback: string): string {
  return features[i]?.trim() || fallback;
}

type VariantFn = (name: string, mp: string, features: string[], price: string) => string;

const VARIANTS: VariantFn[] = [
  // 0 — Gold luxury: golden gradient background, product center, 3 circular badges arranged triangle
  (name, _mp, features, price) =>
    `Professional marketplace infographic card. Square 1:1. ` +
    `BACKGROUND: rich warm golden gradient from light gold (#F5D78E) at top to deep amber (#B8860B) at bottom. ` +
    `CENTER: product "${name}" large, floating, realistic 3D with soft golden glow underneath. ` +
    `BADGES: exactly 3 circular translucent gold badges with thin gold border and small icon inside — ` +
    `badge LEFT of product labeled "${feat(features, 0, "Качество")}", ` +
    `badge RIGHT of product labeled "${feat(features, 1, "Материал")}", ` +
    `badge BELOW product center labeled "${feat(features, 2, "Размер")}". ` +
    `TITLE: bold dark brown Russian text "${name}" at very top, large font. ` +
    `PRICE: "${price} руб." in very large bold dark font at bottom center. ` +
    `Style: luxury premium, warm golden tones, no white background.`,

  // 1 — Dark neon: pitch black background, product with electric blue rim light, badges in a row at bottom
  (name, _mp, features, price) =>
    `Professional marketplace infographic card. Square 1:1. ` +
    `BACKGROUND: pitch black, pure dark with very subtle deep navy gradient. ` +
    `CENTER: product "${name}" floating in the middle with dramatic electric blue rim lighting, sharp edges glowing cyan/blue, studio lighting effect. ` +
    `BADGES: exactly 3 rectangular dark-glass pill badges with blue glowing border arranged in a HORIZONTAL ROW at the bottom — ` +
    `pill 1: "${feat(features, 0, "Качество")}", pill 2: "${feat(features, 1, "Материал")}", pill 3: "${feat(features, 2, "Размер")}". ` +
    `TITLE: bold white Russian text "${name}" at very top with subtle blue glow. ` +
    `PRICE: "${price} руб." in large bold electric blue font at bottom right. ` +
    `Style: tech luxury, dark mode, neon blue accents, no gold.`,

  // 2 — White clean split: pure white left half product, right half text list
  (name, mp, features, price) =>
    `Professional marketplace infographic card for ${mp}. Square 1:1. ` +
    `BACKGROUND: pure clean white. ` +
    `LAYOUT: vertical split — LEFT half has the product "${name}" photo large with minimal soft shadow on white. ` +
    `RIGHT half has a light blue (#EBF4FF) panel with: ` +
    `product Russian title "${name}" in bold dark navy at top, ` +
    `then a vertical list of 3 features each on its own row with a blue checkmark icon: ` +
    `"${feat(features, 0, "Качество")}", "${feat(features, 1, "Материал")}", "${feat(features, 2, "Размер")}", ` +
    `then "★★★★★ Топ продаж" in gold stars. ` +
    `PRICE: "${price} руб." large bold dark blue at bottom of right panel. ` +
    `Style: clean minimal modern, white and blue, corporate professional.`,

  // 3 — Vibrant lifestyle: deep purple/wine gradient, product hero, icons below in colored circles
  (name, _mp, features, price) =>
    `Professional marketplace infographic card. Square 1:1. ` +
    `BACKGROUND: deep rich purple to burgundy wine gradient (#4A0080 to #8B0000). ` +
    `CENTER: product "${name}" large and prominent, floating center-upper area with soft white glow halo and realistic shadow below. ` +
    `BADGES: exactly 3 small round white circles with a colored icon inside, arranged in a HORIZONTAL ROW at the bottom, each with Russian label underneath in white: ` +
    `circle 1 "${feat(features, 0, "Качество")}", circle 2 "${feat(features, 1, "Материал")}", circle 3 "${feat(features, 2, "Размер")}". ` +
    `TITLE: bold white Russian text "${name}" at top center, large readable font. ` +
    `PRICE: "${price} руб." in large bold white font with golden underline at very bottom. ` +
    `Style: bold vibrant premium, purple-wine palette, white text, no gold background.`,
];

async function pollKieTask(taskId: string, timeoutMs = 180_000): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 5000));
    try {
      const res = await fetch(`${KIE_AI_BASE}/playground/recordInfo?taskId=${taskId}`, {
        headers: { Authorization: `Bearer ${KIE_AI_API_KEY}` },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as any;
      const item = data?.data;
      if (!item) continue;
      if (item.state === "success") {
        const resultJson = item.resultJson ? JSON.parse(item.resultJson) : null;
        const urls: string[] = resultJson?.resultUrls ?? [];
        return urls[0] ?? null;
      }
      if (item.state === "fail") {
        console.error("KIE AI task failed:", item.failMsg, item.failCode);
        return null;
      }
      // states: waiting / queuing / generating — keep polling
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
