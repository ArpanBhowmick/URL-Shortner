import Url from "../Models/Url.js";
import shortid from "shortid";

export const shortUrl = async (req, res) => {
  try {
    let { longUrl, customSlug, expiryDays } = req.body;

    longUrl = longUrl?.trim();

    // Validate long URL
    if (!longUrl) return res.status(400).json({ message: "URL required" });

    // If user gave a custom slug, use it — otherwise generate one

    const shortCode = customSlug ? customSlug.trim() : shortid.generate();

    // Check if the slug already exists

    const existing = await Url.findOne({ shortCode });

    if (existing) {
      return res.status(400).json({ message: "This slug is already taken!" });
    }

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    // calculate expiry days
    let expireAt = null;

    if (expiryDays && expiryDays > 0) {
      expireAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    }

    //     The first expiryDays part checks that the value exists (not undefined or empty).
    // The second part expiryDays > 0 checks that the user didn’t type “0”. If both are true, then we calculate the expiry date.

    // save to database

    const newUrl = new Url({
      shortCode,
      longUrl,
      expireAt,
    });
    //creates a record that stores both the random short code and the original long URL together.
    //shortCode acts like a button to finds the longUrl in the same record and “calls it

    await newUrl.save(); //saves this record in MongoDB.
    console.log("shorturl saved = ", newUrl);

    return res.status(201).json({ shortUrl });
    // res.json({shortUrl})
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





export const deleteUrl = async (req, res) => {

    try {
        const { shortCode } = req.params;

         // Try deleting

        const deletedUrl = await Url.findByIdAndDelete({shortCode});

        if (!deletedUrl) {
            return res.status(404).json({message: "Url deleted succcessfully"})
        }

        console.log("Deleted:", deletedUrl);

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Server error" });
    }
}



export const getOriginalUrl = async (req, res) => {
  const shortCode = req.params.shortedCode;

  // find on DB

  const originalUrl = await Url.findOne({ shortCode });
  if (originalUrl) {
    res.redirect(originalUrl.longUrl);
  } else {
    res.status(404).json({ message: "Invalid shortcode" });
  }
};

// Why?:
// Handles the logic for creating, saving, and responding with short URLs.
