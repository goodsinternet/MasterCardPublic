export interface InfographicOptions {
  productName: string;
  features: string[];
  marketplace: string;
  imageBase64: string;
  variantIndex: number;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxCharsPerLine) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function circleText(
  cx: number,
  cy: number,
  r: number,
  text: string,
  fontSize: number,
  fill: string,
): string {
  const lines = wrapText(text.toUpperCase(), Math.floor(r / (fontSize * 0.38)));
  const lineH = fontSize * 1.2;
  const totalH = lines.length * lineH;
  const startY = cy - totalH / 2 + fontSize * 0.35;
  return lines
    .map(
      (l, i) =>
        `<text x="${cx}" y="${startY + i * lineH}" text-anchor="middle" font-size="${fontSize}" font-weight="700" fill="${fill}" font-family="Arial, sans-serif">${escapeXml(l)}</text>`,
    )
    .join("\n");
}

function titleLines(name: string, x: number, startY: number, maxW: number, fontSize: number, fill: string): string {
  const upper = name.toUpperCase();
  const chars = Math.floor(maxW / (fontSize * 0.58));
  const lines = wrapText(upper, chars);
  const lh = fontSize * 1.25;
  return lines.slice(0, 3).map((l, i) =>
    `<text x="${x}" y="${startY + i * lh}" text-anchor="middle" font-size="${fontSize}" font-weight="900" fill="${fill}" font-family="Arial, sans-serif" letter-spacing="1">${escapeXml(l)}</text>`
  ).join("\n");
}

function feat(features: string[], i: number, fallback: string): string {
  return features[i]?.trim() || fallback;
}

const CIRCLE_ICON_PATHS: string[] = [
  // Hourglass (quality)
  "M-18,-24 L18,-24 L18,-16 Q0,0 -18,-16 Z M-18,24 L18,24 L18,16 Q0,0 -18,16 Z M-18,-24 L-18,24 M18,-24 L18,24",
  // Star (premium)
  "M0,-22 L6,-8 L22,-8 L10,2 L14,18 L0,8 L-14,18 L-10,2 L-22,-8 L-6,-8 Z",
  // Crown (best)
  "M-20,10 L-20,-5 L-8,8 L0,-18 L8,8 L20,-5 L20,10 Z M-22,14 L22,14 L22,10 L-22,10 Z",
];

