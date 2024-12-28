import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";
import {
  createGroup,
  getDecryptedGroupId,
  getEncryptedGroupLink,
  getGroupById,
  getGroupMembers,
  getMyGroups,
  updateGroup,
} from "../controllers/group";

const router = Router();

router.get("/", checkAuthorization, getMyGroups);
router.get("/:id", checkAuthorization, getGroupById);
router.post("/", checkAuthorization, createGroup);
router.put("/:id", checkAuthorization, updateGroup);
router.get("/:id/members", checkAuthorization, getGroupMembers);
router.get("/link/:id", checkAuthorization, getEncryptedGroupLink);
router.get("/dcrypt", checkAuthorization, getDecryptedGroupId);

export { router as groupRouter };
