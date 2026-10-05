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

export const getLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getPrisma();

    const location = await client.location.findUnique({
      where: {
        id: id,
      },
    });

    if (!location) {
      return res.status(404).json({
        message: "Location not found",
      });
    }

    res.status(200).json(location);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch location",
    });
  }
};

export const getLocationNpcs = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getPrisma();

    const dialogues = await client.dialogue.findMany({
      where: {
        locationId: id,
      },
      include: {
        npc: true,
      },
    });

    const npcs = dialogues.map((dialogue) => dialogue.npc);

    const uniqueNpcs = Array.from(
      new Map(npcs.map((npc) => [npc.id, npc])).values()
    );

    res.status(200).json(uniqueNpcs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch location NPCs",
    });
  }
};