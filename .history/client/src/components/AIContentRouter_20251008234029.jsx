import { useTrip } from "../contexts/TripContext";
import PlanByPrompt from "./PlanByPrompt";
import WeatherContent from "./WeatherContent";
import TravelContent from "./TravelContent";
import ItineraryContent from "./ItineraryContent";
import BudgetContent from "./BudgetContent";
import EventsContent from "./EventsContent";

export default function ContentRouter() {
  const { activeTab } = useTrip();

  switch (activeTab) {
    case "Plan": return <PlanByPrompt />;
    case "Weather": return <WeatherContent />;
    case "Travel": return <TravelContent />;
    case "Itinerary": return <ItineraryContent />;
    case "Budget": return <BudgetContent />;
    case "Events": return <EventsContent />;
    default: return <PlanInput />;
  }
}
