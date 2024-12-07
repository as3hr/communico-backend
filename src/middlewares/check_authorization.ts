import { Request, NextFunction, Response } from "express";
import { prisma } from "../config/db_config";
import { HttpError } from "../helpers/http_error";
import JWT from "jsonwebtoken";

interface DecodedToken {
  userid: number;
}

export const checkAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw HttpError.unAuthorized();
    }

    const token = authHeader.split("Bearer ")[1];
    const decoded = JWT.verify(token, process.env.JWT_SECRET!) as DecodedToken;

    if (!decoded || !decoded.userid) {
      throw HttpError.unAuthorized();
    }

    const userId = decoded.userid;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw HttpError.unAuthorized();
    }

    req.user = user;
    next();
  } catch (err) {
    next(HttpError.unAuthorized());
  }
};

export const forMe = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.me) {
    next();
  } else {
    throw HttpError.unAuthorized();
  }
};
