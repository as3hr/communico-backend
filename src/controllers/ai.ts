import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiStreamingMessage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.query.prompt) {
        return res.status(400).send("No prompt provided");
      }

      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY!.toString()
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("X-Accel-Buffering", "no");

      const result = await model.generateContentStream(
        req.query.prompt!.toString()
      );

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }

      return res.end();
    } catch (error) {
      console.error("Streaming error:", error);
      return res.send({
        message: "Failed to generate AI response",
      });
    }
  }
);
