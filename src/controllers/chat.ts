import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import { Chat } from ".prisma/client";

export const getMyChats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const skip =
      req.query.skip != null ? parseInt(req.query.skip!.toString()) : 0;
    const take = 25;
    const userId = req.user!.id;

    const chats: Chat[] = await prisma.$queryRaw`
      SELECT 
        c.id AS chat_id,
        c.timestamp AS chat_timestamp,
        (
          SELECT MAX(m.timestamp) 
          FROM "Message" m 
          WHERE m."chatId" = c.id
        ) AS last_message_timestamp
      FROM "Chat" c
      INNER JOIN "ChatParticipant" cp ON c.id = cp."chatId"
      WHERE cp."userId" = ${userId}
      ORDER BY last_message_timestamp DESC
      OFFSET ${skip}
      LIMIT ${take}
    `;

    const chatIds = chats.map((chat: any) => chat.chat_id);

    const detailedChats = await prisma.chat.findMany({
      where: {
        id: { in: chatIds },
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
            replyTo: {
              include: {
                sender: true,
              },
            },
          },
        },
      },
    });

    const sortedChats = chatIds.map((id: number) =>
      detailedChats.find((chat) => chat.id === id)
    );

    res.json({
      message: "Fetched Successfully!",
      data: sortedChats,
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
