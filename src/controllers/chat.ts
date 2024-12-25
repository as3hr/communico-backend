import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getMyChats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chats = await prisma.chat.findMany({
      skip: req.query.skip != null ? parseInt(req.query.skip!.toString()) : 0,
      take: 25,
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
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          include: {
            sender: true,
            replyTo: true,
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
    const { participant, message } = req.body;
    const chat = await prisma.chat.create({
      data: {
        participants: {
          createMany: {
            data: [
              {
                userId: req.user.id,
              },
              {
                userId: participant.userId,
              },
            ],
          },
        },
      },
      include: {
        participants: true,
      },
    });
    await prisma.message.create({
      data: {
        chatId: chat.id,
        userId: req.user.id,
        text: message.text,
      },
    });
    const createdChat = await prisma.chat.findUnique({
      where: {
        id: chat.id,
      },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: {
            timestamp: "desc",
          },
          include: {
            sender: true,
          },
        },
      },
    });
    return res.json({ message: "Chat Created!", data: createdChat });
  }
);
