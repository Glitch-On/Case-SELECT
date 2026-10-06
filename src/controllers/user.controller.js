import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "../config/index.js";

let prisma = null;

async function getPrisma() {
  if (prisma) return prisma;

  const { PrismaClient } = await import("../../generated/prisma/client.ts");

  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({ adapter });

  return prisma;
}

/**
 * Lists a player's progress rows, one per case they have started.
 *
 * Read-only passthrough added so the dashboard can render case status.
 * The app has no authentication yet, so the player id comes from the route —
 * see SUGGESTED_IMPROVEMENTS.md before exposing this in production.
 *
 * A case with no row here has simply not been started; the frontend derives
 * "not started" from its absence rather than the server inventing a status.
 */
export const getUserProgress = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "User id must be an integer",
      });
    }

    const client = await getPrisma();

    const progress = await client.userProgress.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        caseId: "asc",
      },
      include: {
        location: true,
      },
    });

    res.status(200).json(
      progress.map(({ location, ...rest }) => ({
        ...rest,
        locationName: location?.locationName ?? null,
      })),
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user progress",
    });
  }
};
