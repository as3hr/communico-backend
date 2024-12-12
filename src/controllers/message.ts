import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { prisma } from "../config/db_config";

export const getChatMessages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.chatId != null) {
      const messages = await prisma.message.findMany({
        where: {
          chatId: parseInt(req.query.chatId.toString()),
        },
        orderBy: {
          timestamp: "desc",
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
    if (req.query.groupId != null) {
      const messages = await prisma.message.findMany({
        where: {
          groupId: parseInt(req.query.groupId.toString()),
        },
        orderBy: {
          timestamp: "desc",
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
