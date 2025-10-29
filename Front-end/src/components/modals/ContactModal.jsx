import React from "react";
import { X } from "lucide-react";

const ContactModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  errors,
  handleChange,
  editingId,
  position 
}) => {
  if (!isOpen) return null;

  const fields = [
    { label: "Name", key: "name" },
    { label: "Description", key: "description" },
    { label: "Email", key: "email", type: "email" },
    { label: "Phone", key: "phone", type: "tel" },
    { label: "Location", key: "location" },
    { label: "Source", key: "source" },
    { label: "Priority", key: "priority" },
    { label: "Amount", key: "amount" },
  ];

  return (
<div
  className={`fixed inset-0 flex ${
    position === "right" ? "justify-end items-center mr-10" : "justify-center items-center backdrop-blur-[1px]"
  } bg-opacity-50 z-50`}
>
      {/* Modal Box */}
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh] shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Contact" : "Create New Contact"}
        </h2>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                {field.label}
              </label>

              {field.key === "priority" ? (
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.priority ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.key}
                  value={formData[field.key]}
                  onChange={handleChange}
                  className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[field.key] ? "border-red-500" : "border-gray-300"
                  }`}
                />
              )}

              {errors[field.key] && (
                <span className="text-red-500 text-sm mt-1">
                  {errors[field.key]}
                </span>
              )}
            </div>
          ))}

          {/* Submit Button */}
          <div className="col-span-1 md:col-span-2 flex justify-end mt-3">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              {editingId ? "Update Contact" : "Save Contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
