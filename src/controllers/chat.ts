import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getMyChats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chats = await prisma.chat.findMany({
      include: {
        participants: {
          where: {
            userId: req.user!.id,
          },
        },
      },
    });
    res.json({
      message: "Fetched SuccessFully!",
      data: chats,
    });
  }
);

export const createChat = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { participants } = req.body;
    const chat = await prisma.chat.create({
      data: {
        participants: participants,
      },
    });
    return res.json({ message: "Chat Created!", data: chat });
  }
);
