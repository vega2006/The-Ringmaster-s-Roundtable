import { useState } from "react";
import { useTrip } from "../contexts/TripContext";

export default function TestDestinationImages() {
  const { images, destination, setImages } = useTrip();
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (!destination) return;
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:4000/api/images/${encodeURIComponent(destination)}`
      );
      const data = await res.json();
      // Backend returns array of {id, description, url}
      console.log("imageeeee",data);
      setImages(data);
    } catch (err) {
      console.error("Error fetching images:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Test Destination Images</h1>

      <div className="mb-6 flex items-center gap-2">
        {(images?.length === 0 || !images) && (
          <button
            onClick={fetchImages}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Fetch Images
          </button>
        )}
      </div>

      {loading && <p>Loading images...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images?.map((image) => (
          <img
            key={image.id}
            src={image.url}
            alt={`Destination ${destination}`}
            className="w-full h-40 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
          />
        ))}
      </div>
    </div>
  );
}
