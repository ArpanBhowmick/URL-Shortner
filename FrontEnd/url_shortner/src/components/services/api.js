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
          expiryDays: expiryDays ? Number(expiryDays) : 0 
        }),
      });

        // return data to the component

       return await res.json(); 

    //   const data = await res.json();
    //   setShortUrl(data.shortUrl);
    } catch (err) {
      console.error(err);
    }
    
}






