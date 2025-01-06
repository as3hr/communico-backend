import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../helpers/http_error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error: ", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[]) || [];
      const message = `Duplicate value for field(s): ${fields.join(", ")}`;
      error = new HttpError(message, "duplicate-values", 400);
    } else if (err.code === "P2025") {
      const message = "Record not found.";
      error = new HttpError(message, "not-found", 404);
    } else {
      const message = err.message || "Database error occurred.";
      error = new HttpError(message, "prisma-error", 500);
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const message = "Invalid data provided to Prisma query.";
    error = new HttpError(message, "invalid-values", 400);
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    const message = "Database connection failed.";
    error = new HttpError(message, "db-connection-error", 500);
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    const message = "Unexpected error in Prisma engine.";
    error = new HttpError(message, "unexpected-error", 500);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    code: error.code || "server-error",
    message: error.message || "An unexpected error occurred.",
  });
};

export { errorHandler };
