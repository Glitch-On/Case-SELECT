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

export const getDialogue = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await getPrisma();

    const dialogue = await client.dialogue.findUnique({
      where: {
        id: id,
      },
      include: {
        npc: true,
        location: true,
      },
    });

    if (!dialogue) {
      return res.status(404).json({
        message: "Dialogue not found",
      });
    }

    res.status(200).json(dialogue);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch dialogue",
    });
  }
};