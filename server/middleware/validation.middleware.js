export const validateRequest = (schemaFn) => {
  return (req, res, next) => {
    const { isValid, errors } = schemaFn(req.body);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }
    next();
  };
};
