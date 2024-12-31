import { GoogleGenerativeAI } from "@google/generative-ai";
import { DefaultEventsMap } from "socket.io";
import { Socket } from "socket.io/dist/socket";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

export const aiImpl = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("aiPrompt", async (message) => {
    const result = await model.generateContentStream(message.prompt);
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      socket.emit("aiResponse", chunkText);
    }
  });
};
