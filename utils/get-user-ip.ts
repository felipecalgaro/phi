import { headers } from "next/headers";
import "server-only";

function parseClientIp(value: string | null) {
  if (!value) return null;

  const firstValue = value.split(",")[0]?.trim();

  if (!firstValue || firstValue.toLowerCase() === "unknown") {
    return null;
  }

  return firstValue;
}

export async function getUserIp() {
  const headersList = await headers();

  if (process.env.NODE_ENV === "development") {
    return "127.0.0.1";
  }

  return (
    parseClientIp(headersList.get("x-forwarded-for")) ||
    parseClientIp(headersList.get("x-real-ip")) ||
    parseClientIp(headersList.get("cf-connecting-ip"))
  );
}
