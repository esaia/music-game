import type { Category } from "../data/tracks";
import Star from "./Star";

const KAHOOT_COLORS = ["#45a3e5", "#ff3355", "#66bf39", "#eb670f"] as const;

type CategoryBoardProps = {
  category: Category;
  chosenTrackIds: Set<string>;
  colorIndex: number;
  onTrackSelect: (trackId: string) => void;
};

export default function CategoryBoard({ category, chosenTrackIds, colorIndex, onTrackSelect }: CategoryBoardProps) {
  const bgColor = KAHOOT_COLORS[colorIndex % KAHOOT_COLORS.length];

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-black/20 p-3">
      <h2 className="mb-2 shrink-0 text-xl font-bold md:text-2xl">{category.name}</h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        {category.tracks.map((track) => (
          <Star
            key={track.id}
            track={track}
            isChosen={chosenTrackIds.has(track.id)}
            bgColor={bgColor}
            onClick={() => onTrackSelect(track.id)}
          />
        ))}
      </div>
    </section>
  );
}
