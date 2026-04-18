import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { mockUsers } from "@/lib/mock-data";

export const usersRouter = router({
  list: publicProcedure
    .input(z.object({ teamId: z.string().default("team-1") }))
    .query(({ input }) => {
      return mockUsers.filter((u) => u.team_id === input.teamId);
    }),

  getById: publicProcedure.input(z.string()).query(({ input }) => {
    return mockUsers.find((u) => u.id === input) || null;
  }),

  getCurrent: publicProcedure.query(() => {
    return mockUsers[0]; // Default to first user for demo
  }),
});
