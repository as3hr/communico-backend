import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import { createChat, getMyChats } from "../controllers/chat";

const router = Router();

router.get("/", checkAuthorization, getMyChats);
router.post("/", checkAuthorization, createChat);

export { router as chatRouter };
