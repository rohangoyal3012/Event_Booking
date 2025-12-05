import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import EventForm from "../components/EventForm";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await eventService.createEvent(formData);
      navigate("/");
    } catch (err) {
      setError(err.error || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-100 border-2 border-red-300 text-red-900 rounded-xl font-medium">
            <span className="text-2xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-lg font-semibold text-gray-700">
                Creating event...
              </p>
            </div>
          </div>
        )}

        <EventForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default CreateEvent;
