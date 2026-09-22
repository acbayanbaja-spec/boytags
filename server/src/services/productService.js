import { prisma } from "../config/db.js";
import { AppError } from "../utils/http.js";
import { notifyStaff } from "./notificationService.js";
import { realtime } from "../realtime/hub.js";

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function serializeProduct(product) {
  return {
    ...product,
    price: Number(product.price),
    soldOut: product.soldOut || product.availableQty <= 0,
  };
}

export async function listProducts({ includeInactive = false, category, availability } = {}) {
  const products = await prisma.product.findMany({
    where: {
      ...(includeInactive ? {} : { active: true }),
      ...(category ? { category: { slug: category } } : {}),
      ...(availability === "soldout" ? { OR: [{ soldOut: true }, { availableQty: 0 }] } : {}),
      ...(availability === "available" ? { soldOut: false, availableQty: { gt: 0 } } : {}),
    },
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });
  return products.map(serializeProduct);
}

export async function getProduct(idOrSlug) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
  const product = await prisma.product.findFirst({
    where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
    include: { category: true },
  });
  if (!product) throw new AppError("That product was not found.", 404, "NOT_FOUND");
  return serializeProduct(product);
}

export async function createProduct(input) {
  const product = await prisma.product.create({
    data: {
      ...input,
      slug: slugify(input.name) + "-" + Math.random().toString(36).slice(2, 6),
      soldOut: input.availableQty <= 0,
    },
    include: { category: true },
  });
  realtime.broadcast({ type: "inventory", audience: "staff" });
  return serializeProduct(product);
}

export async function updateProduct(id, input) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new AppError("That product was not found.", 404, "NOT_FOUND");

  const nextQty = input.availableQty ?? existing.availableQty;
  const soldOut = nextQty <= 0;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...input,
      soldOut,
    },
    include: { category: true },
  });

  if (!existing.soldOut && soldOut) {
    await prisma.alert.create({
      data: {
        type: "SOLD_OUT",
        message: `${product.name} is sold out.`,
        productId: product.id,
      },
    });
    await notifyStaff({
      type: "SOLD_OUT",
      title: "Product sold out",
      body: `${product.name} has reached zero inventory.`,
    });
  }

  realtime.broadcast({ type: "inventory", audience: "all" });
  return serializeProduct(product);
}

export async function deleteProduct(id) {
  const used = await prisma.orderItem.count({ where: { productId: id } });
  if (used > 0) {
    return prisma.product.update({ where: { id }, data: { active: false, soldOut: true } });
  }
  return prisma.product.delete({ where: { id } });
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
}
