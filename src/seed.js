const prisma = require("./lib/prisma");

async function main() {
  await prisma.role.upsert({
    where: { roleid: 1 },
    update: {},
    create: { roleid: 1, rolename: "normal" },
  });

  await prisma.role.upsert({
    where: { roleid: 2 },
    update: {},
    create: { roleid: 2, rolename: "admin" },
  });

  await prisma.membership.upsert({
    where: { mid: 1 },
    update: {},
    create: { mid: 1, mname: "Bronze", score: 10 },
  });

  await prisma.product.upsert({
    where: { pid: 1 },
    update: { price: 100.0, quantity: 50 },
    create: { pid: 1, pname: "X", price: 100.0, quantity: 50 },
  });

  await prisma.product.upsert({
    where: { pid: 2 },
    update: { price: 200.0, quantity: 50 },
    create: { pid: 2, pname: "Y", price: 200.0, quantity: 50 },
  });

  console.log("Seeding dữ liệu thành công!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
