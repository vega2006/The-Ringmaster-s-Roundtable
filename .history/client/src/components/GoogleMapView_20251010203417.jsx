import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";

const GoogleMapView = () => {
  const { origin, destination } = useTrip();
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directions, setDirections] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "10px",
  };

  // Geocode origin & destination city names
  useEffect(() => {
    const geocoder = new window.google.maps.Geocoder();

    if (origin) {
      geocoder.geocode({ address: origin }, (results, status) => {
        if (status === "OK" && results[0]) {
          setOriginCoords(results[0].geometry.location.toJSON());
        } else {
          console.error("Error geocoding origin:", status);
        }
      });
    }

    if (destination) {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK" && results[0]) {
          setDestinationCoords(results[0].geometry.location.toJSON());
        } else {
          console.error("Error geocoding destination:", status);
        }
      });
    }
  }, [origin, destination]);

  // Calculate directions
  useEffect(() => {
    if (originCoords && destinationCoords) {
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: originCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.error("Error fetching directions:", status);
          }
        }
      );
    }
  }, [originCoords, destinationCoords]);

  if (!originCoords || !destinationCoords) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={originCoords}
      zoom={6}
    >
      <Marker position={originCoords} label={{ text: "Origin", color: "white" }} />
      <Marker position={destinationCoords} label={{ text: "Destination", color: "white" }} />
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default GoogleMapView;
