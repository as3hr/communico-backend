import { DefaultEventsMap, Server, Socket } from "socket.io";
import { prisma } from "./src/config/db_config";
import { Message } from "@prisma/client";

export const socketImpl = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected!");

    groupChatImpl(io, socket);
    privateChatImpl(io, socket);

    socket.on("disconnect", (_) => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const groupChatImpl = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("groupJoin", (message) => {
    console.log("NEW MEMBER JOINED THE GROUP!");
    socket.join(`${message.groupId}`);
  });

  socket.on("groupMessage", (message: Message) => {
    if (message.groupId != null) {
      const groupId = `${message.groupId}`;
      prisma.message.create({
        data: {
          text: message.text,
          userId: message.userId,
          groupId: message.groupId,
        },
      });
      console.log("NEW GROUP MESSAGE RECIEVED!");
      io.to(groupId).emit(groupId, `${message}`);
    }
  });

  socket.on("groupMessageTyping", async (message) => {
    if (message.groupId != null) {
      const user = await prisma.user.findUnique({
        where: { id: message.userId },
      });
      io.to(`${message.groupId}`).emit(`${message.groupId}`, {
        isTyping: message.isTyping,
        user: user,
      });
    }
  });
};

const privateChatImpl = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("roomJoin", (message) => {
    console.log("A MEMEBER JOINED THE ROOM!");
    socket.join(`${message.chatId}`);
  });

  socket.on("message", (message: Message) => {
    if (message.chatId != null) {
      console.log("NEW CHAT ROOM MESSAGE RECIEVED!");
      const chatId = `${message.chatId}`;
      prisma.message.create({
        data: {
          text: message.text,
          userId: message.userId,
          chatId: message.chatId,
        },
      });
      io.to(chatId).emit(chatId, `message: ${message}`);
    }
  });

  socket.on("messageTyping", (message) => {
    io.to(`${message.chatId}`).emit(`${message.chatId}`, {
      isTyping: message.isTyping,
      user: message.userId,
    });
  });
};
