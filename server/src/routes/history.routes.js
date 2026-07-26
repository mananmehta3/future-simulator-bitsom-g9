import { Router } from "express";
import { listHistory, getHistoryItem } from "../controllers/history.controller.js";

const router = Router();

router.get("/", listHistory);
router.get("/:id", getHistoryItem);

export default router;
