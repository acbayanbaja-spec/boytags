import { asyncHandler, created, ok } from "../utils/http.js";
import * as productService from "../services/productService.js";

export const list = asyncHandler(async (req, res) => {
  const includeInactive = ["STAFF", "ADMIN"].includes(req.user?.role);
  const data = await productService.listProducts({
    includeInactive,
    category: req.query.category,
    availability: req.query.availability,
  });
  ok(res, data);
});

export const get = asyncHandler(async (req, res) => {
  const data = await productService.getProduct(req.params.id);
  ok(res, data);
});

export const create = asyncHandler(async (req, res) => {
  const data = await productService.createProduct(req.body);
  created(res, data);
});

export const update = asyncHandler(async (req, res) => {
  const data = await productService.updateProduct(req.params.id, req.body);
  ok(res, data);
});

export const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  ok(res, { deleted: true });
});

export const categories = asyncHandler(async (req, res) => {
  const data = await productService.listCategories();
  ok(res, data);
});
