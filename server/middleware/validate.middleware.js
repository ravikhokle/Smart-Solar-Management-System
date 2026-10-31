import { ApiError } from '../utils/apiError.js';

export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ApiError(400, 'Validation failed', errors);
    }
    req.validated = parsed.data;
    next();
  };
}
