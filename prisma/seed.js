import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // =========================================================
  // 0. CLEANUP — delete in reverse dependency order
  // =========================================================
  await prisma.caseProgress.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.queryTable.deleteMany();
  await prisma.query.deleteMany();
  await prisma.phoneRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.accessCard.deleteMany();
  await prisma.kitchenLog.deleteMany();
  await prisma.restaurantOrder.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.waiter.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.dialogue.deleteMany();
  await prisma.evidence.deleteMany();
  await prisma.investigationTable.deleteMany();
  await prisma.npc.deleteMany();
  await prisma.location.deleteMany();
  await prisma.case.deleteMany();
  console.log("🗑️  Cleared existing data");

  // =========================================================
  // 1. CASE
  // =========================================================

  await prisma.case.create({
    data: {
      id: "C001",
      caseName: "The Murderer Is Not a Suspect",
    },
  });

  // =========================================================
  // 2. LOCATIONS
  // =========================================================

  await prisma.location.create({
    data: {
      id: "L001",
      locationName: "The Red Lantern Diner",
    },
  });

  await prisma.location.create({
    data: {
      id: "L002",
      locationName: "Main Dining Hall",
    },
  });

  await prisma.location.create({
    data: {
      id: "L003",
      locationName: "Main Kitchen",
    },
  });

  await prisma.location.create({
    data: {
      id: "L004",
      locationName: "Staff Office",
    },
  });

  await prisma.location.create({
    data: {
      id: "L005",
      locationName: "Parking Area",
    },
  });

  await prisma.location.create({
    data: {
      id: "L006",
      locationName: "Vikram's Office",
    },
  });

  // =========================================================
  // 3. NPCs
  // =========================================================

  await prisma.npc.create({
    data: {
      id: "N001",
      npcName: "NPC1",
    },
  });

  await prisma.npc.create({
    data: {
      id: "N002",
      npcName: "NPC2",
    },
  });

  await prisma.npc.create({
    data: {
      id: "N003",
      npcName: "NPC3",
    },
  });

  await prisma.npc.create({
    data: {
      id: "N004",
      npcName: "NPC4",
    },
  });

  await prisma.npc.create({
    data: {
      id: "N005",
      npcName: "NPC5",
    },
  });

  // =========================================================
  // 4. DIALOGUES
  // =========================================================

  await prisma.dialogue.create({
    data: {
      id: "D001",
      caseId: "C001",
      npcId: "N001",
      locationId: "L001",
      dialoguesList: [
        "Detective, I'm glad you're here. This was supposed to be a private dinner.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D002",
      caseId: "C001",
      npcId: "N001",
      locationId: "L001",
      dialoguesList: [
        "Vikram Malhotra was sitting at the center of the table when he suddenly collapsed.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D003",
      caseId: "C001",
      npcId: "N001",
      locationId: "L001",
      dialoguesList: [
        "There were six people at the dinner who had reasons to dislike him.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D004",
      caseId: "C001",
      npcId: "N002",
      locationId: "L001",
      dialoguesList: [
        "I was nowhere near the kitchen that evening.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D005",
      caseId: "C001",
      npcId: "N002",
      locationId: "L001",
      dialoguesList: [
        "I only delivered the dishes. I didn't see anything unusual.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D006",
      caseId: "C001",
      npcId: "N003",
      locationId: "L002",
      dialoguesList: [
        "Vikram seemed nervous during dinner. He kept checking his phone.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D007",
      caseId: "C001",
      npcId: "N004",
      locationId: "L002",
      dialoguesList: [
        "Everyone keeps looking at us, but none of us killed him.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D008",
      caseId: "C001",
      npcId: "N002",
      locationId: "L001",
      dialoguesList: [
        "I told you, I never entered the kitchen.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D009",
      caseId: "C001",
      npcId: "N005",
      locationId: "L006",
      dialoguesList: [
        "Arvind? He and Vikram had been business partners for years.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D010",
      caseId: "C001",
      npcId: "N005",
      locationId: "L006",
      dialoguesList: [
        "They had been arguing about money recently.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D011",
      caseId: "C001",
      npcId: "N002",
      locationId: "L001",
      dialoguesList: [
        "Fine... I entered the kitchen. But I didn't kill Vikram.",
      ],
    },
  });

  await prisma.dialogue.create({
    data: {
      id: "D012",
      caseId: "C001",
      npcId: "N002",
      locationId: "L001",
      dialoguesList: [
        "Someone offered me money to do something. I didn't know they planned to kill him.",
      ],
    },
  });

  // =========================================================
  // 5. EVIDENCES
  // =========================================================

  await prisma.evidence.create({
    data: {
      id: "EV001",
      caseId: "C001",
      evidenceName: "Mushroom Risotto Order",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV002",
      caseId: "C001",
      evidenceName: "Rohan Served the Dish",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV003",
      caseId: "C001",
      evidenceName: "Kitchen Entry",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV004",
      caseId: "C001",
      evidenceName: "Access Card Confirmation",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV005",
      caseId: "C001",
      evidenceName: "₹50,000 Payment",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV006",
      caseId: "C001",
      evidenceName: "Account B009",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV007",
      caseId: "C001",
      evidenceName: "Arvind's Account",
    },
  });

  await prisma.evidence.create({
    data: {
      id: "EV008",
      caseId: "C001",
      evidenceName: "The Mastermind",
    },
  });

  // =========================================================
  // 6. INVESTIGATION TABLE METADATA
  // =========================================================

  await prisma.investigationTable.create({
    data: {
      id: "IT001",
      tableName: "guests",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT002",
      tableName: "restaurant_orders",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT003",
      tableName: "waiters",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT004",
      tableName: "employees",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT005",
      tableName: "kitchen_logs",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT006",
      tableName: "access_cards",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT007",
      tableName: "payments",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT008",
      tableName: "bank_accounts",
    },
  });

  await prisma.investigationTable.create({
    data: {
      id: "IT009",
      tableName: "phone_records",
    },
  });

  // =========================================================
  // 7. GUESTS
  // =========================================================

  await prisma.guest.create({
    data: {
      id: "G001",
      guestName: "Vikram Malhotra",
      role: "Victim / Politician",
      isSuspect: false,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G002",
      guestName: "Neha Kapoor",
      role: "Political Rival",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G003",
      guestName: "Karan Bedi",
      role: "Political Aide",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G004",
      guestName: "Meera Sethi",
      role: "Investigative Journalist",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G005",
      guestName: "Rajiv Oberoi",
      role: "Business Contractor",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G006",
      guestName: "Sana Mirza",
      role: "Personal Assistant",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G007",
      guestName: "Dev Ahuja",
      role: "Opposition Leader",
      isSuspect: true,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G008",
      guestName: "Arvind Khanna",
      role: "Business Partner",
      isSuspect: false,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G009",
      guestName: "Priya Menon",
      role: "Diner Guest",
      isSuspect: false,
    },
  });

  await prisma.guest.create({
    data: {
      id: "G010",
      guestName: "Sameer Rao",
      role: "Party Treasurer",
      isSuspect: false,
    },
  });

  // =========================================================
  // 8. WAITERS
  // =========================================================
  // Names were not provided in the supplied dataset.

  await prisma.waiter.create({
    data: {
      id: "W001",
      waiterName: null,
    },
  });

  await prisma.waiter.create({
    data: {
      id: "W002",
      waiterName: null,
    },
  });

  await prisma.waiter.create({
    data: {
      id: "W003",
      waiterName: null,
    },
  });

  await prisma.waiter.create({
    data: {
      id: "W004",
      waiterName: null,
    },
  });

  // =========================================================
  // 9. EMPLOYEES
  // =========================================================

  await prisma.employee.create({
    data: {
      id: "E001",
      employeeName: "Aman Verma",
      jobTitle: "Waiter",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E002",
      employeeName: "Kabir Shah",
      jobTitle: "Waiter",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E003",
      employeeName: "Rohan Mehra",
      jobTitle: "Waiter",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E004",
      employeeName: "Ishita Rao",
      jobTitle: "Waiter",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E005",
      employeeName: "Vikram Das",
      jobTitle: "Head Chef",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E006",
      employeeName: "Nitin Arora",
      jobTitle: "Sous Chef",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E007",
      employeeName: "Pooja Nair",
      jobTitle: "Cashier",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E008",
      employeeName: "Rahul Sen",
      jobTitle: "Manager",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E009",
      employeeName: "Arjun Malhotra",
      jobTitle: "Security Officer",
    },
  });

  await prisma.employee.create({
    data: {
      id: "E010",
      employeeName: "Kavita Rao",
      jobTitle: "Accountant",
    },
  });

  // =========================================================
  // 10. RESTAURANT ORDERS
  // =========================================================

  await prisma.restaurantOrder.create({
    data: {
      id: "O001",
      guestId: "G001",
      dish: "Mushroom Risotto",
      orderTime: "19:42",
      waiterId: "W003",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O002",
      guestId: "G002",
      dish: "Grilled Salmon",
      orderTime: "19:40",
      waiterId: "W001",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O003",
      guestId: "G003",
      dish: "Chicken Alfredo",
      orderTime: "19:41",
      waiterId: "W002",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O004",
      guestId: "G004",
      dish: "Caesar Salad",
      orderTime: "19:39",
      waiterId: "W001",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O005",
      guestId: "G005",
      dish: "Beef Steak",
      orderTime: "19:43",
      waiterId: "W002",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O006",
      guestId: "G006",
      dish: "Tomato Pasta",
      orderTime: "19:40",
      waiterId: "W004",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O007",
      guestId: "G007",
      dish: "Lamb Chops",
      orderTime: "19:42",
      waiterId: "W001",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O008",
      guestId: "G008",
      dish: "Mushroom Risotto",
      orderTime: "19:44",
      waiterId: "W003",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O009",
      guestId: "G009",
      dish: "Margherita Pizza",
      orderTime: "19:38",
      waiterId: "W004",
    },
  });

  await prisma.restaurantOrder.create({
    data: {
      id: "O010",
      guestId: "G010",
      dish: "Grilled Vegetables",
      orderTime: "19:41",
      waiterId: "W002",
    },
  });

  // =========================================================
  // 11. KITCHEN LOGS
  // =========================================================

  await prisma.kitchenLog.create({
    data: {
      id: "K001",
      employeeId: "E001",
      action: "Entered Kitchen",
      timestamp: "19:25",
      kitchenArea: "Main Kitchen",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K002",
      employeeId: "E002",
      action: "Entered Kitchen",
      timestamp: "19:31",
      kitchenArea: "Main Kitchen",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K003",
      employeeId: "E003",
      action: "Entered Kitchen",
      timestamp: "19:44",
      kitchenArea: "Main Kitchen",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K004",
      employeeId: "E004",
      action: "Entered Kitchen",
      timestamp: "19:36",
      kitchenArea: "Main Kitchen",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K005",
      employeeId: "E003",
      action: "Collected Mushroom Risotto",
      timestamp: "19:45",
      kitchenArea: "Plating Area",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K006",
      employeeId: "E002",
      action: "Collected Chicken Alfredo",
      timestamp: "19:46",
      kitchenArea: "Plating Area",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K007",
      employeeId: "E001",
      action: "Collected Grilled Salmon",
      timestamp: "19:44",
      kitchenArea: "Plating Area",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K008",
      employeeId: "E004",
      action: "Collected Tomato Pasta",
      timestamp: "19:45",
      kitchenArea: "Plating Area",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K009",
      employeeId: "E003",
      action: "Exited Kitchen",
      timestamp: "19:47",
      kitchenArea: "Main Kitchen",
    },
  });

  await prisma.kitchenLog.create({
    data: {
      id: "K010",
      employeeId: "E002",
      action: "Exited Kitchen",
      timestamp: "19:48",
      kitchenArea: "Main Kitchen",
    },
  });

  // =========================================================
  // 12. ACCESS CARDS
  // =========================================================

  await prisma.accessCard.create({
    data: {
      id: "A001",
      employeeId: "E001",
      accessArea: "Kitchen",
      accessTime: "19:24",
      action: "Entry",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A002",
      employeeId: "E002",
      accessArea: "Kitchen",
      accessTime: "19:30",
      action: "Entry",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A003",
      employeeId: "E003",
      accessArea: "Kitchen",
      accessTime: "19:44",
      action: "Entry",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A004",
      employeeId: "E004",
      accessArea: "Kitchen",
      accessTime: "19:35",
      action: "Entry",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A005",
      employeeId: "E003",
      accessArea: "Kitchen",
      accessTime: "19:47",
      action: "Exit",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A006",
      employeeId: "E002",
      accessArea: "Kitchen",
      accessTime: "19:48",
      action: "Exit",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A007",
      employeeId: "E001",
      accessArea: "Kitchen",
      accessTime: "19:51",
      action: "Exit",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A008",
      employeeId: "E004",
      accessArea: "Kitchen",
      accessTime: "19:52",
      action: "Exit",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A009",
      employeeId: "E003",
      accessArea: "Staff Office",
      accessTime: "20:03",
      action: "Entry",
    },
  });

  await prisma.accessCard.create({
    data: {
      id: "A010",
      employeeId: "E003",
      accessArea: "Staff Office",
      accessTime: "20:11",
      action: "Exit",
    },
  });

  // =========================================================
  // 13. BANK ACCOUNTS
  // =========================================================

  await prisma.bankAccount.create({
    data: {
      id: "B001",
      accountNumber: "48120591",
      ownerType: "Employee",
      ownerId: "E001",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B002",
      accountNumber: "57231864",
      ownerType: "Employee",
      ownerId: "E002",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B003",
      accountNumber: "69342178",
      ownerType: "Employee",
      ownerId: "E003",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B004",
      accountNumber: "81452963",
      ownerType: "Employee",
      ownerId: "E004",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B005",
      accountNumber: "92561743",
      ownerType: "Employee",
      ownerId: "E005",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B006",
      accountNumber: "34681295",
      ownerType: "Employee",
      ownerId: "E006",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B007",
      accountNumber: "75193426",
      ownerType: "Employee",
      ownerId: "E007",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B008",
      accountNumber: "62845197",
      ownerType: "Employee",
      ownerId: "E008",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B009",
      accountNumber: "51736284",
      ownerType: "Guest",
      ownerId: "G008",
    },
  });

  await prisma.bankAccount.create({
    data: {
      id: "B010",
      accountNumber: "83219475",
      ownerType: "Guest",
      ownerId: "G005",
    },
  });

  // =========================================================
  // 14. PAYMENTS
  // =========================================================

  await prisma.payment.create({
    data: {
      id: "P001",
      senderAccount: "B010",
      receiverAccount: "B002",
      amount: 12000,
      paymentTime: "18:12",
      description: "Consulting",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P002",
      senderAccount: "B005",
      receiverAccount: "B007",
      amount: 8500,
      paymentTime: "17:43",
      description: "Staff Expense",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P003",
      senderAccount: "B009",
      receiverAccount: "B003",
      amount: 50000,
      paymentTime: "18:56",
      description: null,
    },
  });

  await prisma.payment.create({
    data: {
      id: "P004",
      senderAccount: "B001",
      receiverAccount: "B008",
      amount: 4500,
      paymentTime: "16:22",
      description: "Personal",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P005",
      senderAccount: "B006",
      receiverAccount: "B005",
      amount: 9200,
      paymentTime: "15:31",
      description: "Supplies",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P006",
      senderAccount: "B004",
      receiverAccount: "B007",
      amount: 3800,
      paymentTime: "17:12",
      description: "Reimbursement",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P007",
      senderAccount: "B008",
      receiverAccount: "B006",
      amount: 6700,
      paymentTime: "14:50",
      description: "Maintenance",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P008",
      senderAccount: "B002",
      receiverAccount: "B001",
      amount: 2500,
      paymentTime: "13:45",
      description: "Loan",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P009",
      senderAccount: "B005",
      receiverAccount: "B010",
      amount: 11000,
      paymentTime: "12:32",
      description: "Contractor",
    },
  });

  await prisma.payment.create({
    data: {
      id: "P010",
      senderAccount: "B007",
      receiverAccount: "B004",
      amount: 1800,
      paymentTime: "11:21",
      description: "Reimbursement",
    },
  });

  // =========================================================
  // 15. PHONE RECORDS
  // =========================================================

  await prisma.phoneRecord.create({
    data: {
      id: "PR001",
      phoneNumber: "9876500011",
      ownerId: "E001",
      associatedAccount: "B001",
      callTime: "18:10",
      duration: 120,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR002",
      phoneNumber: "9876500022",
      ownerId: "E002",
      associatedAccount: "B002",
      callTime: "18:22",
      duration: 90,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR003",
      phoneNumber: "9876500033",
      ownerId: "E003",
      associatedAccount: "B003",
      callTime: "18:54",
      duration: 45,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR004",
      phoneNumber: "9876500044",
      ownerId: "E004",
      associatedAccount: "B004",
      callTime: "18:30",
      duration: 180,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR005",
      phoneNumber: "9876500055",
      ownerId: "E005",
      associatedAccount: "B005",
      callTime: "18:41",
      duration: 60,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR006",
      phoneNumber: "9876500066",
      ownerId: "E006",
      associatedAccount: "B006",
      callTime: "18:20",
      duration: 120,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR007",
      phoneNumber: "9876500077",
      ownerId: "E007",
      associatedAccount: "B007",
      callTime: "18:15",
      duration: 30,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR008",
      phoneNumber: "9876500088",
      ownerId: "E008",
      associatedAccount: "B008",
      callTime: "18:05",
      duration: 240,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR009",
      phoneNumber: "9876500099",
      ownerId: "G008",
      associatedAccount: "B009",
      callTime: "18:51",
      duration: 300,
    },
  });

  await prisma.phoneRecord.create({
    data: {
      id: "PR010",
      phoneNumber: "9876500010",
      ownerId: "G005",
      associatedAccount: "B010",
      callTime: "17:48",
      duration: 90,
    },
  });

  // =========================================================
  // 16. QUERIES
  // =========================================================

  await prisma.query.create({
    data: {
      id: "Q001",
      caseId: "C001",
      queryOutput: "Mushroom Risotto",
      evidences: {
        connect: [{ id: "EV001" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q002",
      caseId: "C001",
      queryOutput: "Rohan Mehra",
      evidences: {
        connect: [{ id: "EV002" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q003",
      caseId: "C001",
      queryOutput: "Yes",
      evidences: {
        connect: [{ id: "EV003" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q004",
      caseId: "C001",
      queryOutput: "Yes",
      evidences: {
        connect: [{ id: "EV004" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q005",
      caseId: "C001",
      queryOutput: "₹50,000",
      evidences: {
        connect: [{ id: "EV005" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q006",
      caseId: "C001",
      queryOutput: "B009",
      evidences: {
        connect: [{ id: "EV006" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q007",
      caseId: "C001",
      queryOutput: "Arvind Khanna",
      evidences: {
        connect: [{ id: "EV007" }],
      },
    },
  });

  await prisma.query.create({
    data: {
      id: "Q008",
      caseId: "C001",
      queryOutput: "Arvind Khanna",
      evidences: {
        connect: [{ id: "EV008" }],
      },
    },
  });

  // =========================================================
  // 17. QUERY TABLES
  // =========================================================

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT001",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT002",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT003",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT004",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT005",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT006",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT007",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT008",
    },
  });

  await prisma.queryTable.create({
    data: {
      caseId: "C001",
      tableId: "IT009",
    },
  });

  // =========================================================
  // 18. CASE PROGRESS
  // =========================================================

  await prisma.caseProgress.create({
    data: {
      id: "S001",
      caseId: "C001",
      sequenceId: 1,
      dialogueId: "D001",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S002",
      caseId: "C001",
      sequenceId: 2,
      dialogueId: "D002",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S003",
      caseId: "C001",
      sequenceId: 3,
      dialogueId: "D003",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S004",
      caseId: "C001",
      sequenceId: 4,
      dialogueId: null,
      evidenceId: null,
      locationId: "L001",
      queryId: "Q001",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S005",
      caseId: "C001",
      sequenceId: 5,
      dialogueId: null,
      evidenceId: null,
      locationId: "L001",
      queryId: "Q002",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S006",
      caseId: "C001",
      sequenceId: 6,
      dialogueId: "D004",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S007",
      caseId: "C001",
      sequenceId: 7,
      dialogueId: null,
      evidenceId: null,
      locationId: "L003",
      queryId: "Q003",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S008",
      caseId: "C001",
      sequenceId: 8,
      dialogueId: null,
      evidenceId: null,
      locationId: "L003",
      queryId: "Q004",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S009",
      caseId: "C001",
      sequenceId: 9,
      dialogueId: "D011",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S010",
      caseId: "C001",
      sequenceId: 10,
      dialogueId: null,
      evidenceId: null,
      locationId: "L004",
      queryId: "Q005",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S011",
      caseId: "C001",
      sequenceId: 11,
      dialogueId: null,
      evidenceId: null,
      locationId: "L004",
      queryId: "Q006",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S012",
      caseId: "C001",
      sequenceId: 12,
      dialogueId: null,
      evidenceId: null,
      locationId: "L006",
      queryId: "Q007",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S013",
      caseId: "C001",
      sequenceId: 13,
      dialogueId: "D009",
      evidenceId: null,
      locationId: "L006",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S014",
      caseId: "C001",
      sequenceId: 14,
      dialogueId: "D010",
      evidenceId: null,
      locationId: "L006",
      queryId: null,
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S015",
      caseId: "C001",
      sequenceId: 15,
      dialogueId: null,
      evidenceId: null,
      locationId: "L006",
      queryId: "Q008",
    },
  });

  await prisma.caseProgress.create({
    data: {
      id: "S016",
      caseId: "C001",
      sequenceId: 16,
      dialogueId: "D012",
      evidenceId: null,
      locationId: "L001",
      queryId: null,
    },
  });

  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });