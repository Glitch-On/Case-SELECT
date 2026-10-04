/*
  Warnings:

  - The primary key for the `_EvidenceToQuery` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `case_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `cases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `dialogues` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `evidences` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `investigation_tables` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `locations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `npcs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `queries` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `query_tables` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_EvidenceToQuery" DROP CONSTRAINT "_EvidenceToQuery_A_fkey";

-- DropForeignKey
ALTER TABLE "_EvidenceToQuery" DROP CONSTRAINT "_EvidenceToQuery_B_fkey";

-- DropForeignKey
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_caseId_fkey";

-- DropForeignKey
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_dialogueId_fkey";

-- DropForeignKey
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_locationId_fkey";

-- DropForeignKey
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_queryId_fkey";

-- DropForeignKey
ALTER TABLE "dialogues" DROP CONSTRAINT "dialogues_caseId_fkey";

-- DropForeignKey
ALTER TABLE "dialogues" DROP CONSTRAINT "dialogues_locationId_fkey";

-- DropForeignKey
ALTER TABLE "dialogues" DROP CONSTRAINT "dialogues_npcId_fkey";

-- DropForeignKey
ALTER TABLE "evidences" DROP CONSTRAINT "evidences_caseId_fkey";

-- DropForeignKey
ALTER TABLE "queries" DROP CONSTRAINT "queries_caseId_fkey";

-- DropForeignKey
ALTER TABLE "query_tables" DROP CONSTRAINT "query_tables_caseId_fkey";

-- DropForeignKey
ALTER TABLE "query_tables" DROP CONSTRAINT "query_tables_tableId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_caseId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_caseId_sequenceId_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_locationId_fkey";

-- AlterTable
ALTER TABLE "_EvidenceToQuery" DROP CONSTRAINT "_EvidenceToQuery_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_EvidenceToQuery_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "case_progress" DROP CONSTRAINT "case_progress_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "dialogueId" SET DATA TYPE TEXT,
ALTER COLUMN "evidenceId" SET DATA TYPE TEXT,
ALTER COLUMN "locationId" SET DATA TYPE TEXT,
ALTER COLUMN "queryId" SET DATA TYPE TEXT,
ADD CONSTRAINT "case_progress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "case_progress_id_seq";

-- AlterTable
ALTER TABLE "cases" DROP CONSTRAINT "cases_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "cases_id_seq";

-- AlterTable
ALTER TABLE "dialogues" DROP CONSTRAINT "dialogues_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "npcId" SET DATA TYPE TEXT,
ALTER COLUMN "locationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "dialogues_id_seq";

-- AlterTable
ALTER TABLE "evidences" DROP CONSTRAINT "evidences_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "evidences_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "evidences_id_seq";

-- AlterTable
ALTER TABLE "investigation_tables" DROP CONSTRAINT "investigation_tables_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "investigation_tables_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "investigation_tables_id_seq";

-- AlterTable
ALTER TABLE "locations" DROP CONSTRAINT "locations_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "locations_id_seq";

-- AlterTable
ALTER TABLE "npcs" DROP CONSTRAINT "npcs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "npcs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "npcs_id_seq";

-- AlterTable
ALTER TABLE "queries" DROP CONSTRAINT "queries_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "queries_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "queries_id_seq";

-- AlterTable
ALTER TABLE "query_tables" DROP CONSTRAINT "query_tables_pkey",
ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "tableId" SET DATA TYPE TEXT,
ADD CONSTRAINT "query_tables_pkey" PRIMARY KEY ("caseId", "tableId");

-- AlterTable
ALTER TABLE "user_progress" ALTER COLUMN "caseId" SET DATA TYPE TEXT,
ALTER COLUMN "locationId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_caseId_sequenceId_fkey" FOREIGN KEY ("caseId", "sequenceId") REFERENCES "case_progress"("caseId", "sequenceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "npcs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dialogues" ADD CONSTRAINT "dialogues_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_progress" ADD CONSTRAINT "case_progress_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_progress" ADD CONSTRAINT "case_progress_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "dialogues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_progress" ADD CONSTRAINT "case_progress_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "evidences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_progress" ADD CONSTRAINT "case_progress_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_progress" ADD CONSTRAINT "case_progress_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queries" ADD CONSTRAINT "queries_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_tables" ADD CONSTRAINT "query_tables_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_tables" ADD CONSTRAINT "query_tables_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "investigation_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvidenceToQuery" ADD CONSTRAINT "_EvidenceToQuery_A_fkey" FOREIGN KEY ("A") REFERENCES "evidences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EvidenceToQuery" ADD CONSTRAINT "_EvidenceToQuery_B_fkey" FOREIGN KEY ("B") REFERENCES "queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
