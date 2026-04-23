import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { defineSecret } from "firebase-functions/params";
import { createApp } from "./app";
// import * as logger from "firebase-functions/logger";

const SERVICE_ID = defineSecret("SERVICE_ID");

setGlobalOptions({ maxInstances: 10 });

export const api = onRequest({ secrets: [SERVICE_ID] }, createApp());
