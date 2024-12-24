import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  createGroup,
  getGroupMembers,
  getMyGroups,
  updateGroup,
} from "../controllers/group";

const router = Router();

router.get("/", checkAuthorization, getMyGroups);
router.post("/", checkAuthorization, createGroup);
router.put("/:id", checkAuthorization, updateGroup);
router.get("/:id/members", checkAuthorization, getGroupMembers);

export { router as groupRouter };
