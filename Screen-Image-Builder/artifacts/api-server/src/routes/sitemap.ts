import { Router } from "express";

const router = Router();

const PAGES = [
  { loc: "/",        changefreq: "weekly",  priority: "1.0" },
  { loc: "/faq",     changefreq: "monthly", priority: "0.8" },
  { loc: "/privacy", changefreq: "yearly",  priority: "0.4" },
  { loc: "/auth",    changefreq: "yearly",  priority: "0.5" },
];

router.get("/sitemap.xml", (req, res) => {
  const domains = process.env.REPLIT_DOMAINS;
  const devDomain = process.env.REPLIT_DEV_DOMAIN;
  const host = domains ? domains.split(",")[0].trim() : (devDomain ?? req.hostname);
  const base = `https://${host}`;
  const now = new Date().toISOString().split("T")[0];

  const urls = PAGES.map(
    (p) => `  <url>
    <loc>${base}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
});

export default router;
