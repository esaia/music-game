import { CATEGORIES, getTrackById } from "../data/tracks";
import CategoryBoard from "../components/CategoryBoard";
import TrackModal from "../components/TrackModal";
import { useGameState } from "../hooks/useGameState";
import { usePlayerState } from "../hooks/usePlayerState";
import { useBuzzIns } from "../hooks/useBuzzIns";
import { useProjectorSync } from "../hooks/useProjectorSync";

const noop = () => {};

export default function ProjectorPage() {
  const { state } = useGameState();
  const { playerState } = usePlayerState();
  const { chosenTrackIds, scores } = useProjectorSync();
  const selectedTrackId = state.currentTrackId;
  const buzzIns = useBuzzIns(selectedTrackId ?? null);
  const selectedTrack = selectedTrackId ? getTrackById(selectedTrackId) : null;
  const columnCount = CATEGORIES.length;

  return (
    <div className=" flex h-screen cursor-none flex-col overflow-hidden p-3">
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
          <div
            className="grid min-h-0 flex-1 gap-2 overflow-auto"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
            }}
          >
            {CATEGORIES.map((category, index) => (
              <CategoryBoard
                key={category.id}
                category={category}
                chosenTrackIds={chosenTrackIds}
                colorIndex={index}
                onTrackSelect={noop}
              />
            ))}
          </div>

          {scores.length > 0 && (
            <div className="flex shrink-0 flex-col rounded-2xl bg-white/10 h-fit p-4 min-w-[300px]">
              <h2 className="mb-2 shrink-0 text-xl font-bold md:text-2xl">
                Scores
              </h2>{" "}
              <ul className="flex flex-col gap-1">
                {scores.map(({ teamKey, teamName, score }) => (
                  <li
                    key={teamKey}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-white"
                  >
                    <span className="min-w-0 truncate font-medium text-2xl">
                      {teamName}
                    </span>
                    <span className="shrink-0 tabular-nums font-bold text-3xl">
                      {score}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {selectedTrack && (
        <TrackModal
          track={selectedTrack}
          onClose={noop}
          buzzIns={buzzIns}
          onRemoveBuzzIn={noop}
          onAwardScore={noop}
          revealed={state.revealed}
          onReveal={noop}
          syncedIsPlaying={playerState.isPlaying}
          syncedSeekTime={playerState.seekTime}
        />
      )}
    </div>
  );
}
