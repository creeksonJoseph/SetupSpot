import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Layers, ExternalLink } from "lucide-react";
import { usePublicCollection } from "../hooks/usePublicCollection";
import { CollectionItemCard } from "../components/collections/CollectionItemCard";
import { CollectionGridSkeleton } from "../components/CardSkeleton";

export const PublicCollectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collection, loading, error } = usePublicCollection(id);

  if (loading) {
    return (
      <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <CollectionGridSkeleton />
      </main>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg font-bold text-slate-900">
          {error || "Collection not found"}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft size={14} /> Go Back
        </button>
      </div>
    );
  }

  const items = collection.items || [];

  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Navigation & Header */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold mb-6 transition-all hover:bg-slate-100 cursor-pointer text-slate-900 bg-white"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Layers size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Public Collection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {collection.name}
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            {items.length} {items.length === 1 ? "saved item" : "saved items"}
          </p>
        </div>
      </div>

      {/* Collection Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Layers size={40} className="text-slate-300" />
          <p className="text-sm font-semibold text-slate-400">
            This collection is currently empty
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <CollectionItemCard key={item.id} item={item} isOwner={false} />
          ))}
        </div>
      )}
    </main>
  );
};

export default PublicCollectionPage;
