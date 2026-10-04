-- CreateTable
CREATE TABLE "guests" (
    "guest_id" TEXT NOT NULL,
    "guest_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "is_suspect" BOOLEAN NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("guest_id")
);

-- CreateTable
CREATE TABLE "waiters" (
    "id" TEXT NOT NULL,
    "waiter_name" TEXT,

    CONSTRAINT "waiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_orders" (
    "order_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "dish" TEXT NOT NULL,
    "order_time" TEXT NOT NULL,
    "waiter_id" TEXT NOT NULL,

    CONSTRAINT "restaurant_orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "employees" (
    "employee_id" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("employee_id")
);

-- CreateTable
CREATE TABLE "kitchen_logs" (
    "log_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "kitchen_area" TEXT NOT NULL,

    CONSTRAINT "kitchen_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "access_cards" (
    "access_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "access_area" TEXT NOT NULL,
    "access_time" TEXT NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "access_cards_pkey" PRIMARY KEY ("access_id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "account_id" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "owner_type" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" TEXT NOT NULL,
    "sender_account" TEXT NOT NULL,
    "receiver_account" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_time" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "phone_records" (
    "phone_record_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "associated_account" TEXT NOT NULL,
    "call_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "phone_records_pkey" PRIMARY KEY ("phone_record_id")
);

-- CreateIndex
CREATE INDEX "restaurant_orders_guest_id_idx" ON "restaurant_orders"("guest_id");

-- CreateIndex
CREATE INDEX "restaurant_orders_waiter_id_idx" ON "restaurant_orders"("waiter_id");

-- CreateIndex
CREATE INDEX "kitchen_logs_employee_id_idx" ON "kitchen_logs"("employee_id");

-- CreateIndex
CREATE INDEX "access_cards_employee_id_idx" ON "access_cards"("employee_id");

-- CreateIndex
CREATE INDEX "payments_sender_account_idx" ON "payments"("sender_account");

-- CreateIndex
CREATE INDEX "payments_receiver_account_idx" ON "payments"("receiver_account");

-- CreateIndex
CREATE INDEX "phone_records_owner_id_idx" ON "phone_records"("owner_id");

-- CreateIndex
CREATE INDEX "phone_records_associated_account_idx" ON "phone_records"("associated_account");

-- AddForeignKey
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("guest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_waiter_id_fkey" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kitchen_logs" ADD CONSTRAINT "kitchen_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_cards" ADD CONSTRAINT "access_cards_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("employee_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sender_account_fkey" FOREIGN KEY ("sender_account") REFERENCES "bank_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_receiver_account_fkey" FOREIGN KEY ("receiver_account") REFERENCES "bank_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_records" ADD CONSTRAINT "phone_records_associated_account_fkey" FOREIGN KEY ("associated_account") REFERENCES "bank_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
