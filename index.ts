import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { socketImpl } from "./socket_impl";
import { dbConnection } from "./src/config/db_config";
import { userRouter } from "./src/routes/user";
import { errorHandler } from "./src/middlewares/error";
import { User } from "@prisma/client";
import { chatRouter } from "./src/routes/chat";
import { messageRouter } from "./src/routes/message";
import { groupRouter } from "./src/routes/group";
import { aiRouter } from "./src/routes/ai";

const app = express();
const httpServer = createServer(app);
dotenv.config({ path: ".env" });
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.enable("trust proxy");

const io = new Server(httpServer, {
  cors: {
    origin: "https://communico.as3hr.dev",
    credentials: true,
  },
  path: "/socket.io/",
});

socketImpl(io);

app.use("/api/users", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/groups", groupRouter);
app.use("/api/messages", messageRouter);
app.use("/api/ai", aiRouter);

declare module "express-serve-static-core" {
  interface Request {
    user: User;
  }
}

app.use(errorHandler);

httpServer.listen(5000, () => {
  console.log("Server is running on port 5000");
  dbConnection();
});
