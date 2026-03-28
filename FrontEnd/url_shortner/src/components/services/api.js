const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// only added this above code and this line  `${API_URL}/short`

export const shortenUrl = async (longUrl, customSlug, expiryDays) => {
  try {
    //Send data to backend

    // const res = await fetch(`${import.meta.env.VITE_API_URL}/short`, {

    const res = await fetch(`${API_URL}/short`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        longUrl,
        customSlug,
        expiryDays: expiryDays ? Number(expiryDays) : 0,
      }),
    });

    // check and return data to the component

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to shorten URL");
    }
    return await res.json();

    //   const data = await res.json();
    //   setShortUrl(data.shortUrl);
  } catch (err) {
    console.error(err);
     throw err;
  }
};
