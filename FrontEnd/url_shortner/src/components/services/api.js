
export const shortenUrl = async (longUrl, customSlug, expiryDays) => {
    try {
      //Send data to backend
      const res = await fetch("http://localhost:5000/short", {
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




