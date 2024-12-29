import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import { Chat } from ".prisma/client";
import { getDecryptedId, getEncryptedLink } from "../helpers/utils";

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

export const getChatByEncryptedId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const encryptedData = req.query.encryptedData;
    if (!encryptedData) {
      return res.status(400).json({ message: "Encrypted Data is required!" });
    }

    const decryptedId = getDecryptedId(encryptedData.toString());
    const chatId = parseInt(decryptedId);

    if (!chatId) {
      return res.status(400).json({ message: "Chat Not Found!" });
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
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
          take: 25,
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat Not Found!" });
    }

    return res.json({
      message: "Fetched Successfully!",
      data: chat,
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

export const getEncryptedChatLink = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const chatId = req.params.id != null ? parseInt(req.params.id) : null;
    if (!chatId) {
      return res.status(400).json({ message: "Chat Id is required!" });
    }
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found!" });
    }
    let link = chat.link;
    if (!link) {
      link = getEncryptedLink(chatId);
      await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          link: link,
        },
      });
    }
    return res.json({ message: "Link updated!", data: link });
  }
);
