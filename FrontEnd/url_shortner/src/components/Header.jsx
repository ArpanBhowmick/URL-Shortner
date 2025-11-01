








// src/components/Header.jsx
// import React, { useState } from "react";

import "../index.css"; // import neon utilities

const Header = () => {

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 enter show">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4">
        {/* Neon logo box */}
        <div className="w-16 h-16 neon-card flex items-center justify-center rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-cyan-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
              d="M3 12h18M12 3v18"
            />
          </svg>
        </div>

        {/* Title + Subtitle */}
        <div>
          <h1 className="text-3xl font-extrabold neon-text">URL Shortener</h1>
          <p className="text-slate-400 text-sm">
            Futuristic URL shortener — resume-ready demo with neon UI & interactive UX
          </p>
        </div>
      </div>

      {/* Right: Toggle button + Credit link */}

      {/* <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg btn-outline-neon hover:scale-105 transition-transform text-sm"
        >
          {isLight ? "Toggle Neon" : "Toggle Light"}
        </button>
        <a href="#footer" className="text-sm text-slate-400 hover:text-cyan-300">
          Built by Hexagon
        </a>
      </div> */}
    </header>
  );
};

export default Header;
