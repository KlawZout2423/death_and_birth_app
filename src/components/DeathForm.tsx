"use client";

import { useState } from "react";

interface DeathFormData {
  // Step 1
  deceasedName: string;
  dateOfDeath: string;
  timeOfDeath: string;
  gender: string;
  ageAtDeath: number;
  placeOfDeath: string;
  deathRegionId: string;
  causeOfDeath: string;
  // Step 2
  informantName: string;
  informantRelation: string;
  contactNumber: string;
  // Step 3
  documents: File[];
}

interface DeathFormProps {
  onSubmit: (data: DeathFormData) => Promise<void>;
  isLoading?: boolean;
  regionOptions?: Array<{ id: string; name: string; code: string }>;
}

export default function DeathForm({ onSubmit, isLoading = false, regionOptions = [] }: DeathFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DeathFormData>({
    deceasedName: "",
    dateOfDeath: "",
    timeOfDeath: "",
    gender: "",
    ageAtDeath: 0,
    placeOfDeath: "",
    deathRegionId: "",
    causeOfDeath: "",
    informantName: "",
    informantRelation: "",
    contactNumber: "",
    documents: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.deceasedName.trim()) newErrors.deceasedName = "Deceased name is required";
      if (!formData.dateOfDeath) newErrors.dateOfDeath = "Date of death is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (formData.ageAtDeath <= 0) newErrors.ageAtDeath = "Age must be greater than 0";
      if (!formData.placeOfDeath.trim()) newErrors.placeOfDeath = "Place of death is required";
      if (!formData.causeOfDeath.trim()) newErrors.causeOfDeath = "Cause of death is required";
    } else if (currentStep === 2) {
      if (!formData.informantName.trim()) newErrors.informantName = "Informant name is required";
      if (!formData.informantRelation.trim()) newErrors.informantRelation = "Relation is required";
      if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
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
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ageAtDeath" ? parseInt(value) || 0 : value,
    }));
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
      {/* Step 1: Deceased Information */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Deceased Information</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="deceasedName"
              value={formData.deceasedName}
              onChange={handleChange}
              placeholder="John Doe"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.deceasedName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.deceasedName && <p className="text-red-500 text-sm mt-1">{errors.deceasedName}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Date of Death *
              </label>
              <input
                type="date"
                name="dateOfDeath"
                value={formData.dateOfDeath}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.dateOfDeath ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.dateOfDeath && <p className="text-red-500 text-sm mt-1">{errors.dateOfDeath}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Time of Death
              </label>
              <input
                type="time"
                name="timeOfDeath"
                value={formData.timeOfDeath}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.gender ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Age at Death *
              </label>
              <input
                type="number"
                name="ageAtDeath"
                value={formData.ageAtDeath || ""}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.ageAtDeath ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
                } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.ageAtDeath && <p className="text-red-500 text-sm mt-1">{errors.ageAtDeath}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Place of Death *
            </label>
            <input
              type="text"
              name="placeOfDeath"
              value={formData.placeOfDeath}
              onChange={handleChange}
              placeholder="Hospital/Location"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.placeOfDeath ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.placeOfDeath && <p className="text-red-500 text-sm mt-1">{errors.placeOfDeath}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Region
            </label>
            <select
              name="deathRegionId"
              value={formData.deathRegionId}
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

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Cause of Death *
            </label>
            <textarea
              name="causeOfDeath"
              value={formData.causeOfDeath}
              onChange={handleChange}
              placeholder="Brief description of cause"
              rows={2}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.causeOfDeath ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.causeOfDeath && <p className="text-red-500 text-sm mt-1">{errors.causeOfDeath}</p>}
          </div>
        </div>
      )}

      {/* Step 2: Informant Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Informant Details</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Informant's Full Name *
            </label>
            <input
              type="text"
              name="informantName"
              value={formData.informantName}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.informantName ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.informantName && <p className="text-red-500 text-sm mt-1">{errors.informantName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Relation to Deceased *
            </label>
            <select
              name="informantRelation"
              value={formData.informantRelation}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.informantRelation ? "border-red-500" : "border-zinc-300 dark:border-zinc-600"
              } bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Relation</option>
              <option value="spouse">Spouse</option>
              <option value="child">Child</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="other">Other</option>
            </select>
            {errors.informantRelation && <p className="text-red-500 text-sm mt-1">{errors.informantRelation}</p>}
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
        </div>
      )}

      {/* Step 3: Medical Certificate */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Medical Certificate & Documents</h2>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Medical Certificate (PDF, JPG, PNG)
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
              ℹ️ Medical certificate is required for death registration. Please ensure all documents are clear.
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
