import { DefaultEventsMap, Server, Socket } from "socket.io";
import { prisma } from "../config/db_config";
import { Message } from "@prisma/client";

export const groupChatImpl = (
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

  socket.on("groupCreation", async (message) => {
    const group = await prisma.group.findUnique({
      where: { id: message.groupId },
      include: {
        members: true,
        messages: {
          include: { sender: true, replyTo: { include: { sender: true } } },
        },
      },
    });
    const userId: number = message.userId;
    if (group != null) {
      group.members.forEach((member) => {
        io.to(member.userId.toString()).emit("newGroup", {
          group: group,
          userId: userId,
        });
      });
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
};
