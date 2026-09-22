import { ZodError } from "zod";

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body) req.body = parsed.body;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function firstZodIssue(error) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || "Please check the form and try again.";
  }
  return null;
}
