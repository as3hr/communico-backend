import Router from "express";
import { checkAuthorization, forMe } from "../middlewares/check_authorization";
import { getIn, getUsers } from "../controllers/user";

const router = Router();

router.get("/", checkAuthorization, forMe, getUsers);
router.post("/", getIn);

export { router as userRouter };
