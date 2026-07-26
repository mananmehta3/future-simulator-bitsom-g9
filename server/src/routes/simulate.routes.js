import { Router } from "express";
import { runSimulation } from "../controllers/simulate.controller.js";

const router = Router();

router.post("/", runSimulation);

export default router;
