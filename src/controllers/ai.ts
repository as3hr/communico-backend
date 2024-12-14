import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!.toString());
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

export const aiStreamingMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.query.prompt != null) {
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      const result = await model.generateContentStream(
        req.query.prompt!.toString()
      );
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
        res.write(chunkText);
      }
      res.end();
    } else {
      res.send("Failed");
    }
  }
);
