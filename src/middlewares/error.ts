import { NextFunction, Request, Response } from "express";
import { HttpError } from "../helpers/http_error";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.log(err);

  if (err.name === "CastError") {
    const message = err.message;
    error = HttpError.invalidParameters(message);
  }

  if (err.code === 11000) {
    const message = Object.keys(err.keyPattern);
    error = new HttpError(message, "duplicate-values", 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val: any) => val.message);
    error = new HttpError(message, "invalid-values", 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    code: error.code || "server-error",
    message: error.message,
  });
};

export { errorHandler };
