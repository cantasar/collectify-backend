import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodError, ZodType } from "zod";
import { ValidationError } from "../utils/errors";

const formatZodIssues = (error: ZodError): Array<{ field: string; message: string }> => {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};

type RequestSource = "body" | "query" | "params";

const SOURCE_LABELS: Record<RequestSource, string> = {
  body: "Invalid request body",
  query: "Invalid query parameters",
  params: "Invalid URL parameters",
};

const validate = <T>(source: RequestSource, schema: ZodType<T>): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(new ValidationError(SOURCE_LABELS[source], formatZodIssues(result.error)));
      return;
    }

    req[source] = result.data;
    next();
  };
};

export const validateBody = <T>(schema: ZodType<T>): RequestHandler => validate("body", schema);

export const validateQuery = <T>(schema: ZodType<T>): RequestHandler => validate("query", schema);

export const validateParams = <T>(schema: ZodType<T>): RequestHandler => validate("params", schema);
