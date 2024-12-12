import Router from "express";
import { checkAuthorization, forMe } from "../middlewares/check_authorization";
import { getIn, getUsers, getChatUsers } from "../controllers/user";

const router = Router();

router.get("/", checkAuthorization, forMe, getUsers);
router.get("/chats", checkAuthorization, getChatUsers);
router.post("/", getIn);

export { router as userRouter };