export function generateInfographicSvg(opts: InfographicOptions): string {
  const { productName, features, marketplace, imageBase64, variantIndex } = opts;
  const v = variantIndex % 4;

  const imgSrc = `data:image/jpeg;base64,${imageBase64}`;

  if (v === 0) {
    // GOLD LUXURY — like reference: warm golden gradient, product center, 3 circles
    const f0 = feat(features, 0, "Высокое качество");
    const f1 = feat(features, 1, "Премиум состав");
    const f2 = feat(features, 2, "Оригинальный продукт");
    return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="bg0" cx="50%" cy="60%" r="70%">
      <stop offset="0%" stop-color="#F7E4A0"/>
      <stop offset="50%" stop-color="#D4A82A"/>
      <stop offset="100%" stop-color="#8B6410"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0003"/>
    </filter>
    <clipPath id="imgclip">
      <rect x="330" y="160" width="340" height="620" rx="20"/>
    </clipPath>
  </defs>
  <!-- Background -->
  <rect width="1000" height="1000" fill="url(#bg0)"/>
  <!-- Subtle texture rings -->
  <circle cx="500" cy="500" r="420" fill="none" stroke="#fff3" stroke-width="1"/>
  <circle cx="500" cy="500" r="320" fill="none" stroke="#fff2" stroke-width="1"/>
  <!-- Title -->
  ${titleLines(productName, 500, 60, 800, 52, "#3B2000")}
  <!-- Product image -->
  <image href="${imgSrc}" x="330" y="160" width="340" height="620" preserveAspectRatio="xMidYMid meet" filter="url(#shadow)" clip-path="url(#imgclip)"/>
  <!-- Left circle -->
  <circle cx="165" cy="480" r="140" fill="rgba(255,255,255,0.18)" stroke="#8B6410" stroke-width="4"/>
  <circle cx="165" cy="480" r="130" fill="none" stroke="#C89A1A" stroke-width="1.5"/>
  <g transform="translate(165,405)"><path d="${CIRCLE_ICON_PATHS[0]}" stroke="#5C3D00" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
  ${circleText(165, 490, 130, f0, 21, "#3B2000")}
  <!-- Right top circle -->
  <circle cx="835" cy="340" r="140" fill="rgba(255,255,255,0.18)" stroke="#8B6410" stroke-width="4"/>
  <circle cx="835" cy="340" r="130" fill="none" stroke="#C89A1A" stroke-width="1.5"/>
  <g transform="translate(835,265)"><path d="${CIRCLE_ICON_PATHS[1]}" stroke="#5C3D00" stroke-width="2.5" fill="#5C3D00" fill-opacity="0.6"/></g>
  ${circleText(835, 350, 130, f1, 21, "#3B2000")}
  <!-- Right bottom circle -->
  <circle cx="835" cy="660" r="140" fill="rgba(255,255,255,0.18)" stroke="#8B6410" stroke-width="4"/>
  <circle cx="835" cy="660" r="130" fill="none" stroke="#C89A1A" stroke-width="1.5"/>
  <g transform="translate(835,585)"><path d="${CIRCLE_ICON_PATHS[2]}" stroke="#5C3D00" stroke-width="3" fill="#5C3D00" fill-opacity="0.5"/></g>
  ${circleText(835, 670, 130, f2, 21, "#3B2000")}
  <!-- Marketplace badge -->
  <rect x="400" y="920" width="200" height="44" rx="22" fill="rgba(0,0,0,0.25)"/>
  <text x="500" y="948" text-anchor="middle" font-size="20" fill="#FFE08A" font-family="Arial,sans-serif" font-weight="700">${escapeXml(marketplace.toUpperCase())}</text>
</svg>`;
  }

  if (v === 1) {
    // WHITE CLEAN — white bg, blue accents, infographic layout
    const f0 = feat(features, 0, "Высокое качество");
    const f1 = feat(features, 1, "Надёжный материал");
    const f2 = feat(features, 2, "Удобное применение");
    return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0F6FF"/>
      <stop offset="100%" stop-color="#E0EDFF"/>
    </linearGradient>
    <filter id="sh1"><feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#0002"/></filter>
    <clipPath id="ic1"><rect x="340" y="100" width="320" height="560" rx="16"/></clipPath>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg1)"/>
  <!-- Top accent bar -->
  <rect x="0" y="0" width="1000" height="14" fill="#2563EB"/>
  <rect x="0" y="986" width="1000" height="14" fill="#2563EB"/>
  <!-- Brand strip -->
  <rect x="0" y="14" width="1000" height="80" fill="#1D4ED8"/>
  ${titleLines(productName, 500, 70, 900, 42, "#FFFFFF")}
  <!-- Product image -->
  <image href="${imgSrc}" x="340" y="100" width="320" height="560" preserveAspectRatio="xMidYMid meet" filter="url(#sh1)" clip-path="url(#ic1)"/>
  <!-- Feature boxes bottom -->
  <rect x="40" y="690" width="280" height="120" rx="16" fill="#2563EB"/>
  <text x="180" y="730" text-anchor="middle" font-size="28" fill="#fff" font-family="Arial,sans-serif">✓</text>
  ${circleText(180, 770, 120, f0, 19, "#FFFFFF")}
  <rect x="360" y="690" width="280" height="120" rx="16" fill="#1D4ED8"/>
  <text x="500" y="730" text-anchor="middle" font-size="28" fill="#FFD700" font-family="Arial,sans-serif">★</text>
  ${circleText(500, 770, 120, f1, 19, "#FFFFFF")}
  <rect x="680" y="690" width="280" height="120" rx="16" fill="#2563EB"/>
  <text x="820" y="730" text-anchor="middle" font-size="28" fill="#fff" font-family="Arial,sans-serif">⊕</text>
  ${circleText(820, 770, 120, f2, 19, "#FFFFFF")}
  <!-- Stars row -->
  <text x="500" y="860" text-anchor="middle" font-size="36" fill="#F59E0B" font-family="Arial,sans-serif">★★★★★</text>
  <text x="500" y="900" text-anchor="middle" font-size="22" fill="#374151" font-family="Arial,sans-serif">Топ продаж на ${escapeXml(marketplace)}</text>
  <!-- Side labels -->
  <text x="30" y="440" font-size="18" fill="#9CA3AF" font-family="Arial,sans-serif" writing-mode="tb">КАРТОЧКА ТОВАРА</text>
</svg>`;
  }

  if (v === 2) {
    // DARK LUXURY — deep navy/black, neon blue accent, premium
    const f0 = feat(features, 0, "Высокое качество");
    const f1 = feat(features, 1, "Премиум класс");
    const f2 = feat(features, 2, "Гарантия качества");
    return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1a2744"/>
      <stop offset="60%" stop-color="#0c1628"/>
      <stop offset="100%" stop-color="#060d1a"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4D9FFF22"/>
      <stop offset="100%" stop-color="#4D9FFF00"/>
    </radialGradient>
    <filter id="sh2"><feDropShadow dx="0" dy="0" stdDeviation="30" flood-color="#4D9FFF" flood-opacity="0.4"/></filter>
    <clipPath id="ic2"><ellipse cx="500" cy="430" rx="230" ry="330"/></clipPath>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg2)"/>
  <ellipse cx="500" cy="380" rx="350" ry="350" fill="url(#glow2)"/>
  <!-- Decorative circles -->
  <circle cx="500" cy="430" r="340" fill="none" stroke="#4D9FFF" stroke-width="1" opacity="0.3"/>
  <circle cx="500" cy="430" r="280" fill="none" stroke="#4D9FFF" stroke-width="0.5" opacity="0.2"/>
  <!-- Product image -->
  <image href="${imgSrc}" x="270" y="100" width="460" height="640" preserveAspectRatio="xMidYMid meet" filter="url(#sh2)" clip-path="url(#ic2)"/>
  <!-- Title bottom -->
  ${titleLines(productName, 500, 800, 900, 50, "#FFFFFF")}
  <!-- Feature pills -->
  <rect x="40" y="900" width="240" height="50" rx="25" fill="none" stroke="#4D9FFF" stroke-width="2"/>
  ${circleText(160, 930, 110, f0, 16, "#4D9FFF")}
  <rect x="380" y="900" width="240" height="50" rx="25" fill="none" stroke="#4D9FFF" stroke-width="2"/>
  ${circleText(500, 930, 110, f1, 16, "#4D9FFF")}
  <rect x="720" y="900" width="240" height="50" rx="25" fill="none" stroke="#4D9FFF" stroke-width="2"/>
  ${circleText(840, 930, 110, f2, 16, "#4D9FFF")}
  <!-- Top label -->
  <rect x="350" y="30" width="300" height="44" rx="22" fill="#4D9FFF22" stroke="#4D9FFF" stroke-width="1.5"/>
  <text x="500" y="58" text-anchor="middle" font-size="18" fill="#4D9FFF" font-family="Arial,sans-serif" font-weight="700" letter-spacing="3">PREMIUM</text>
</svg>`;
  }

  // v === 3: SPLIT LAYOUT — product left, text/features right
  const f0 = feat(features, 0, "Высокое качество");
  const f1 = feat(features, 1, "Надёжный материал");
  const f2 = feat(features, 2, "Удобное применение");
  const f3 = feat(features, 3, "Топ продаж");
  return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a3a5c"/>
      <stop offset="100%" stop-color="#0d2035"/>
    </linearGradient>
    <linearGradient id="panel3" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#F0F6FF"/>
    </linearGradient>
    <filter id="sh3"><feDropShadow dx="4" dy="0" stdDeviation="20" flood-color="#000" flood-opacity="0.3"/></filter>
    <clipPath id="ic3"><rect x="40" y="60" width="420" height="840" rx="20"/></clipPath>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg3)"/>
  <!-- Product image left -->
  <image href="${imgSrc}" x="40" y="60" width="420" height="840" preserveAspectRatio="xMidYMid meet" clip-path="url(#ic3)"/>
  <!-- Right white panel -->
  <rect x="500" y="40" width="460" height="920" rx="20" fill="url(#panel3)" filter="url(#sh3)"/>
  <!-- Title on right panel -->
  ${titleLines(productName, 730, 100, 400, 38, "#1a3a5c")}
  <!-- Divider -->
  <rect x="540" y="220" width="380" height="3" rx="2" fill="#2563EB"/>
  <!-- Feature list -->
  ${[f0, f1, f2, f3].map((f, i) => {
    const y = 280 + i * 140;
    const lines = wrapText(f.toUpperCase(), 20);
    const lh = 24;
    return `
  <circle cx="568" cy="${y + 10}" r="22" fill="#2563EB"/>
  <text x="568" y="${y + 18}" text-anchor="middle" font-size="22" fill="#fff" font-family="Arial,sans-serif">${["✓", "★", "⊕", "♦"][i]}</text>
  ${lines.map((l, j) => `<text x="606" y="${y + j * lh + 18}" font-size="22" fill="#1a3a5c" font-family="Arial,sans-serif" font-weight="700">${escapeXml(l)}</text>`).join("\n")}
  <rect x="540" y="${y + 80}" width="380" height="1" fill="#e0edff"/>`;
  }).join("\n")}
  <!-- Bottom badge -->
  <rect x="540" y="870" width="380" height="60" rx="14" fill="#2563EB"/>
  <text x="730" y="908" text-anchor="middle" font-size="22" fill="#fff" font-family="Arial,sans-serif" font-weight="700">${escapeXml(marketplace.toUpperCase())} • ТОП ПРОДАЖ</text>
</svg>`;
}
