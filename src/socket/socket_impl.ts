import { DefaultEventsMap, Server } from "socket.io";
import { aiImpl } from "./ai_response";
import { groupChatImpl } from "./group_chat";
import { privateChatImpl } from "./direct_chat";

export const socketImpl = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.on("connection", (socket) => {
    console.log("Socket Connected!");

    groupChatImpl(io, socket);
    privateChatImpl(io, socket);
    aiImpl(socket);

    socket.on("disconnect", (_) => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};
