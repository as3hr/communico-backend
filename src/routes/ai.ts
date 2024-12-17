import Router from "express";
// import { checkAuthorization } from "../middlewares/check_authorization";
import { aiStreamingMessage } from "../controllers/ai";

const router = Router();

router.post("/", aiStreamingMessage);

export { router as aiRouter };
