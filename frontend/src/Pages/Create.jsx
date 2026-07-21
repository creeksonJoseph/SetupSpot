import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch";
import {
  Upload,
  X,
  Save,
  ArrowLeft,
  Trash2,
  Edit3,
  Image,
  Loader2,
} from "lucide-react";

// =================================================================
// 1. ANNOTATION FORM COMPONENT (MOVED OUTSIDE)
//    - This prevents the component from being redefined on every state change.
// =================================================================
const AnnotationForm = React.memo(({
  annotation,
  onRemove,
  onChange,
  annotations,
  textPrimary,
  darkMode,
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h4 className={`text-lg font-medium ${textPrimary}`}>
        Editing Item {annotations.findIndex((a) => a.id === annotation.id) + 1}
      </h4>
      <button
        onClick={() => onRemove(annotation.id)}
        className={`p-2 rounded-full text-red-400 transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
        title="Remove Hotspot"
      >
        <Trash2 size={20} />
      </button>
    </div>

    <input
      type="text"
      name="name"
      value={annotation.name}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Product Name (Matches Item.name)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
    <input
      type="text"
      name="price"
      value={annotation.price}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Price (Matches Item.price, e.g., $1,599)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
    <input
      type="url"
      name="link"
      value={annotation.link}
      onChange={(e) => onChange(annotation.id, e)}
      placeholder="Product Link (Matches Item.link)"
      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
      }`}
    />
  </div>
));
// =================================================================
// END ANNOTATION FORM
// =================================================================

// =================================================================
// 2. UPLOAD VIEW COMPONENT (MOVED OUTSIDE)
// =================================================================
// SVG circular progress ring constants
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const UploadView = ({ handleFileUpload, textPrimary, textSecondary, darkMode, cardBg, isUploading, uploadProgress }) => (
  <div className={`p-8 rounded-2xl shadow-xl ${cardBg} w-full max-w-2xl text-center`}>
    <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Upload Setup Photo</h2>
    <p className={`mb-8 ${textSecondary}`}>
      To start annotating, please upload a high-quality landscape or portrait image of your desk.
    </p>
    <label
      htmlFor="file-upload"
      className={`w-full aspect-video border-4 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors ${
        isUploading
          ? darkMode ? "border-red-500 bg-gray-700/80 cursor-wait" : "border-indigo-500 bg-gray-200 cursor-wait"
          : darkMode
            ? "border-gray-600 hover:border-red-400 bg-gray-700/50 cursor-pointer"
            : "border-gray-300 hover:border-indigo-600 bg-gray-100 cursor-pointer"
      }`}
    >
      {isUploading ? (
        /* ── Progress ring ── */
        <div className="flex flex-col items-center gap-4 select-none">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {/* Track */}
            <circle
              cx="64" cy="64" r={RING_RADIUS}
              fill="none"
              stroke={darkMode ? "#374151" : "#e5e7eb"}
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="64" cy="64" r={RING_RADIUS}
              fill="none"
              stroke="#ef4444"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE - (uploadProgress / 100) * RING_CIRCUMFERENCE}
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset 0.15s ease" }}
            />
            {/* Percentage label */}
            <text
              x="64" y="64"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill={darkMode ? "#f9fafb" : "#111827"}
            >
              {uploadProgress}%
            </text>
          </svg>
          <p className={`text-sm font-medium ${textSecondary}`}>Reading image…</p>
        </div>
      ) : (
        /* ── Default idle state ── */
        <>
          <Upload size={48} className={`mb-2 ${textSecondary}`} />
          <p className={`font-medium ${textPrimary}`}>Click to Upload Image</p>
          <p className={`text-sm ${textSecondary}`}>16:9 Landscape recommended</p>
        </>
      )}
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isUploading}
      />
    </label>
  </div>
);

