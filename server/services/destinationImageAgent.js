

const getDestinationImage = async (req, res) => {
  try {
    const { query } = req.params;
   console.log(query);
   console.log(process.env.UNSPLASH_API_KEY);
   const response = await fetch(
  `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12`,
  {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_API_KEY}`
    }
  }
);

    if (!response.ok) throw new Error("Failed to fetch images");

    const data = await response.json();
    res.json(
      data.results.map((img) => ({
        id: img.id,
        description: img.alt_description,
        url: img.urls.small,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

module.exports = { getDestinationImage };
