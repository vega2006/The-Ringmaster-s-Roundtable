import { useTrip } from "../contexts/TripContext";
import PlanByPrompt from "./PlanByPrompt";
import WeatherContent from "./WeatherContent";
import TravelContent from "./TravelContent";
import ItineraryContent from "./ItineraryContent";
import BudgetContent from "./BudgetContent";
import EventsContent from "./PromptBasedEvents";
import AIresult from "./AIresult";
export default function AIContentRouter() {
  const { activeTab } = useTrip();

  switch (activeTab) {
    case "Plan": return <PlanByPrompt/>;
    case "Result": return <AIresult/>;
    case "Weather": return <WeatherContent />;
    case "Travel": return <TravelContent />;
    case "Itinerary": return <ItineraryContent />;
    case "Budget": return <BudgetContent />;
    case "Events": return < EventsContent/>;
    default: return <PlanInput />;
  }
}
