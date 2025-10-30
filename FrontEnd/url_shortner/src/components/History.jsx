

// src/components/History.jsx

import toast from "react-hot-toast";
import "../index.css"; // import neon utilities

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const History = ({ history, setHistory, previewUrl }) => {
  const [showQR, setShowQR] = useState(false);
  

  const handleDelete = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    toast.error("Deleted from history!");
  };




  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* ================= History Section ================= */}
      <aside className="md:col-span-2 neon-card p-4 rounded-2xl max-h-[337px] overflow-y-auto">

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold neon-accent">History</h3>
          <div className="text-sm text-slate-400">Recent</div>
        </div>

        {/* History List Placeholder */}

        <div className="space-y-3 ">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 bg-black/20 border border-indigo-700/20 rounded-lg p-3 "
              >
                <div className="min-w-0">
                  {/* <a href="#" className="font-medium text-cyan-300 truncate">
                —
              </a> */}

                  {/* <p className="text-xs text-slate-400 truncate mt-1">
                    Original URL will appear here
                  </p> */}

                  <a
                    href={item.shortUrl}
                    target="_blank"
                    className="font-medium text-cyan-300 truncate"
                  >
                    {item.shortUrl}
                  </a>

                  <p className="text-xs text-slate-400 truncate mt-1">
                    {item.longUrl}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {/* copy button  */}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.shortUrl);
                      toast.success("Copied to clipboard!");
                    }}
                    className="px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5"
                  >
                    Copy
                  </button>

                  {/* open button  */}

                  <button
                    onClick={() => window.open(item.shortUrl, "_blank")}
                    className="px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5"
                  >
                    Open
                  </button>

                  {/* delete button  */}

                  <button
                    onClick={() => handleDelete(index)}
                    className="px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 mt-2">
              No shortened links yet.
            </p>
          )}
        </div>
      </aside>

      {/* ================= Live Preview / QR Section ================= */}
      <aside className="neon-card p-4 rounded-2xl ">
        <div className="mb-3">
          <h4 className="text-sm neon-accent font-medium">Live Preview</h4>
          <p className="text-xs text-slate-400 mt-1">
            Click shorten to preview link and generate QR.
          </p>
        </div>

        {/* Preview Box */}

        <div className="bg-black/30 border border-indigo-700/30 rounded-lg p-3  flex flex-col items-center justify-center gap-3 min-h-[190px]">
          {previewUrl ? (
            showQR ? (

               // CASE 1: Show QR

              <>

              <div className="bg-transparent border border-indigo-700/20 p-7">
                <QRCodeSVG value={previewUrl} size={128} />
              </div>
                <button
                  onClick={() => setShowQR(false)}
                  className="px-8 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
                >
                  Hide QR
                </button>
              </>
            ) : (

              // CASE 2: Show short link text

              <>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 font-semibold break-all bg-transparent border border-indigo-700/20 p-2"
                >
                  {previewUrl}
                </a>

                {/* QR toggle button  */}

                <button
                onClick={() => setShowQR(true)}
                className="px-8 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5">
                  Show QR
                </button>
              </>
            )
          ) : (

            // CASE 3: No preview yet

            <>
              <p className="text-slate-400 text-sm">
                No preview yet — shorten a link first.
              </p>
            </>
          )}

          {/* <div className="text-cyan-300 font-semibold break-all">
            —
          </div> */}

          {/* <div className="text-xs text-slate-400 mt-1">
            Original URL will appear here
          </div> */}
        </div>

        {/* Buttons */}
        {previewUrl && (
          <div className="mt-4 flex items-center justify-center gap-3">

            <button 
            onClick={() => {navigator.clipboard.writeText(previewUrl);
                toast.success("Copied to clipboard!");}}
            className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5">
              Copy
            </button>

            <button 
            onClick={() => window.open(previewUrl, "_blank")}
            className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5">
              Open
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default History;