// =================================================================
// 3. ANNOTATION VIEW COMPONENT (MOVED OUTSIDE)
// =================================================================
const AnnotationView = ({
  cardBg,
  textPrimary,
  textSecondary,
  darkMode,
  annotations,
  selectedAnnotationId,
  setSelectedAnnotationId,
  selectedAnnotation,
  uploadedImageSrc,
  handleImageClick,
  handleRemoveAnnotation,
  handleInputChange,
  setupName,
  setSetupName,
  totalCost,
  apiMessage,
  handleSaveData,
  loading,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
    {/* Left Column: Image Annotation Area */}
    <div className={`lg:col-span-2 p-6 rounded-2xl shadow-xl ${cardBg}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-xl font-bold ${textPrimary}`}>Setup Details & Annotations</h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${textSecondary}`}>
            {annotations.length} Items Tagged
          </span>
        </div>
      </div>

      {/* Setup Name Input */}
      <input
        type="text"
        value={setupName}
        onChange={(e) => setSetupName(e.target.value)}
        placeholder="Give your setup a name (e.g., Minimal Developer Setup)"
        className={`w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-colors ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
        }`}
      />

      {/* Image Container (Clickable) */}
      <div
        onClick={handleImageClick}
        className="w-full aspect-[16/9] rounded-xl relative shadow-2xl overflow-hidden cursor-crosshair bg-gray-900"
      >
        {uploadedImageSrc ? (
          <img src={uploadedImageSrc} alt="Uploaded Setup" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <Image size={48} className="text-gray-500" />
          </div>
        )}

        {annotations.map((ann) => (
          <div
            key={ann.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedAnnotationId(ann.id);
            }}
            className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 transform ${
              ann.id === selectedAnnotationId
                ? "bg-red-500 border-white scale-125 ring-4 ring-red-300"
                : "bg-white/80 border-gray-900/50 hover:bg-red-400/80"
            }`}
            style={{
              left: `${ann.x}%`,
              top: `${ann.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={ann.name || "Click to edit"}
          >
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-gray-900 pointer-events-none">
              {annotations.findIndex((a) => a.id === ann.id) + 1}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Right Column: Annotation Detail Form */}
    <div className={`lg:col-span-1 p-6 rounded-2xl shadow-xl ${cardBg} flex flex-col`}>
      <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>Item Details</h3>

      {!selectedAnnotation ? (
        <div
          className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border-dashed border-2 ${
            darkMode ? "border-gray-700 bg-gray-700/30" : "border-gray-200 bg-gray-50"
          }`}
        >
          <Edit3 size={32} className={textSecondary} />
          <p className={`mt-3 text-center ${textSecondary}`}>
            Click a hotspot on the image (or click the image to create a new one) to edit its details here.
          </p>
        </div>
      ) : (
        <AnnotationForm
          annotation={selectedAnnotation}
          onRemove={handleRemoveAnnotation}
          onChange={handleInputChange}
          annotations={annotations}
          textPrimary={textPrimary}
          darkMode={darkMode}
        />
      )}

      {/* Save and Total Section */}
      <div className={`mt-6 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        {apiMessage.text && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium ${
              apiMessage.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {apiMessage.text}
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <span className={`text-lg font-medium ${textPrimary}`}>Total Estimated Cost:</span>
          <span className={`text-2xl font-extrabold ${annotations.length > 0 ? "text-red-400" : textSecondary}`}>
            {totalCost}
          </span>
        </div>
        <button
          onClick={handleSaveData}
          disabled={annotations.length === 0 || !setupName || loading}
          className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
            annotations.length > 0 && setupName && !loading
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Post Setup
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

const Create = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  // --- Core State & Styling ---
  const [darkMode] = useState(true); // Default to Dark Mode
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ text: "", type: "" }); // 'success' or 'error'

  // Image read progress
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // State for image handling and general post data
  const [uploadedFile, setUploadedFile] = useState(null); // The actual File object for API
  const [uploadedImageSrc, setUploadedImageSrc] = useState(null); // The Data URL for display
  const [setupName, setSetupName] = useState("");

  // State for annotation data
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);

  // --- Utility Variables ---
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";

  const selectedAnnotation = useMemo(
    () => annotations.find((a) => a.id === selectedAnnotationId),
    [annotations, selectedAnnotationId],
  );

  // --- Handlers ---

  const resetState = () => {
    setIsAnnotating(false);
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setUploadedImageSrc(null);
    setUploadedFile(null);
    setSetupName("");
    setApiMessage({ text: "", type: "" });
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();

    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    reader.onloadend = () => {
      setUploadProgress(100);
      // Brief pause at 100% so the user sees the completed ring
      setTimeout(() => {
        setUploadedImageSrc(reader.result);
        setIsUploading(false);
        setIsAnnotating(true);
      }, 400);
    };

    reader.readAsDataURL(file);
  };

  const handleImageClick = useCallback(
    (e) => {
      if (!isAnnotating) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100; // % from left
      const y = ((e.clientY - rect.top) / rect.height) * 100; // % from top

      const newAnnotation = {
        id: crypto.randomUUID(),
        x: x,
        y: y,
        name: `New Item ${annotations.length + 1}`,
        price: "",
        link: "",
      };

      setAnnotations((prev) => [...prev, newAnnotation]);
      setSelectedAnnotationId(newAnnotation.id);
    },
    [isAnnotating, annotations.length],
  );

  const handleInputChange = useCallback((id, e) => {
    const { name, value } = e.target;
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, [name]: value } : ann));
  }, []);

  const handleRemoveAnnotation = useCallback(
    (id) => {
      setAnnotations((prev) => prev.filter((ann) => ann.id !== id));
      if (selectedAnnotationId === id) {
        setSelectedAnnotationId(null);
      }
    },
    [selectedAnnotationId],
  );



  const handleSaveData = async () => {
    if (!uploadedFile || !setupName || annotations.length === 0) {
      setApiMessage({
        text: "Please provide a Setup Name, upload an image, and add at least one item.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setApiMessage({ text: "", type: "" });

    // 1. Prepare the JSON payload for the 'data' form field
    const itemsPayload = annotations.map((ann) => ({
      // Fields matching the Item model
      name: ann.name,
      price: ann.price,
      link: ann.link,
      // Positional data for backend annotation serialization
      x: ann.x,
      y: ann.y,
    }));

    const jsonPayload = {
      setup_name: setupName,
      items: itemsPayload,
      // No need to send image_url, the backend handles the upload and URL creation
    };

    // 2. Construct the FormData object
    const formData = new FormData();
    formData.append("file", uploadedFile, uploadedFile.name);
    formData.append("data", JSON.stringify(jsonPayload));

    // 3. Send the POST request
    try {
      const response = await authFetch("http://127.0.0.1:5000/setups", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setApiMessage({
          text: `Setup saved successfully! ID: ${result.id}`,
          type: "success",
        });
        // Optionally: resetState();
        navigate(`/explore`);
      } else {
        setApiMessage({
          text: `Error saving setup: ${result.error || result.message || "Unknown error"}`,
          type: "error",
        });
        console.error("API ERROR RESPONSE:", result);
      }
    } catch (error) {
      setApiMessage({
        text: `Network or server error: ${error.message}. Make sure your backend server is running on port 5000.`,
        type: "error",
      });
      console.error("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalCost = useMemo(() => {
    return annotations
      .reduce((sum, item) => {
        // Basic extraction of numerical price for display
        const priceMatch = item.price.replace(/[$,]/g, "").match(/[\d.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
        return sum + price;
      }, 0)
      .toLocaleString("en-US", { style: "currency", currency: "USD" });
  }, [annotations]);

  // UploadView and AnnotationView are defined outside the Create component
  // (see top of file) to prevent focus loss on input re-renders.

  return (
    <div
      className={`min-h-screen flex flex-col items-center p-8 transition-colors ${bgColor}`}
    >
      <div className="flex justify-end items-center w-full max-w-7xl mb-8">
        {isAnnotating && (
          <button
            onClick={resetState}
            className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              darkMode
                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <ArrowLeft size={20} /> Restart Upload
          </button>
        )}
      </div>

      <div className="w-full flex justify-center">
        {isAnnotating ? (
          <AnnotationView
            cardBg={cardBg}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            darkMode={darkMode}
            annotations={annotations}
            selectedAnnotationId={selectedAnnotationId}
            setSelectedAnnotationId={setSelectedAnnotationId}
            selectedAnnotation={selectedAnnotation}
            uploadedImageSrc={uploadedImageSrc}
            handleImageClick={handleImageClick}
            handleRemoveAnnotation={handleRemoveAnnotation}
            handleInputChange={handleInputChange}
            setupName={setupName}
            setSetupName={setSetupName}
            totalCost={totalCost}
            apiMessage={apiMessage}
            handleSaveData={handleSaveData}
            loading={loading}
          />
        ) : (
          <UploadView
            handleFileUpload={handleFileUpload}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            darkMode={darkMode}
            cardBg={cardBg}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

export default Create;
