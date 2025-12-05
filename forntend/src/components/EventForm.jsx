import React, { useState, useEffect } from "react";
import { formatDate } from "../utils/helpers";

const EventForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    price: "0",
    organizer: "",
    category: "",
    image_url: "",
    status: "upcoming",
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData.date) {
      setFormData((prev) => ({
        ...prev,
        date: formatDate(initialData.date),
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Clean the form data by removing fields that shouldn't be sent
      const cleanData = { ...formData };
      delete cleanData.id;
      delete cleanData.created_at;
      delete cleanData.updated_at;
      delete cleanData.available_seats;

      onSubmit(cleanData);
    }
  };

  return (
    <form
      className="bg-white rounded-2xl shadow-lg p-8"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        {isEdit ? "✏️ Edit Event" : "➕ Create New Event"}
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Event Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.title ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Enter event title"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Enter event description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.date ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.date && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.date}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="time"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.time ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.time && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.time}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.location ? "border-red-500" : "border-gray-200"
            }`}
            placeholder="Enter event location"
          />
          {errors.location && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {errors.location}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.capacity ? "border-red-500" : "border-gray-200"
              }`}
              min="1"
              placeholder="Enter capacity"
            />
            {errors.capacity && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.capacity}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.price ? "border-red-500" : "border-gray-200"
              }`}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span>⚠️</span> {errors.price}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="organizer"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Organizer
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter organizer name"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white cursor-pointer"
            >
              <option value="">Select category</option>
              <option value="Technology">Technology</option>
              <option value="Music">Music</option>
              <option value="Business">Business</option>
              <option value="Art">Art</option>
              <option value="Sports">Sports</option>
              <option value="Education">Education</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="image_url"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Image URL
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter image URL"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white cursor-pointer"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            {isEdit ? "✅ Update Event" : "➕ Create Event"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default EventForm;
