import toast from "react-hot-toast";


import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {  FaShareNodes } from "react-icons/fa6";
import { IoIosCopy } from "react-icons/io";
import { MdDeleteOutline, MdOutlineQrCodeScanner } from "react-icons/md";
import { motion } from "framer-motion";

const History = ({ history, setHistory, previewUrl, setPreviewUrl }) => {
  const [showQR, setShowQR] = useState(false);

  const handleDelete = async (index, shortUrl) => {
    try {
      // extract shortCode from the URL (last part after slash)

      const shortCode = shortUrl.split("/").pop();

      // send delete request

      const res = await fetch(`${import.meta.env.VITE_API_URL}/${shortCode}`, {
        method: "DELETE",
      });

      //  if (!res.ok) {
      // throw new Error("Failed to delete from server");
      // }

      // update local history

      const updatedHistory = history.filter((_, i) => i !== index);
      setHistory(updatedHistory);

      //  Update localStorage too

      localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));

      toast.error("Deleted from history!");
    } catch (err) {
      console.error(err);
      toast.error("Could not delete from the server");
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to delete all URLs?")) {
      localStorage.removeItem("shortedHistory");
      setHistory([]);
    }
  };


// React will interpret item.shortUrl as a destructuring expression, not a parameter name.
// It should instead accept a normal variable name, like "url"

  const handleShare = async (url) => {
    if(navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
        text: "I shortened this link using HexaURL:",
        url,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.error("Share cancelled or failed:", err);
        toast.error("Share cancelled or failed.");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard (sharing not supported)");
    }
  }




  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* ================= History Section ================= */}
      <aside className="md:col-span-2 neon-card p-4 rounded-2xl max-h-[337px] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold ">
            {/* text-violet-600 */}
            History
          </h3>

          {/* show clear all button  */}

          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="font-semibold text-sm text-red-600  hover:text-red-600 transition-colors px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20"
              >
                Clear All
              </button>
            )}
            <h2 className="text-sm text-slate-400">Recent</h2>
          </div>
        </div>

        {/* History List Placeholder */}

        <div className="space-y-3 ">
          {history.length > 0 ? (
            history.map((item, index) => (
              <div
                key={index}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-black/20 border border-indigo-700/20 rounded-lg p-3 "
              >
                <div className="min-w-0 truncate">
                  

                  <a
                    href={item.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-cyan-300 truncate "
                  >
                    {item.shortUrl}
                  </a>

                  <p className="text-xs text-slate-400 truncate mt-1">
                    {item.longUrl}
                  </p>
                </div>


                <div className="flex items-center gap-2 ">


                  {/* open button  */}

                  <button
                    onClick={() => window.open(item.shortUrl, "_blank")}
                    className="px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5 cursor-pointer text-emerald-500 hover:text-emerald-300"
                  >
                    Open
                  </button>

                  {/* copy button  */}

                  <motion.button
                    onClick={() => {
                      navigator.clipboard.writeText(item.shortUrl);
                      toast.success("Copied to clipboard!");
                    }}
                    className="relative flex items-center justify-center px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5 transition-all duration-200 group cursor-pointer "
                  >
                    <span className="transition-opacity duration-200 group-hover:opacity-0 text-slate-300">
                      Copy
                      </span>
                    
                    <IoIosCopy className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-base hover:text-slate-400"/>

                  </motion.button>

                  {/* share button */}

                  <button 
                  onClick={() => handleShare(item.shortUrl)}
                  className="relative flex items-center justify-center px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5 transition-all duration-200 group cursor-pointer">
                    
                    <span className="transition-opacity duration-200 group-hover:opacity-0 text-sky-400">
                      Share
                      </span>
                    <FaShareNodes className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-base hover:text-sky-500" />

                    
                  </button>

                  {/* QR CODE button  */}

                  <button
                    onClick={() => {
                      setPreviewUrl(item.shortUrl);
                      setShowQR(true);
                    }}
                    className="relative flex items-center justify-center px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5 transition-all duration-200 group cursor-pointer"
                  >

                    <span className="transition-opacity duration-200 group-hover:opacity-0 text-violet-500 ">
                      QR
                    </span>
                    
                    <MdOutlineQrCodeScanner className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-base hover:text-violet-400"/>
                  </button>

                  {/* delete button  */}

                  <button
                    onClick={() => handleDelete(index, item.shortUrl)}
                    className="relative flex items-center justify-center px-2 py-1 rounded bg-transparent border border-indigo-700/20 text-sm hover:bg-white/5 transition-all duration-200 group cursor-pointer"
                  >
                    <span className="transition-opacity duration-200 group-hover:opacity-0 text-red-500 ">
                      Delete
                    </span>
                    
                    <MdDeleteOutline className="absolute opacity-0  group-hover:opacity-100 transition-opacity duration-200 text-base hover:text-red-700"/>
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
          <h4 className="text-sm font-semibold  ">
            {/* text-violet-600 */}
            Live Preview
          </h4>

          <p className="text-xs text-slate-400 mt-1">
            Click shorten to preview link and generate QR.
          </p>
        </div>

        {/* Preview Box */}

        <div className="bg-black/30 border border-indigo-700/30 rounded-lg p-3  flex flex-col items-center justify-center gap-3 md:min-h-[190px] sm:min-h-[90px]">
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
                  className="px-8 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
                >
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

          
        </div>

        {/* Buttons */}
        {previewUrl && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(previewUrl);
                toast.success("Copied to clipboard!");
              }}
              className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
            >
              Copy
            </button>

            <button
              onClick={() => window.open(previewUrl, "_blank")}
              className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
            >
              Open
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

export default History;
