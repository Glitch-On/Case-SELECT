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
 * Lists every case for the frontend case-select grid.
 *
 * Read-only passthrough used by the dashboard; it introduces no game rules.
 * `stepCount` is a plain count of the case's CaseProgress rows so the UI can
 * show progress without loading every step.
 */
export const getCases = async (_req, res) => {
  try {
    const client = await getPrisma();

    const cases = await client.case.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        _count: {
          select: {
            steps: true,
          },
        },
      },
    });

    res.status(200).json(
      cases.map(({ _count, ...rest }) => ({
        ...rest,
        stepCount: _count.steps,
      })),
    );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch cases",
    });
  }
};

export const getCase = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getPrisma();

    const gameCase = await client.case.findUnique({
      where: {
        id: id,
      },
    });

    if (!gameCase) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    res.status(200).json(gameCase);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch case",
    });
  }
};

export const getCaseSteps = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getPrisma();

    const steps = await client.caseProgress.findMany({
      where: {
        caseId: id,
      },
      orderBy: {
        sequenceId: "asc",
      },
      include: {
        dialogue: {
          include: {
            npc: true,
          },
        },
        evidence: true,
        location: true,
        query: true,
      },
    });

    res.status(200).json(steps);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch case steps",
    });
  }
};
