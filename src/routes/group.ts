import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import { createGroup, getMyGroups } from "../controllers/group";

const router = Router();

router.get("/", checkAuthorization, getMyGroups);
router.post("/", checkAuthorization, createGroup);

export { router as groupRouter };
