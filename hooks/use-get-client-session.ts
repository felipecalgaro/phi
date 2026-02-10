import { Role } from "@/generated/prisma/enums";
import { getResponseDataSchema } from "@/utils/get-response-data-object";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

const userSessionSchema = getResponseDataSchema(
  z.object({
    isAuthenticated: z.boolean(),
    userRole: z.enum(Role).nullable(),
  }),
);

export function useGetClientSession() {
  return useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      let parsedResponse: z.infer<typeof userSessionSchema>;
      try {
        const response = await fetch("/api/user-session");
        parsedResponse = userSessionSchema.parse(await response.json());
      } catch {
        toast.error("Internal server error");
        throw new Error("Internal server error");
      }

      if (!parsedResponse.success) {
        throw new Error(parsedResponse.error);
      }

      return parsedResponse.data;
    },
    staleTime: Infinity,
  });
}
