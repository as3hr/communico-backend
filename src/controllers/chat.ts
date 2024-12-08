import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getMyChats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: true,
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
    const { participants, messages } = req.body;
    const chat = await prisma.chat.create({
      data: {
        participants: participants,
        messages: messages,
      },
    });
    return res.json({ message: "Chat Created!", data: chat });
  }
);
