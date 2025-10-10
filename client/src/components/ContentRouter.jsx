import { useTrip } from "../contexts/TripContext";
import PlanInput from "./PlanInput";
import WeatherContent from "./WeatherContent";
import TravelContent from "./TravelContent";
import ItineraryContent from "./ItineraryContent";
import BudgetContent from "./BudgetContent";
import EventsContent from "./EventsContent";
import TestDestinationImages from "./destinationImage";
export default function ContentRouter() {
  const { activeTab } = useTrip();

  switch (activeTab) {
    case "Plan": return <PlanInput />;
    case "Weather": return <WeatherContent />;
    case "Travel": return <TravelContent />;
    case "Itinerary": return <ItineraryContent />;
    case "Budget": return <BudgetContent />;
    case "Events": return <EventsContent />;
    case "Image": return <TestDestinationImages />;
    default: return <PlanInput />;
  }
}
