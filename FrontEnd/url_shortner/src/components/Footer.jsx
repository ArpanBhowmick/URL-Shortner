


// const Footer = () => {
//   return (
//     <footer id="footer" class="text-center text-sm text-slate-400 mt-6">
//           Built with ❤️ by Hexagon — Neon demo for portfolio
//         </footer>
//   )
// }

// export default Footer



// src/components/Footer.jsx
import React from "react";
import "../index.css"; // import neon utilities

const Footer = () => {
  return (
    <footer className="text-center text-sm text-slate-400 mt-6">
      Built with <span className="text-rose-500">❤️</span> by Hexagon — Neon demo for portfolio
    </footer>
  );
};

export default Footer;
