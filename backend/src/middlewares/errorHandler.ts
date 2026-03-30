import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError } from "jsonwebtoken";
import { AppError } from "../utils/errors.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
    let statusCode: number;
    let message: string;
    let errors: { field: string; message: string }[] | undefined;

    if (err instanceof ZodError) {
        statusCode = 400;
        message = "Validation error";
        errors = err.issues.map((e) => ({ field: e.path.join("."), message: e.message }));
    } else if (err instanceof JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid or expired access token";
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
        statusCode = 500;
        message = "Internal server error";
        console.error(err);
    }

    res.status(statusCode).json({ message, ...(errors && { errors }) });
}
