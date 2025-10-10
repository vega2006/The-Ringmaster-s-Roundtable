import { useTrip } from "../contexts/TripContext";
import PlanInput from "./PlanInput";
import WeatherContent from "./WeatherContent";
import TravelContent from "./TravelContent";
import ItineraryContent from "./ItineraryContent";
import BudgetContent from "./BudgetContent";
import EventsContent from "./EventsContent";

export default function AIContentRouter() {
  const { activeTab } = useTrip();

  switch (activeTab) {
    case "Weather": return <WeatherContent />;
    case "Travel": return <TravelContent />;
    case "Itinerary": return <ItineraryContent />;
    case "Budget": return <BudgetContent />;
    case "Events": return <EventsContent />;
    default: return <PlanInput />;
  }
}
