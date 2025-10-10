import { GoogleMap, Marker, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";
const GoogleMapView = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [directions, setDirections] = useState(null);

  const containerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "10px",
  };

   const { 
    origin, 
    destination, 
  } = useTrip();
  // ✅ Step 1: Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  // ✅ Step 2: Extract destination from the map object
  const destination = map?.legs?.[0]?.end_location;

  // ✅ Step 3: Calculate directions (only after we have source & destination)
  useEffect(() => {
    if (currentLocation && destination) {
      const service = new window.google.maps.DirectionsService();
      service.route(
        {
          origin: currentLocation,
          destination: destination, // destination from map.legs[0].end_location
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.error("Error fetching directions:", result);
          }
        }
      );
    }
  }, [currentLocation, destination]);

  return (
    currentLocation && (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentLocation}
        zoom={6}
      >
        {/* ✅ Marker at current location (source) */}
        <Marker
          position={currentLocation}
          label={{
            text: "Source",
            color: "white",
            fontWeight: "bold",
          }}
        />

        {/* ✅ Marker at destination (from map data) */}
        {destination && (
          <Marker
            position={destination}
            label={{
              text: weather?.[0]?.main?.temp
                ? `${weather[0].main.temp}°C`
                : "Destination",
              color: "white",
              fontWeight: "bold",
            }}
          />
        )}

        {/* ✅ Draw the route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    )
  );
};

export default GoogleMapView;
