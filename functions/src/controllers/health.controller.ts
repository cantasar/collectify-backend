import { RequestHandler } from "express";

export const healthCheck: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: "ok",
    serviceId: process.env.SERVICE_ID,
  });
};
