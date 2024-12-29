import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  createGroup,
  getEncryptedGroupLink,
  getGroupByEncryptedId,
  getGroupMembers,
  getMyGroups,
  updateGroup,
} from "../controllers/group";

const router = Router();

router.get("/", checkAuthorization, getMyGroups);
router.post("/", checkAuthorization, createGroup);
router.get("/dcrypt", getGroupByEncryptedId);
router.put("/:id", checkAuthorization, updateGroup);
router.get("/:id/members", checkAuthorization, getGroupMembers);
router.get("/link/:id", checkAuthorization, getEncryptedGroupLink);

export { router as groupRouter };
