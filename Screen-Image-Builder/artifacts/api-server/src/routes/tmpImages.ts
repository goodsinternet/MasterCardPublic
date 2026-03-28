import { Router, type IRouter } from "express";

export const tmpImageStore = new Map<string, { data: string; mime: string; expiresAt: number }>();

const router: IRouter = Router();

router.get("/:uuid", (req, res) => {
  const entry = tmpImageStore.get(req.params.uuid);
  if (!entry || Date.now() > entry.expiresAt) {
    tmpImageStore.delete(req.params.uuid);
    res.status(404).send("Not found");
    return;
  }
  const buf = Buffer.from(entry.data, "base64");
  res.setHeader("Content-Type", entry.mime);
  res.setHeader("Content-Length", buf.length);
  res.end(buf);
});

export default router;
