export const validateProjectInput = (data) => {
  const errors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Project title is required';
  }

  if (!data.systemCapacityKw || Number(data.systemCapacityKw) <= 0) {
    errors.systemCapacityKw = 'System capacity in kW must be greater than 0';
  }

  if (!data.installationAddress || data.installationAddress.trim() === '') {
    errors.installationAddress = 'Installation address is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
