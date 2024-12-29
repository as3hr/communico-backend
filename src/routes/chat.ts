import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  createChat,
  getChatByEncryptedId,
  getEncryptedChatLink,
  getMyChats,
} from "../controllers/chat";

const router = Router();

router.get("/", checkAuthorization, getMyChats);
router.post("/", checkAuthorization, createChat);
router.get("/dcrypt", getChatByEncryptedId);
router.get("/link/:id", checkAuthorization, getEncryptedChatLink);

export { router as chatRouter };
