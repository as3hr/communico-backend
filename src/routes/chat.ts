import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  createChat,
  getChatById,
  getDecryptedChatId,
  getEncryptedChatLink,
  getMyChats,
} from "../controllers/chat";

const router = Router();

router.get("/", checkAuthorization, getMyChats);
router.get("/:id", checkAuthorization, getChatById);
router.post("/", checkAuthorization, createChat);
router.get("/link/:id", checkAuthorization, getEncryptedChatLink);
router.get("/dcrypt", checkAuthorization, getDecryptedChatId);

export { router as chatRouter };
