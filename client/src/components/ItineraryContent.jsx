
import React, { useState, useEffect } from "react";
import { useTrip } from "../contexts/TripContext";
import { getItinerary } from "../api/api";

export default function Itinerary() {
  const { destination, startTravelDate, endTravelDate } = useTrip();
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [gisTokenClient, setGisTokenClient] = useState(null);

  // ----------- GOOGLE API SETUP -----------
  const CLIENT_ID =
    "1055408447419-6u2fdehpbpa4gnli3qb4id4nofs3nr5h.apps.googleusercontent.com";
  const API_KEY = "AIzaSyDMhaeECA3QABTFtjQl4YQl8gROd3XPQaA";
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";

  useEffect(() => {
    const loadScripts = async () => {
      // Load GAPI
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = resolve;
        document.body.appendChild(script);
      });

      // Load GIS
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = resolve;
        document.body.appendChild(script);
      });

      // Initialize GAPI client
      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        setGapiLoaded(true);
      });

      // Initialize GIS token client
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: "", // set later
      });
      setGisTokenClient(tokenClient);
    };

    loadScripts();
  }, []);

  // ----------- ADD EVENT TO GOOGLE CALENDAR -----------
  const addEventToCalendar = async (
    summary,
    description,
    startDateTime,
    endDateTime
  ) => {
    const event = {
      summary,
      description,
      start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };

    try {
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      console.log("✅ Event created:", response.result.htmlLink);
    } catch (error) {
      console.error("❌ Error creating event:", error);
    }
  };

  // ----------- HANDLE ADD TO CALENDAR -----------
  const handleAddToCalendar = async () => {
    if (!gapiLoaded || !gisTokenClient) {
      alert("Google API not ready yet. Try again in a few seconds.");
      return;
    }

    if (!itinerary.length) {
      alert("Generate your itinerary first!");
      return;
    }

    gisTokenClient.callback = async (resp) => {
      if (resp.error) {
        console.error("Token error:", resp);
        alert("Failed to authenticate with Google.");
        return;
      }

      for (const day of itinerary) {
        const dayDate = new Date(startTravelDate);
        dayDate.setDate(dayDate.getDate() + (day.day - 1));

        const makeTime = (hours, minutes = 0) => {
          const d = new Date(dayDate);
          d.setHours(hours, minutes, 0);
          return d.toISOString();
        };

        // ✅ Use the day number + location name as event title
        await addEventToCalendar(
          `Day ${day.day} — ${day.morning}`,
          `Morning visit for Day ${day.day} in ${destination}`,
          makeTime(9, 0),
          makeTime(11, 0)
        );

        await addEventToCalendar(
          `Day ${day.day} — ${day.afternoon}`,
          `Afternoon visit for Day ${day.day} in ${destination}`,
          makeTime(12, 0),
          makeTime(15, 0)
        );

        await addEventToCalendar(
          `Day ${day.day} — ${day.evening}`,
          `Evening visit for Day ${day.day} in ${destination}`,
          makeTime(18, 0),
          makeTime(21, 0)
        );
      }

      alert("✅ Itinerary added to Google Calendar!");
    };

    // Open Google login popup
    gisTokenClient.requestAccessToken();
  };

  // ----------- HANDLE ITINERARY GENERATION -----------
  const handleGenerateItinerary = async () => {
    if (!destination || !startTravelDate || !endTravelDate) {
      setError("Please fill destination and both travel dates first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setItinerary([]);

      const res = await getItinerary(destination, startTravelDate, endTravelDate);
      setItinerary(res.data.itinerary || []);
    } catch (err) {
      console.error(err);
      setError("Failed to generate itinerary. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------- RENDER UI -----------
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 Day-by-Day Itinerary</h2>

      <div className="flex items-center gap-4 mb-6">
        <p>
          <strong>Destination:</strong> {destination || "—"}
        </p>
        <p>
          <strong>From:</strong> {startTravelDate || "—"}
        </p>
        <p>
          <strong>To:</strong> {endTravelDate || "—"}
        </p>
      </div>

      <button
        onClick={handleGenerateItinerary}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Itinerary"}
      </button>

      {itinerary.length > 0 && (
        <button
          onClick={handleAddToCalendar}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add to Google Calendar
        </button>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {itinerary.length > 0 && (
        <div className="mt-6 space-y-4">
          {itinerary.map((day) => (
            <div
              key={day.day}
              className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">Day {day.day}</h3>
              <ul className="space-y-1">
                <li>🌅 <strong>Morning:</strong> {day.morning}</li>
                <li>🌞 <strong>Afternoon:</strong> {day.afternoon}</li>
                <li>🌙 <strong>Evening:</strong> {day.evening}</li>
              </ul>
            </div>
          ))}
        </div>
      )}

      {!loading && itinerary.length === 0 && !error && (
        <p className="mt-6 text-gray-600">
          👆 Click <strong>Generate Itinerary</strong> to plan your trip day by day.
        </p>
      )}
    </div>
  );
}
