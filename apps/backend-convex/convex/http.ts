import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// Mount all Better Auth route handlers (/api/auth/*)
authComponent.registerRoutes(http, createAuth);

export default http;
