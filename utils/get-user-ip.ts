import { headers } from "next/headers";
import "server-only";

export async function getUserIp() {
  const headersList = await headers();

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return (
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip")
  );
}
