import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma-dummy/client.ts";

const dbPath = path.join(import.meta.dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  const [engineering, sales, support] = await Promise.all([
    prisma.department.create({ data: { name: "Engineering", location: "Building A" } }),
    prisma.department.create({ data: { name: "Sales", location: "Building B" } }),
    prisma.department.create({ data: { name: "Support", location: "Building C" } }),
  ]);

  await prisma.employee.createMany({
    data: [
      { firstName: "Alice", lastName: "Nguyen", email: "alice.nguyen@example.com", jobTitle: "Engineer", salary: 95000, departmentId: engineering.id },
      { firstName: "Bruno", lastName: "Silva", email: "bruno.silva@example.com", jobTitle: "Senior Engineer", salary: 120000, departmentId: engineering.id },
      { firstName: "Carla", lastName: "Mendes", email: "carla.mendes@example.com", jobTitle: "Sales Lead", salary: 88000, departmentId: sales.id },
      { firstName: "David", lastName: "Kim", email: "david.kim@example.com", jobTitle: "Support Agent", salary: 54000, departmentId: support.id },
      { firstName: "Elena", lastName: "Rossi", email: "elena.rossi@example.com", jobTitle: "Support Lead", salary: 72000, departmentId: support.id },
    ],
  });

  await prisma.customer.createMany({
    data: [
      { firstName: "Frank", lastName: "Ocean", email: "frank.ocean@example.com", city: "Lisbon" },
      { firstName: "Grace", lastName: "Hopper", email: "grace.hopper@example.com", city: "New York" },
      { firstName: "Heidi", lastName: "Lamarr", email: "heidi.lamarr@example.com", city: "Vienna" },
      { firstName: "Ivan", lastName: "Sutherland", email: "ivan.sutherland@example.com", city: "London" },
      { firstName: "Judy", lastName: "Garland", email: "judy.garland@example.com", city: "Hollywood" },
    ],
  });

  const [keyboard, mouse, monitor, laptop, headset] = await Promise.all([
    prisma.product.create({ data: { name: "Keyboard", description: "Mechanical keyboard", price: 79.99, stock: 120 } }),
    prisma.product.create({ data: { name: "Mouse", description: "Wireless mouse", price: 29.99, stock: 200 } }),
    prisma.product.create({ data: { name: "Monitor", description: "27 inch 4K", price: 349.99, stock: 45 } }),
    prisma.product.create({ data: { name: "Laptop", description: "14 inch ultrabook", price: 1199.99, stock: 30 } }),
    prisma.product.create({ data: { name: "Headset", description: "Noise cancelling", price: 149.99, stock: 80 } }),
  ]);

  const customers = await prisma.customer.findMany();
  const employees = await prisma.employee.findMany();

  const orderData = [
    { customerId: customers[0].id, employeeId: employees[2].id, status: "shipped", items: [{ productId: keyboard.id, quantity: 1 }, { productId: mouse.id, quantity: 1 }] },
    { customerId: customers[1].id, employeeId: employees[2].id, status: "pending", items: [{ productId: laptop.id, quantity: 1 }] },
    { customerId: customers[2].id, employeeId: employees[3].id, status: "delivered", items: [{ productId: monitor.id, quantity: 2 }, { productId: headset.id, quantity: 1 }] },
    { customerId: customers[3].id, employeeId: employees[3].id, status: "shipped", items: [{ productId: mouse.id, quantity: 2 }] },
    { customerId: customers[4].id, employeeId: employees[4].id, status: "cancelled", items: [{ productId: headset.id, quantity: 1 }] },
  ];

  for (const o of orderData) {
    const total = o.items.reduce((sum, item) => {
      const product = [keyboard, mouse, monitor, laptop, headset].find((p) => p.id === item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        customerId: o.customerId,
        employeeId: o.employeeId,
        status: o.status,
        total: Math.round(total * 100) / 100,
      },
    });

    for (const item of o.items) {
      await prisma.orderItem.create({
        data: { orderId: order.id, productId: item.productId, quantity: item.quantity },
      });
    }
  }

  const counts = await Promise.all([
    prisma.department.count(),
    prisma.employee.count(),
    prisma.customer.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
  ]);
  console.log("Seeded:", { departments: counts[0], employees: counts[1], customers: counts[2], products: counts[3], orders: counts[4], orderItems: counts[5] });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
