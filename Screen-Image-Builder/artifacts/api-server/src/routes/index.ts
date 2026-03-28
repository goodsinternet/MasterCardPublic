import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import generateRouter from "./generate.js";
import referralRouter from "./referral.js";
import tmpImagesRouter from "./tmpImages.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/generate", generateRouter);
router.use("/generations", generateRouter);
router.use("/referral", referralRouter);
router.use("/tmp", tmpImagesRouter);
router.use("/admin", adminRouter);

export default router;
