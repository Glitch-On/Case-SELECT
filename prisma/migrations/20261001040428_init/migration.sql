-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "locationId" INTEGER,
    "sequenceId" INTEGER,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" SERIAL NOT NULL,
    "caseName" TEXT NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "npcs" (
    "id" SERIAL NOT NULL,
    "npcName" TEXT NOT NULL,

    CONSTRAINT "npcs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" SERIAL NOT NULL,
    "locationName" TEXT NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dialogues" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "npcId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "dialoguesList" TEXT[],

    CONSTRAINT "dialogues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_progress" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "sequenceId" INTEGER NOT NULL,
    "dialogueId" INTEGER,
    "evidenceId" INTEGER,
    "locationId" INTEGER,
    "queryId" INTEGER,

    CONSTRAINT "case_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "evidenceName" TEXT NOT NULL,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queries" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "queryOutput" TEXT NOT NULL,

    CONSTRAINT "queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_tables" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,

    CONSTRAINT "investigation_tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_tables" (
    "caseId" INTEGER NOT NULL,
    "tableId" INTEGER NOT NULL,

    CONSTRAINT "query_tables_pkey" PRIMARY KEY ("caseId","tableId")
);

-- CreateTable
CREATE TABLE "_EvidenceToQuery" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EvidenceToQuery_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_caseId_key" ON "user_progress"("userId", "caseId");

-- CreateIndex
CREATE INDEX "dialogues_caseId_idx" ON "dialogues"("caseId");

-- CreateIndex
CREATE INDEX "dialogues_npcId_idx" ON "dialogues"("npcId");

-- CreateIndex
CREATE UNIQUE INDEX "case_progress_caseId_sequenceId_key" ON "case_progress"("caseId", "sequenceId");

-- CreateIndex
CREATE INDEX "evidences_caseId_idx" ON "evidences"("caseId");

-- CreateIndex
CREATE INDEX "queries_caseId_idx" ON "queries"("caseId");

-- CreateIndex
CREATE INDEX "_EvidenceToQuery_B_index" ON "_EvidenceToQuery"("B");

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
