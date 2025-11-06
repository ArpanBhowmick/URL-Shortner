

import { useEffect, useState } from "react";

import { toast } from "react-hot-toast";
import History from "./History";
import { shortenUrl } from "./services/api";

const MainCard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!longUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    

    try {
      const data = await shortenUrl(longUrl, customSlug, expiryDays);

      //  handle state updates here

      setShortUrl(data.shortUrl);
      toast.success("URl shortened");

      // adds new entry for history , newEntry = one new record in the history list.

      const newEntry = {
        longUrl,
        shortUrl: data.shortUrl,
        createdAt: new Date().toLocaleString(),
      };

      // Add new entry at the top of history
      const updatedHistory = [newEntry, ...history];

      // Update state
      setHistory(updatedHistory);

      // Save to localStorage

      localStorage.setItem("shortedHistory", JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      toast.error("Failed to shorten URL. Please try again.");
    }
  };

  const handleClear = () => {
    setCustomSlug("");
    setExpiryDays("");
    setLongUrl("");
    setShortUrl("");
  };

  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("shortedHistory")) || [];
    setHistory(storedHistory);
  }, []);


//   useEffect(() => {
//   localStorage.setItem("shortedHistory", JSON.stringify(history));
// }, [history]);



  return (
    <>
      <section className="neon-card rounded-3xl p-6 enter show">
        {/* Header inside card */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold ">
              {/* text-violet-600 */}
              Shorten any link — instantly
            </h2>
            <p className="text-slate-400 mt-1 text-sm max-w-xl">
              Paste your long URL and get a compact, shareable link. complete with history, copy, and QR features.
            </p>
          </div>
        </div>

        {/* URL Shortener Form */}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          {/* Inputs */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* long URL */}

            <input
              type="url"
              name="longUrl"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/path"
              // required
              className="col-span-2 rounded-lg px-4 py-3 bg-transparent border border-indigo-700/20 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />

            {/* custom-slug  */}

            <input
              type="text"
              name="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="custom-slug (optional)"
              className="rounded-lg px-4 py-3 bg-transparent border border-indigo-700/20 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {/* Expiry + Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="number"
              value={expiryDays}
              placeholder="expiry days (0 = never)"
              min="0"
              onChange={(e) => setExpiryDays(e.target.value)}
              className="rounded-lg px-4 py-2 bg-transparent border border-indigo-700/20 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
            />

            <button
              type="submit"
              className="ml-auto  text-black font-semibold rounded-lg px-5 py-2 bg-gradient-to-r from-cyan-300 to-blue-600 
            hover:from-green-700 hover:to-green-700 hover:text-white transition-all duration-300 cursor-pointer
            "
            >
              Shorten
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="ml-2 px-3 py-2 rounded-lg text-sm border border-purple-400/30 hover:bg-white/5  "
            >
              Clear
            </button>
          </div>

          {/* Placeholder for form messages */}
          <p className="text-sm text-rose-400 h-5"></p>
        </form>

        {/* Shorted Result / preview area (static placeholder for now) */}
        <div className="mt-6">
          {shortUrl && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/30 border border-indigo-700/30 rounded-lg p-4">
              <div className="min-w-0 truncate">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener"
                  className="font-semibold text-cyan-300 truncate"
                >
                  {shortUrl}
                </a>

                {/* Original URL will appear here */}
                <p className="text-xs text-slate-400 truncate mt-1">
                  {longUrl}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Copy Button */}

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shortUrl);
                    toast.success("Copied to clipboad!");
                  }}
                  className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
                >
                  Copy
                </button>

                {/* open button */}

                <button
                  onClick={() => window.open(shortUrl, "_blank")}
                  className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5"
                >
                  Open
                </button>

                {/* <button className="px-3 py-2 rounded-lg bg-transparent border border-indigo-700/20 hover:bg-white/5">
                  QR
                </button> */}
                
              </div>
            </div>
          )}
        </div>
      </section>
      <History
        history={history}
        setHistory={setHistory}
        previewUrl={shortUrl}
        setPreviewUrl={setShortUrl}
        
      />
    </>
  );
};

export default MainCard;
