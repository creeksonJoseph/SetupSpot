import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, ArrowLeft, Search } from "lucide-react";
import { useSEO } from "../hooks/useSEO";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useSEO({
    title: 'Page Not Found | SetupSpot',
    description: 'This page does not exist. Head back to SetupSpot to discover amazing desk setups.',
    noindex: true,
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}
    >
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[clamp(6rem,20vw,10rem)] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #0066ff 0%, #5a27f1 60%, #0066ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            404
          </span>

          {/* Decorative blur circle behind the number */}
          <div
            className="absolute inset-0 -z-10 blur-3xl opacity-20 rounded-full"
            style={{ background: "linear-gradient(135deg, #0066ff, #5a27f1)" }}
          />
        </div>

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(0,102,255,0.12) 0%, rgba(90,39,241,0.12) 100%)",
            border: "1px solid rgba(0,102,255,0.2)",
          }}
        >
          <Compass size={28} style={{ color: "#0066ff" }} />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: "#0F172A" }}>
          Page not found
        </h1>

        <p className="text-sm leading-relaxed mb-8" style={{ color: "#727687", maxWidth: "320px" }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to discovering setups.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all w-full sm:w-auto"
            style={{ backgroundColor: "#0066ff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0050cb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0066ff")}
          >
            <Search size={16} />
            Explore Setups
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all w-full sm:w-auto"
            style={{ borderColor: "#E2E8F0", color: "#0F172A", backgroundColor: "#ffffff" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>

      {/* Gradient animation keyframe */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
