import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import JWT from "jsonwebtoken";

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany();
    res.json({
      message: "Fetched SuccessFully!",
      data: users,
    });
  }
);

export const getIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (user) {
      return res.json({
        message: "User LoggedIn!",
        data: {
          token: getToken(user.id),
          user: user,
        },
      });
    }
    const newUser = await prisma.user.create({
      data: {
        username: username,
        me: false,
      },
    });
    return res.json({
      message: "User created successfully!",
      data: {
        token: getToken(newUser.id),
        user: newUser,
      },
    });
  }
);

const getToken = (userId: number) => {
  const token = JWT.sign(
    { userid: userId },
    process.env.JWT_SECRET!.toString()
  );
  return token;
};
