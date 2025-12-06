"use server";

import z from "zod";

export async function registerEmail(formData: FormData) {
  const email = z.email().parse(formData.get("email"));

  console.log("Registering email:", email);
}
