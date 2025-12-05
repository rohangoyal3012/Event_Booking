import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../services/api";
import EventForm from "../components/EventForm";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEventById(id);
      setEvent(response.event);
    } catch (err) {
      setError(err.error || "Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);
      await eventService.updateEvent(id, formData);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.error || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/events/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold text-gray-700">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Event
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gradient-to-br from-gray-50 to-gray-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-100 border-2 border-red-300 text-red-900 rounded-xl font-medium">
            <span className="text-2xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {submitting && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-lg font-semibold text-gray-700">
                Updating event...
              </p>
            </div>
          </div>
        )}

        {event && (
          <EventForm
            initialData={event}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
};

export default EditEvent;
