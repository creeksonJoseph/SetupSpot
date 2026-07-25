import React from "react";
import { Link } from "react-router-dom";

export const UserSetupsGrid = ({ setups, deleteSetup }) => (
  <>
    <h2 className="text-xl font-bold mb-4" style={{ color: "#0F172A" }}>
      Your Posts
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {setups.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <span className="material-symbols-outlined text-5xl mb-3 block" style={{ color: "#E2E8F0" }}>
            photo_camera
          </span>
          <p className="text-sm" style={{ color: "#727687" }}>
            No setups posted yet.
          </p>
        </div>
      ) : (
        setups.map((setup) => (
          <div
            key={setup.id}
            className="group relative overflow-hidden rounded-xl border"
            style={{ borderColor: "#E2E8F0" }}
          >
            <Link to={`/post/${setup.id}`} className="block">
              <div
                className="bg-cover bg-center flex flex-col justify-end p-4 h-48 w-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%), url("${setup.image}")`,
                }}
              >
                <p className="text-white text-base font-bold leading-tight w-full line-clamp-3">
                  {setup.title}
                </p>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                deleteSetup(setup.id);
              }}
              className="absolute top-3 right-3 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "#ba1a1a" }}
              title="Delete setup"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))
      )}
    </div>
  </>
);
