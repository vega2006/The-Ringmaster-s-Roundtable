import { useTrip } from "../contexts/TripContext";
import PlanByPrompt from "./PlanByPrompt";
import WeatherContent from "./WeatherContent";
import TravelContent from "./TravelContent";
import PromptBasedItinerary from "./PromptBasedItinerary";
import BudgetContent from "./BudgetContent";
import PromptBasedEvents from "./PromptBasedEvents";
import AIresult from "./AIresult";
import GoogleMapView from "./GoogleMapView";
export default function AIContentRouter() {
  const { activeTab } = useTrip();

  switch (activeTab) {
    case "Plan": return <PlanByPrompt/>;
    case "Result": return <AIresult/>;
    case "Weather": return <WeatherContent />;
    case "Travel": return <TravelContent />;
    case "Itinerary": return <PromptBasedItinerary/>;
    case "Budget": return <BudgetContent />;
    case "Events": return < PromptBasedEvents/>;
    case "Map View": return < GoogleMapView/>;
    default: return <PlanByPrompt />;
  }
}
