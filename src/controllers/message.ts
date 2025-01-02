import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";
import { getDecryptedId } from "../helpers/utils";

export const getChatMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id != null) {
      const messages = await prisma.message.findMany({
        skip: req.query.skip != null ? parseInt(req.query.skip!.toString()) : 0,
        take: 25,
        where: {
          chatId: parseInt(req.params.id.toString()),
        },
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
      });
      return res.json({
        message: "Fetched SuccessFully!",
        data: messages,
      });
    } else {
      return res.status(400).json({ message: "Invalid Chat ID!" });
    }
  }
);

export const getGroupChatMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.params.id != null) {
      const messages = await prisma.message.findMany({
        skip: req.query.skip != null ? parseInt(req.query.skip!.toString()) : 0,
        take: 25,
        where: {
          groupId: parseInt(req.params.id.toString()),
        },
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
      });
      return res.json({
        message: "Fetched SuccessFully!",
        data: messages,
      });
    } else {
      return res.status(400).json({ message: "Invalid Group ID!" });
    }
  }
);

export const verifyEncryptedChatId = asyncHandler(
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
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat Not Found!" });
    }

    return next();
  }
);

export const verifyEncryptedGroupId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const encryptedData = req.query.encryptedData;
    if (!encryptedData) {
      return res.status(400).json({ message: "Encrypted Data is required!" });
    }

    const decryptedId = getDecryptedId(encryptedData.toString());
    const groupId = parseInt(decryptedId);

    if (!groupId) {
      return res.status(400).json({ message: "Group Not Found!" });
    }

    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group Not Found!" });
    }

    return next();
  }
);
