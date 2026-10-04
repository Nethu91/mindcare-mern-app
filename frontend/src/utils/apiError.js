export const apiError = (e) =>
  e.response?.data?.message || "Unable to connect. Please try again.";
