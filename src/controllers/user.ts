import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import JWT from "jsonwebtoken";

export const getUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await prisma.user.findMany({
      where: {
        me: false,
      },
    });
    res.json({
      message: "Fetched SuccessFully!",
      data: users,
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
    const { username } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username, me: false },
    });

    if (existingUser) {
      return res.json({
        message: "Welcome back!",
        token: getToken(existingUser.id),
        data: existingUser,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        me: false,
      },
    });

    let myself;
    myself = await prisma.user.findUnique({
      where: { username: "as3hr", me: true },
    });

    if (!myself) {
      myself = await prisma.user.create({
        data: {
          username: "as3hr",
          me: true,
        },
      });
    }

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
