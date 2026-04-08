import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    res.status(400).json({ error: "imageBase64 is required" });
    return;
  }

  try {
    const { removeBackground } = await import("@imgly/background-removal-node");

    const inputBuffer = Buffer.from(imageBase64, "base64");

    const resultBlob = await removeBackground(inputBuffer, {
      model: "small",
      output: { format: "image/png" },
    } as any);

    const arrayBuffer = await resultBlob.arrayBuffer();
    const resultBase64 = Buffer.from(arrayBuffer).toString("base64");

    res.json({ imageBase64: resultBase64, mimeType: "image/png" });
  } catch (e: any) {
    console.error("Background removal error:", e);
    res.status(500).json({ error: "Не удалось удалить фон: " + (e?.message ?? String(e)) });
  }
});

export default router;
