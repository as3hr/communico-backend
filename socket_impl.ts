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

  socket.on("leaveGroup", (message) => {
    console.log("LEFT FROM GROUP ROOM!");
    socket.leave(`${message.groupId}`);
  });

  socket.on("groupMessage", async (message: Message) => {
    if (message.groupId != null) {
      const groupId = `${message.groupId}`;
      const createdMessage = await prisma.message.create({
        data: {
          text: message.text,
          userId: message.userId,
          groupId: message.groupId,
          replyToId: message.replyToId,
        },
        include: {
          sender: true,
          replyTo: true,
        },
      });
      console.log(`NEW GROUP MESSAGE EMITTED: ${createdMessage}`);
      io.to(groupId).emit("newGroupMessage", { ...createdMessage });
    }
  });

  socket.on("groupMessageDeleted", async (message: Message) => {
    const groupId = `${message.groupId}`;
    await prisma.message.delete({
      where: {
        id: message.id,
        groupId: message.groupId,
      },
    });
    io.to(groupId).emit("groupMessageDeletion", { ...message });
  });

  socket.on("groupMessageUpdated", async (message: Message) => {
    const groupId = `${message.groupId}`;
    await prisma.message.update({
      data: {
        text: message.text,
      },
      where: {
        id: message.id,
        groupId: message.groupId,
      },
    });
    io.to(groupId).emit("groupMessageUpdation", { ...message });
  });

  socket.on("groupMessageTyping", async (message) => {
    if (message.groupId != null) {
      const user = await prisma.user.findUnique({
        where: { id: message.userId },
      });
      io.to(`${message.groupId}`).emit("newGroupMessageTyping", {
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
