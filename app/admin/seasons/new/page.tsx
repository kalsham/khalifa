import { SeasonForm } from "../season-form";
import { createSeason } from "../actions";

export default function NewSeasonPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">New season</h1>
      <SeasonForm action={createSeason} />
    </div>
  );
}
