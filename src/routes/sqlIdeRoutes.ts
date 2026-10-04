import { Router } from "express";
import { sqlIdeController } from "../controllers/sqlIdeController.ts";

const router = Router();

router.get("/status", sqlIdeController.status);
router.post("/connect", sqlIdeController.connect);
router.post("/disconnect", sqlIdeController.disconnect);
router.get("/schema", sqlIdeController.schema);
router.post("/query", sqlIdeController.query);
router.post("/command", sqlIdeController.command);

export default router;
