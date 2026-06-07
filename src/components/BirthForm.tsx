"use client";

import { useState } from "react";

interface BirthFormData {
  // Step 1
  childName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  gender: "male" | "female" | "other";
  placeOfBirth: string;
  birthRegionId: string;
  // Step 2
  motherName: string;
  fatherName: string;
  contactNumber: string;
  address: string;
  // Step 3
  documents: File[];
}

interface BirthFormProps {
  onSubmit: (data: BirthFormData) => Promise<void>;
  isLoading?: boolean;
  regionOptions?: Array<{ id: string; name: string; code: string }>;
}

export default function BirthForm({ onSubmit, isLoading = false, regionOptions = [] }: BirthFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<BirthFormData>({
    childName: "",
    dateOfBirth: "",
    timeOfBirth: "",
    gender: "male",
    placeOfBirth: "",
    birthRegionId: "",
    motherName: "",
    fatherName: "",
    contactNumber: "",
    address: "",
    documents: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.childName.trim()) newErrors.childName = "Child name is required";
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.placeOfBirth.trim()) newErrors.placeOfBirth = "Place of birth is required";
    } else if (currentStep === 2) {
      if (!formData.motherName.trim()) newErrors.motherName = "Mother name is required";
      if (!formData.fatherName.trim()) newErrors.fatherName = "Father name is required";
      if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    } else if (currentStep === 3) {
      if (formData.documents.length === 0) newErrors.documents = "At least one supporting document is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, documents: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      try {
        await onSubmit(formData);
      } catch (err) {
        console.error("Form submission failed", err);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step 1: Child Information */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Child Information</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Child's Full Name *
            </label>
            <input
              type="text"
              name="childName"
              value={formData.childName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.childName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.childName && <p className="text-red-500 text-sm mt-1">{errors.childName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.dateOfBirth ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Time of Birth
              </label>
              <input
                type="time"
                name="timeOfBirth"
                value={formData.timeOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Place of Birth *
              </label>
              <input
                type="text"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                placeholder="Hospital/Location"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.placeOfBirth ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.placeOfBirth && <p className="text-red-500 text-sm mt-1">{errors.placeOfBirth}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Region
            </label>
            <select
              name="birthRegionId"
              value={formData.birthRegionId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select region (optional)</option>
              {regionOptions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Step 2: Parent Information */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Parent Information</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Mother's Full Name *
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.motherName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.motherName && <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Father's Full Name *
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="John Doe Sr."
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.fatherName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.contactNumber ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, city, state, zip"
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.address ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Supporting Documents</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Hospital Document (PDF, JPG, PNG)
            </label>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="documents"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="documents" className="cursor-pointer">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-zinc-700 dark:text-zinc-300 font-medium">Click to upload or drag and drop</p>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">PDF, JPG or PNG (max 10MB each)</p>
              </label>
            </div>

            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Selected files ({formData.documents.length}):
                </p>
                <ul className="space-y-1">
                  {formData.documents.map((file, idx) => (
                    <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      ✓ {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.documents && <p className="text-red-500 text-sm mt-2">{errors.documents}</p>}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              ℹ️ Please ensure all documents are clear and legible. Blurry documents may delay approval.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            step === 1 || isLoading
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-300 dark:hover:bg-zinc-600"
          }`}
        >
          ← Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
          >
            Next →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 justify-center pt-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-8 rounded-full transition-colors ${
              s <= step ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </form>
  );
}
