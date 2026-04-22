import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { createApp } from "./app";
// import * as logger from "firebase-functions/logger";

setGlobalOptions({ maxInstances: 10 });

const app = createApp();

export const api = onRequest(app);
