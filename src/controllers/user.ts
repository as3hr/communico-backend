import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import { HttpError } from "../helpers/http_error";

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      where: {
        AND: {
          me: false,
          NOT: {
            id: req.user.id,
          },
        },
      },
    });
    res.json({
      message: "Fetched SuccessFully!",
      data: users,
    });
  }
);

export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.password;
    const hashedPassword = await hashPassword(newPassword);
    const user = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });
    res.json({
      message: "Passowrd Updated Successfully",
      data: user,
    });
  }
);

export const getChatUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      where: {
        NOT: {
          chats: {
            some: {
              chat: {
                participants: {
                  some: {
                    userId: req.user!.id,
                  },
                },
              },
            },
          },
        },
      },
    });
    res.json({
      message: "Fetched SuccessFully!",
      data: users,
    });
  }
);

export const getIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    console.log(existingUser?.username);
    console.log(existingUser?.password);
    console.log(password);

    if (username != null && password == null && existingUser) {
      if (existingUser.password) {
        throw new HttpError("Password Protected!", "invalid-credentials", 401);
      }

      return res.json({
        message: "Welcome back!",
        token: getToken(existingUser.id),
        data: existingUser,
      });
    }

    if (username != null && password != null && existingUser) {
      if (
        !existingUser.password ||
        !(await comparePassword(password, existingUser.password))
      ) {
        throw new HttpError("Invalid credentials!", "invalid-credentials", 401);
      }

      return res.json({
        message: "Welcome back!",
        token: getToken(existingUser.id),
        data: existingUser,
      });
    }

    let myself = await prisma.user.findUnique({
      where: { username: "as3hr", me: true },
    });

    if (!myself) {
      const hashedPassword = password
        ? await hashPassword(process.env.APP_PASSWORD!)
        : null;
      myself = await prisma.user.create({
        data: {
          username: "as3hr",
          me: true,
          password: hashedPassword,
        },
      });
    }

    const hashedPassword = password ? await hashPassword(password) : null;
    const newUser = await prisma.user.create({
      data: {
        username,
        me: false,
        password: hashedPassword,
      },
    });

    const chat = await prisma.chat.create({
      data: {
        participants: {
          createMany: {
            data: [{ userId: myself.id }, { userId: newUser.id }],
          },
        },
      },
      include: {
        participants: true,
      },
    });

    await prisma.message.create({
      data: {
        text: `Hey there ${newUser.username}! 🎉 I'm Ashar, and I'm thrilled to welcome you to Communico! 🚀 Here, you can connect with friends, jam out to our cool radio, chat with an AI buddy, and just vibe in your own space. 🎧✨ Got feedback or thoughts? Hit me up right here—I'd love to hear what you think about the project. 🌟`,
        userId: myself.id,
        chatId: chat.id,
      },
    });

    return res.json({
      message: "User created successfully and welcome message sent!",
      token: getToken(newUser.id),
      data: newUser,
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

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
