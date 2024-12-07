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

const app = express();
const httpServer = createServer(app);
dotenv.config({ path: ".env" });
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.enable("trust proxy");

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
socketImpl(io);

app.use("/users", userRouter);
app.use("/chats", chatRouter);
app.use("/groups", groupRouter);
app.use("/messages", messageRouter);

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
