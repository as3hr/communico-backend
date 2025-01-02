import { Request, NextFunction, Response } from "express";
import Router from "express";
import { checkAuthorization } from "../middlewares/check_authorization";

const router = Router();

router.post(
  "/verify",
  checkAuthorization,
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user.id != null) {
      res.json({ message: "Authorized", isAuthenticated: true });
    } else {
      res.json({ message: "Unauthorized", isAuthenticated: false });
    }
  }
);

export { router as authRouter };
