import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { readFile } from "fs/promises";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const raw = await readFile(
    new URL("./data.json", import.meta.url),
    "utf-8"
  );

  const data = JSON.parse(raw);

  // Seed in order to respect foreign key constraints

  // 1. Locations
  for (const loc of data.locations) {
    await prisma.location.upsert({
      where: { id: loc.id },
      update: loc,
      create: loc,
    });
  }
  console.log(`✔ Seeded ${data.locations.length} locations`);

  // 2. NPCs
  for (const npc of data.npcs) {
    await prisma.npc.upsert({
      where: { id: npc.id },
      update: npc,
      create: npc,
    });
  }
  console.log(`✔ Seeded ${data.npcs.length} NPCs`);

  // 3. Cases
  for (const c of data.cases) {
    await prisma.case.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✔ Seeded ${data.cases.length} cases`);

  // 4. Dialogues
  for (const dlg of data.dialogues) {
    await prisma.dialogue.upsert({
      where: { id: dlg.id },
      update: dlg,
      create: dlg,
    });
  }
  console.log(`✔ Seeded ${data.dialogues.length} dialogues`);

  // 5. Evidences
  for (const ev of data.evidences) {
    await prisma.evidence.upsert({
      where: { id: ev.id },
      update: ev,
      create: ev,
    });
  }
  console.log(`✔ Seeded ${data.evidences.length} evidences`);

  // 6. Investigation table metadata
  for (const tbl of data.investigationTables) {
    await prisma.investigationTable.upsert({
      where: { id: tbl.id },
      update: tbl,
      create: tbl,
    });
  }
  console.log(
    `✔ Seeded ${data.investigationTables.length} investigation tables`
  );

  // ───────────── Actual investigation data ─────────────

  // 7. Guests
  for (const guest of data.guests) {
    await prisma.guest.upsert({
      where: { id: guest.id },
      update: guest,
      create: guest,
    });
  }
  console.log(`✔ Seeded ${data.guests.length} guests`);

  // 8. Waiters
  for (const waiter of data.waiters) {
    await prisma.waiter.upsert({
      where: { id: waiter.id },
      update: waiter,
      create: waiter,
    });
  }
  console.log(`✔ Seeded ${data.waiters.length} waiters`);

  // 9. Restaurant orders
  for (const order of data.restaurantOrders) {
    await prisma.restaurantOrder.upsert({
      where: { id: order.id },
      update: order,
      create: order,
    });
  }
  console.log(`✔ Seeded ${data.restaurantOrders.length} restaurant orders`);

  // 10. Employees
  for (const employee of data.employees) {
    await prisma.employee.upsert({
      where: { id: employee.id },
      update: employee,
      create: employee,
    });
  }
  console.log(`✔ Seeded ${data.employees.length} employees`);

  // 11. Kitchen logs
  for (const log of data.kitchenLogs) {
    await prisma.kitchenLog.upsert({
      where: { id: log.id },
      update: log,
      create: log,
    });
  }
  console.log(`✔ Seeded ${data.kitchenLogs.length} kitchen logs`);

  // 12. Access cards
  for (const card of data.accessCards) {
    await prisma.accessCard.upsert({
      where: { id: card.id },
      update: card,
      create: card,
    });
  }
  console.log(`✔ Seeded ${data.accessCards.length} access cards`);

  // 13. Bank accounts
  for (const account of data.bankAccounts) {
    await prisma.bankAccount.upsert({
      where: { id: account.id },
      update: account,
      create: account,
    });
  }
  console.log(`✔ Seeded ${data.bankAccounts.length} bank accounts`);

  // 14. Payments
  for (const payment of data.payments) {
    await prisma.payment.upsert({
      where: { id: payment.id },
      update: payment,
      create: payment,
    });
  }
  console.log(`✔ Seeded ${data.payments.length} payments`);

  // 15. Phone records
  for (const record of data.phoneRecords) {
    await prisma.phoneRecord.upsert({
      where: { id: record.id },
      update: record,
      create: record,
    });
  }
  console.log(`✔ Seeded ${data.phoneRecords.length} phone records`);

  // 16. Query tables (junction table)
  for (const qt of data.queryTables) {
    await prisma.queryTable.upsert({
      where: {
        caseId_tableId: {
          caseId: qt.caseId,
          tableId: qt.tableId,
        },
      },
      update: qt,
      create: qt,
    });
  }
  console.log(`✔ Seeded ${data.queryTables.length} query tables`);

  // 17. Queries
  for (const qry of data.queries) {
    await prisma.query.upsert({
      where: { id: qry.id },
      update: {
        queryOutput: qry.queryOutput,
        caseId: qry.caseId,
      },
      create: {
        id: qry.id,
        caseId: qry.caseId,
        queryOutput: qry.queryOutput,
      },
    });
  }
  console.log(`✔ Seeded ${data.queries.length} queries`);

  // 18. Case progress steps
  for (const cp of data.caseProgress) {
    await prisma.caseProgress.upsert({
      where: { id: cp.id },
      update: cp,
      create: cp,
    });
  }
  console.log(`✔ Seeded ${data.caseProgress.length} case progress steps`);

  console.log("\n🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });