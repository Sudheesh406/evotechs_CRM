import React, { useState } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const steps = [
  "Basic Info",
  "Registration",
  "Contact Info",
  "Address",
  "Additional Info",
  "Social Links",
  "Notes",
];

const initialFormData = {
  companyName: "",
  industryType: "",
  businessType: "Private Limited",
  gstNumber: "",
  panNumber: "",
  registrationNumber: "",
  email: "",
  phoneNumber: "",
  alternatePhone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  employeeCount: "",
  annualRevenue: "",
  foundedYear: "",
  linkedin: "",
  facebook: "",
  instagram: "",
  notes: "",
  status: "active",
};

const CompanyForm = ({companyDetails, refresh, setRefresh, setShowCompanyModal}) => {

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Auto-fill form when companyDetails is present
  React.useEffect(() => {
    if (companyDetails) {
      setFormData((prev) => ({
        ...prev,
        ...companyDetails,
        employeeCount: companyDetails.employeeCount || "",
        foundedYear: companyDetails.foundedYear || "",
      }));
    }
  }, [companyDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    // Only validate company name
    if (!formData.companyName.trim()) {
      Swal.fire("Error", "Company Name is required", "error");
      return;
    }

    try {
   const response = await axios.post("/company/create", formData);
   
      Swal.fire("Success", "Company added successfully", "success");
      setFormData(initialFormData);
      setCurrentStep(0);
      if(refresh){
        setRefresh(false)
      }else{
        setRefresh(true)
      }
      
      setShowCompanyModal(false)
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-teal-600 mb-6 text-center">
        Company Details Form
      </h2>

      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex-1 text-center text-sm font-semibold ${
              index === currentStep
                ? "text-green-600"
                : index < currentStep
                ? "text-gray-400 line-through"
                : "text-gray-400"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <form
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault(); // prevent Enter from submitting prematurely
        }}
        className="space-y-6"
      >
        {/* Step 0 - Basic Info */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Company Name *"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="industryType"
              value={formData.industryType}
              onChange={handleChange}
              placeholder="Industry Type"
              className="border rounded-lg p-2 w-full"
            />
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            >
              <option>Private Limited</option>
              <option>Public Limited</option>
              <option>Partnership</option>
              <option>Sole Proprietorship</option>
              <option>LLP</option>
              <option>Other</option>
            </select>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border rounded-lg p-2 w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}

        {/* Step 1 - Registration */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="GST Number"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="PAN Number"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Registration Number"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        )}

        {/* Step 2 - Contact Info */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
              placeholder="Alternate Phone"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Website URL"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        )}

        {/* Step 3 - Address */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        )}

        {/* Step 4 - Additional Info */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="employeeCount"
              value={formData.employeeCount}
              onChange={handleChange}
              placeholder="Employee Count"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="annualRevenue"
              value={formData.annualRevenue}
              onChange={handleChange}
              placeholder="Annual Revenue (e.g. 10-50 Cr)"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="number"
              name="foundedYear"
              value={formData.foundedYear}
              onChange={handleChange}
              placeholder="Founded Year"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        )}

        {/* Step 5 - Social Links */}
        {currentStep === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="LinkedIn URL"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              placeholder="Facebook URL"
              className="border rounded-lg p-2 w-full"
            />
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              placeholder="Instagram URL"
              className="border rounded-lg p-2 w-full"
            />
          </div>
        )}

        {/* Step 6 - Notes */}
        {currentStep === 6 && (
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional Notes"
            className="border rounded-lg p-3 w-full min-h-[120px]"
          ></textarea>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Previous
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-semibold"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit} // ✅ submit only via this click
              className="ml-auto bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-lg hover:opacity-90 transition font-semibold"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
