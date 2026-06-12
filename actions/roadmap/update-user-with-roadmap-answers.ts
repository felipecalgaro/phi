"use server";

import { verifySession } from "@/lib/dal";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const requestSchema = z.object({
  countryOfHighschool: z.string().min(1),
  citizenships: z.array(z.string()).min(1),
  plannedStudienkollegs: z.array(z.uuid()),
  plannedAttendance: z.object({
    year: z.coerce.number().int(),
    semester: z.enum(["WINTER", "SUMMER"]),
  }),
  subscribedToMarketing: z.boolean(),
});

export async function updateUserWithRoadmapAnswers(request: unknown) {
  const { userId } = await verifySession();

  if (!userId) {
    return {
      success: false,
      error: "Unauthorized. Please log in and try again.",
    };
  }

  const requestData = requestSchema.safeParse(request);

  if (!requestData.success) {
    return {
      success: false,
      error: "Invalid request data. Please check the form and try again.",
    };
  }

  const {
    countryOfHighschool,
    citizenships,
    plannedStudienkollegs,
    plannedAttendance: { year, semester },
    subscribedToMarketing,
  } = requestData.data;

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      countryOfHighschool,
      citizenships,
      plannedStudienkollegs,
      plannedAttendanceYear: year,
      plannedAttendanceSemester: semester,
      subscribedToMarketing,
    },
  });

  redirect("/roadmap");
}
