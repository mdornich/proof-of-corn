import { Composition } from "remotion";
import { WeeklyRecap, weeklyRecapSchema } from "./compositions/WeeklyRecap";
import { StatusCard, statusCardSchema } from "./compositions/StatusCard";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="WeeklyRecap"
        component={WeeklyRecap}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        schema={weeklyRecapSchema}
        defaultProps={{
          week: 4,
          dateRange: "Jan 20 - Jan 26",
          weatherData: [
            { region: "Midwest", tempHigh: 28, tempLow: 14, status: "Dormant" },
            { region: "Southeast", tempHigh: 52, tempLow: 38, status: "Pre-season" },
            { region: "Southwest", tempHigh: 61, tempLow: 42, status: "Planning" },
          ],
          emailsProcessed: 47,
          tasksCompleted: 23,
          followUpsSent: 12,
          budgetSpent: 1240,
          budgetTotal: 5000,
          nextMilestone: "Seed supplier contracts finalized",
        }}
      />
      <Composition
        id="StatusCard"
        component={StatusCard}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        schema={statusCardSchema}
        defaultProps={{
          week: 4,
          regions: [
            { name: "Midwest", status: "Dormant" },
            { name: "Southeast", status: "Pre-season" },
            { name: "Southwest", status: "Planning" },
          ],
          emailCount: 47,
          budgetSpent: 1240,
          budgetTotal: 5000,
        }}
      />
    </>
  );
};
