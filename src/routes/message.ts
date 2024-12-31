import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  getChatMessages,
  getGroupChatMessages,
  verifyEncryptedChatId,
  verifyEncryptedGroupId,
} from "../controllers/message";

const router = Router();

router.get("/chats/:id", checkAuthorization, getChatMessages);
router.get("/groups/:id", checkAuthorization, getGroupChatMessages);
router.get("/chats/dcrypt/:id", verifyEncryptedChatId, getChatMessages);
router.get("/groups/dcrypt/:id", verifyEncryptedGroupId, getGroupChatMessages);

export { router as messageRouter };
