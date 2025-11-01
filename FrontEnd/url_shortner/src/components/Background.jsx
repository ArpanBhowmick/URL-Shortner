





// src/components/Background.jsx

import "../index.css"; // import Tailwind + custom neon styles

const Background = ({ children }) => {
  return (
    <div className="relative min-h-screen px-4 py-10 antialiased text-slate-200">
      {/* Grid + radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-slate-900 via-slate-950 to-black bg-grid" aria-hidden="true"></div>

      {/* Page content */}
      <div className="relative max-w-6xl mx-auto space-y-8">
        {children}
      </div>
    </div>
  );
};

export default Background;








