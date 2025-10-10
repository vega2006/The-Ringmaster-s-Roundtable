import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "10px",
};

const GoogleMapView = () => {
  const { origin, destination } = useTrip();
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directions, setDirections] = useState(null);

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.VITE_GOOGLE_MAPS_API_KEY, // add your API key
  });

  // Geocode cities only after the API is loaded
  useEffect(() => {
    if (!isLoaded) return;

    const geocoder = new window.google.maps.Geocoder();

    if (origin) {
      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === "OK" && results[0]) {
          setOriginCoords(results[0].geometry.location.toJSON());
        } else console.error("Geocode origin failed:", status);
      });
    }

    if (destination) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results[0]) {
          setDestinationCoords(results[0].geometry.location.toJSON());
        } else console.error("Geocode destination failed:", status);
      });
    }
  }, [origin, destination, isLoaded]);

  // Get directions after coords are ready
  useEffect(() => {
    if (!isLoaded || !originCoords || !destinationCoords) return;

    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: originCoords,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
        else console.error("Directions request failed:", status);
      }
    );
  }, [originCoords, destinationCoords, isLoaded]);

  if (loadError) return <p>Error loading Google Maps</p>;
  if (!isLoaded) return <p>Loading Google Maps...</p>;
  if (!originCoords || !destinationCoords) return <p>Loading coordinates...</p>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={originCoords} zoom={6}>
      <Marker position={originCoords} label={{ text: "Origin", color: "white" }} />
      <Marker position={destinationCoords} label={{ text: "Destination", color: "white" }} />
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default GoogleMapView;
