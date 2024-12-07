import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import { getChatMessages, getGroupChatMessages } from "../controllers/message";

const router = Router();

router.get("/chats", checkAuthorization, getChatMessages);
router.get("/groups", getGroupChatMessages);

export { router as messageRouter };
