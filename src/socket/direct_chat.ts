import { DefaultEventsMap, Server, Socket } from "socket.io";
import { prisma } from "../config/db_config";
import { Message } from "@prisma/client";

export const privateChatImpl = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("roomJoin", (message) => {
    console.log("A MEMEBER JOINED THE ROOM!");
    socket.join(`${message.chatId}`);
  });

  socket.on("leaveRoom", (message) => {
    console.log("LEFT FROM CHAT ROOM!");
    socket.leave(`${message.chatId}`);
  });

  socket.on("message", async (message: Message) => {
    if (message.chatId != null) {
      const chatId = `${message.chatId}`;
      const createdMessage = await prisma.message.create({
        data: {
          text: message.text,
          userId: message.userId,
          chatId: message.chatId,
          replyToId: message.replyToId,
        },
        include: {
          sender: true,
          replyTo: true,
        },
      });
      console.log(`NEW MESSAGE EVENT EMITTED IN DIRECT: ${createdMessage}`);
      io.to(chatId).emit("newMessage", { ...createdMessage });
    }
  });

  socket.on("chatCreation", async (message) => {
    const chat = await prisma.chat.findUnique({
      where: { id: message.chatId },
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
    const userId: number = message.userId;
    if (chat != null) {
      const participant = chat.participants.find(
        (participant) => participant.userId != userId
      );
      if (participant != null) {
        io.to(participant.userId.toString()).emit("newChat", {
          chat: chat,
          userId: userId,
        });
      }
    }
  });

  socket.on("messageDeleted", async (message: Message) => {
    const chatId = `${message.chatId}`;
    await prisma.message.delete({
      where: {
        id: message.id,
        chatId: message.chatId,
      },
    });
    io.to(chatId).emit("messageDeletion", { ...message });
  });

  socket.on("messageUpdated", async (message: Message) => {
    const chatId = `${message.chatId}`;
    await prisma.message.update({
      data: {
        text: message.text,
      },
      where: {
        id: message.id,
        chatId: message.chatId,
      },
    });
    io.to(chatId).emit("messageUpdation", { ...message });
  });

  socket.on("messageTyping", (message) => {
    io.to(`${message.chatId}`).emit("newMessageTyping", {
      isTyping: message.isTyping,
      user: message.userId,
    });
  });
};
