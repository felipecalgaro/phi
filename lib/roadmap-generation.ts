import "server-only";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/redis";

const ROADMAP_GENERATION_TTL_SECONDS = 60 * 15;

export const roadmapAnswersSchema = z.object({
  countryOfHighschool: z.string().min(1),
  citizenships: z.array(z.string()).min(1),
  plannedStudienkollegs: z.array(z.uuid()),
  plannedAttendance: z.object({
    year: z.coerce.number().int(),
    semester: z.enum(["WINTER", "SUMMER"]),
  }),
  subscribedToMarketing: z.boolean(),
});

export type RoadmapAnswers = z.infer<typeof roadmapAnswersSchema>;

type SaveRoadmapAnswersOptions = {
  userId: string;
  answers: RoadmapAnswers;
};

type StorePendingRoadmapAnswersOptions = {
  jti: string;
  answers: RoadmapAnswers;
};

export function getRoadmapGenerationKey(jti: string) {
  return `roadmap_generation:${jti}`;
}

export async function storePendingRoadmapAnswers({
  jti,
  answers,
}: StorePendingRoadmapAnswersOptions) {
  await redis.set(getRoadmapGenerationKey(jti), JSON.stringify(answers), {
    ex: ROADMAP_GENERATION_TTL_SECONDS,
  });
}

export async function getPendingRoadmapAnswers(jti: string) {
  const storedAnswers = await redis.get(getRoadmapGenerationKey(jti));

  if (!storedAnswers) {
    return null;
  }

  let parsedAnswers: unknown = storedAnswers;

  if (typeof storedAnswers === "string") {
    try {
      parsedAnswers = JSON.parse(storedAnswers);
    } catch {
      return null;
    }
  }

  const result = roadmapAnswersSchema.safeParse(parsedAnswers);

  if (!result.success) {
    return null;
  }

  return result.data;
}

export async function deletePendingRoadmapAnswers(jti: string) {
  await redis.del(getRoadmapGenerationKey(jti));
}

export async function saveRoadmapAnswersForUser({
  userId,
  answers,
}: SaveRoadmapAnswersOptions) {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: getRoadmapUserData(answers),
  });
}

export function getRoadmapUserData(answers: RoadmapAnswers) {
  return {
    countryOfHighschool: answers.countryOfHighschool,
    citizenships: answers.citizenships,
    plannedStudienkollegs: answers.plannedStudienkollegs,
    plannedAttendanceYear: answers.plannedAttendance.year,
    plannedAttendanceSemester: answers.plannedAttendance.semester,
    subscribedToMarketing: answers.subscribedToMarketing,
  };
}
