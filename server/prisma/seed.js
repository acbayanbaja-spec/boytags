import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const images = {
  whole:
    "https://images.unsplash.com/photo-1598103442097-8b70429476eb?auto=format&fit=crop&w=1200&q=80",
  half: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1200&q=80",
  inasal:
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=80",
  fried:
    "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80",
  liempo:
    "https://images.unsplash.com/photo-1544025162-d76690232f46?auto=format&fit=crop&w=1200&q=80",
  rice: "https://images.unsplash.com/photo-1516684738272-bd2d19e0a4aa?auto=format&fit=crop&w=1200&q=80",
  drinks:
    "https://images.unsplash.com/photo-1544145945-f9049b5f6440?auto=format&fit=crop&w=1200&q=80",
  sauce:
    "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=1200&q=80",
};

async function main() {
  await prisma.orderHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.deliveryDetail.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const password = async (plain) => bcrypt.hash(plain, 12);

  const admin = await prisma.user.create({
    data: {
      name: "Elena Boytag",
      email: "admin@boytags.local",
      phone: "09171234567",
      role: "ADMIN",
      passwordHash: await password("Admin123!"),
    },
  });
  const staff = await prisma.user.create({
    data: {
      name: "Marco Reyes",
      email: "staff@boytags.local",
      phone: "09181234567",
      role: "STAFF",
      passwordHash: await password("Staff123!"),
    },
  });
  const customer = await prisma.user.create({
    data: {
      name: "Ana Villanueva",
      email: "customer@boytags.local",
      phone: "09192223333",
      role: "CUSTOMER",
      passwordHash: await password("Customer123!"),
    },
  });

  const [lechon, grilled, extras, drinks] = await Promise.all([
    prisma.category.create({
      data: { name: "Lechon Manok", slug: "lechon-manok", description: "Slow-roasted whole chicken, Boytag's signature.", sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: "Grilled & Fried", slug: "grilled-fried", description: "Inasal, fried chicken, and liempo.", sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: "Rice & Sides", slug: "rice-sides", description: "Complete the table.", sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: "Drinks", slug: "drinks", description: "Ice-cold companions.", sortOrder: 4 },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        categoryId: lechon.id,
        name: "Whole Lechon Manok",
        slug: "whole-lechon-manok",
        description: "Crisp golden skin, juicy meat, and our house garlic-lemongrass marinade. Serves 4–5.",
        price: 380,
        imageUrl: images.whole,
        availableQty: 24,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: lechon.id,
        name: "Half Lechon Manok",
        slug: "half-lechon-manok",
        description: "The same roast chicken, sized for a pair or a generous solo dinner.",
        price: 210,
        imageUrl: images.half,
        availableQty: 18,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: grilled.id,
        name: "Chicken Inasal (2 pcs)",
        slug: "chicken-inasal",
        description: "Char-grilled, annatto-brushed, with toyomansi on the side.",
        price: 165,
        imageUrl: images.inasal,
        availableQty: 30,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: grilled.id,
        name: "Crispy Fried Chicken",
        slug: "crispy-fried-chicken",
        description: "Buttermilk-brined, double-fried, served with gravy.",
        price: 149,
        imageUrl: images.fried,
        availableQty: 20,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: grilled.id,
        name: "Grilled Liempo",
        slug: "grilled-liempo",
        description: "Pork belly, charcoal-kissed, with pickled papaya.",
        price: 185,
        imageUrl: images.liempo,
        availableQty: 12,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: extras.id,
        name: "Java Rice",
        slug: "java-rice",
        description: "Annato-scented rice, the proper partner for lechon manok.",
        price: 35,
        imageUrl: images.rice,
        availableQty: 80,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: extras.id,
        name: "Garlic Rice",
        slug: "garlic-rice",
        description: "Toasted garlic, fluffy grains, extra crunch on top.",
        price: 35,
        imageUrl: images.rice,
        availableQty: 80,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: extras.id,
        name: "House Sawsawan Set",
        slug: "sawsawan-set",
        description: "Toyomansi, chili oil, and liver sauce in takeout cups.",
        price: 25,
        imageUrl: images.sauce,
        availableQty: 50,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: drinks.id,
        name: "Iced Calamansi",
        slug: "iced-calamansi",
        description: "Freshly squeezed, lightly sweetened, served over ice.",
        price: 45,
        imageUrl: images.drinks,
        availableQty: 40,
      },
    }),
    prisma.product.create({
      data: {
        categoryId: drinks.id,
        name: "Sago't Gulaman",
        slug: "sago-gulaman",
        description: "Brown sugar syrup, chewy sago, cool gulaman cubes.",
        price: 45,
        imageUrl: images.drinks,
        availableQty: 0,
        soldOut: true,
      },
    }),
  ]);

  await prisma.setting.create({
    data: {
      storeName: "Boytag's Lechon Manok and Chicken House",
      storeAddress: "Maharlika Highway, Brgy. Dila, Santa Rosa, Laguna",
      storePhone: "(049) 530-0192",
      latitude: 14.3142,
      longitude: 121.1114,
      unclaimedThresholdMinutes: 20,
      deliveryFee: 40,
      lowStockThreshold: 5,
      openingTime: "09:00",
      closingTime: "21:00",
    },
  });

  const soon = new Date(Date.now() + 25 * 60 * 1000);
  const later = new Date(Date.now() + 90 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      orderNumber: "BT-1001",
      customerId: customer.id,
      type: "DELIVERY",
      status: "PREPARING",
      priority: "HIGH",
      scheduledAt: soon,
      subtotal: 415,
      deliveryFee: 40,
      total: 455,
      customerNotes: "Please call when outside. Dogs in the yard.",
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            unitPrice: 380,
            quantity: 1,
            lineTotal: 380,
          },
          {
            productId: products[5].id,
            productName: products[5].name,
            unitPrice: 35,
            quantity: 1,
            lineTotal: 35,
          },
        ],
      },
      delivery: {
        create: {
          address: "Blk 4 Lot 12, Villa Rosa Subdivision, Santa Rosa, Laguna",
          landmark: "Blue gate beside the sari-sari store, near the barangay hall",
          notes: "Leave with security if the gate is locked.",
          contactPhone: "09192223333",
          latitude: 14.3211,
          longitude: 121.1182,
        },
      },
    },
  });

  await prisma.orderHistory.createMany({
    data: [
      {
        orderId: order.id,
        actorId: customer.id,
        actorRole: "CUSTOMER",
        actorName: customer.name,
        action: "ORDER_CREATED",
        newValue: { orderNumber: "BT-1001" },
      },
      {
        orderId: order.id,
        actorId: staff.id,
        actorRole: "STAFF",
        actorName: staff.name,
        action: "STATUS_CHANGED",
        previousValue: { status: "PENDING" },
        newValue: { status: "CONFIRMED" },
      },
      {
        orderId: order.id,
        actorId: staff.id,
        actorRole: "STAFF",
        actorName: staff.name,
        action: "STATUS_CHANGED",
        previousValue: { status: "CONFIRMED" },
        newValue: { status: "PREPARING" },
      },
    ],
  });

  await prisma.order.create({
    data: {
      orderNumber: "BT-1002",
      customerId: customer.id,
      type: "PICKUP",
      status: "PENDING",
      scheduledAt: later,
      subtotal: 210,
      deliveryFee: 0,
      total: 210,
      items: {
        create: [
          {
            productId: products[1].id,
            productName: products[1].name,
            unitPrice: 210,
            quantity: 1,
            lineTotal: 210,
          },
        ],
      },
      history: {
        create: {
          actorId: customer.id,
          actorRole: "CUSTOMER",
          actorName: customer.name,
          action: "ORDER_CREATED",
          newValue: { orderNumber: "BT-1002" },
        },
      },
    },
  });

  console.log("Seeded Boytag's:");
  console.log("  admin@boytags.local / Admin123!");
  console.log("  staff@boytags.local / Staff123!");
  console.log("  customer@boytags.local / Customer123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
