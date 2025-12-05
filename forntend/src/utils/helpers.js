// Format date to YYYY-MM-DD
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

// Format date for display
export const formatDisplayDate = (date) => {
  if (!date) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("en-US", options);
};

// Format time for display
export const formatDisplayTime = (time) => {
  if (!time) return "";
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format price
export const formatPrice = (price) => {
  if (price === 0 || price === "0.00") return "Free";
  return `₹${parseFloat(price).toFixed(2)}`;
};

// Validate event form data
export const validateEventForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!formData.date) {
    errors.date = "Date is required";
  }

  if (!formData.time) {
    errors.time = "Time is required";
  }

  if (!formData.location?.trim()) {
    errors.location = "Location is required";
  }

  if (!formData.capacity || formData.capacity < 1) {
    errors.capacity = "Capacity must be at least 1";
  }

  return errors;
};

// Get event status badge color
export const getStatusColor = (status) => {
  const colors = {
    upcoming: "#4CAF50",
    ongoing: "#2196F3",
    completed: "#9E9E9E",
    cancelled: "#f44336",
  };
  return colors[status] || "#757575";
};

// Get category color
export const getCategoryColor = (category) => {
  const colors = {
    Technology: "#2196F3",
    Music: "#E91E63",
    Business: "#FF9800",
    Art: "#9C27B0",
    Sports: "#4CAF50",
    Education: "#00BCD4",
    Food: "#FF5722",
    default: "#607D8B",
  };
  return colors[category] || colors.default;
};
