import { getServerSession } from "next-auth";
import { ExtendedSession } from "src/pages/api/auth/[...nextauth]";

type GetExtendedServerSession = (
  ...args: Parameters<typeof getServerSession>
) => Promise<ExtendedSession>;

export const getExtendedSession = getServerSession as GetExtendedServerSession;
