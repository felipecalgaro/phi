"use server";

import { applyRateLimiter } from "@/utils/apply-rate-limiter";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  const { success } = await applyRateLimiter({
    failureMode: "fail-closed",
  });

  if (!success) {
    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  (await cookies()).delete("token");

  redirect("/acing-aufnahmetest");
}
