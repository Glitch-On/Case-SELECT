import { Router } from "express";
import sqlIdeRoutes from "./sqlIdeRoutes.js";

const router = Router();

router.use("/api/ide", sqlIdeRoutes);

export default router;
