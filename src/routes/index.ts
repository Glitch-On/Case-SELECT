import { Router } from "express";
import sqlIdeRoutes from "./sqlIdeRoutes.ts";

const router = Router();

router.use("/api/ide", sqlIdeRoutes);

export default router;
