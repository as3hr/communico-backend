import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  getIn,
  getUsers,
  getChatUsers,
  updateUserPassword,
} from "../controllers/user";

const router = Router();

router.post("/", getIn);
router.put("/", checkAuthorization, updateUserPassword);
router.get("/", checkAuthorization, getUsers);
router.get("/chats", checkAuthorization, getChatUsers);

export { router as userRouter };
