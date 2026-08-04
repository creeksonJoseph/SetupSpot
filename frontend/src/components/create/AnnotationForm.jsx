import React from "react";
import { Trash2 } from "lucide-react";

export const AnnotationForm = React.memo(
  ({ annotation, onRemove, onChange, annotations, textPrimary }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center pb-1">
        <h4 className={`text-sm font-bold ${textPrimary}`}>
          Edit Item #{annotations.findIndex((a) => a.id === annotation.id) + 1}
        </h4>
        <button
          onClick={() => onRemove(annotation.id)}
          className="p-1.5 rounded-none transition-colors text-rose-600 hover:bg-rose-50 cursor-pointer"
          title="Remove Item"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <input
        type="text"
        name="name"
        value={annotation.name}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Product Name (e.g. Apple Studio Display)"
        className="w-full p-2.5 border rounded-none text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <input
        type="text"
        name="price"
        value={annotation.price}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Price (e.g. $1,599)"
        className="w-full p-2.5 border rounded-none text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <input
        type="url"
        name="link"
        value={annotation.link}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Merchant Link (e.g. https://apple.com/...)"
        className="w-full p-2.5 border rounded-none text-xs outline-none transition-all"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
      <textarea
        name="description"
        value={annotation.description || ""}
        onChange={(e) => onChange(annotation.id, e)}
        placeholder="Item description (optional)"
        rows={3}
        className="w-full p-2.5 border rounded-none text-xs outline-none transition-all resize-none"
        style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", color: "#0F172A" }}
        onFocus={(e) => (e.target.style.borderColor = "#0066ff")}
        onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
      />
    </div>
  )
);
