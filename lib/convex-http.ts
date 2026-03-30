import { ConvexHttpClient } from "convex/browser";

export function createConvexHttpClient() {
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
}
