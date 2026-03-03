"use server";

import { applyRateLimiterBasedOnIP } from "@/utils/apply-rate-limiter-based-on-ip";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  const { success } = await applyRateLimiterBasedOnIP();

  if (!success) {
    return {
      success: false,
      error: "Too many requests, please try again later.",
    };
  }

  (await cookies()).delete("token");

  redirect("/acing-aufnahmetest");
}
