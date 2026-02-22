import { Link } from "react-router-dom";
import { CATEGORIES, getTrackById } from "../data/tracks";
import CategoryBoard from "../components/CategoryBoard";
import TrackModal from "../components/TrackModal";
import { useGameState } from "../hooks/useGameState";
import { useBuzzIns } from "../hooks/useBuzzIns";
import { useChosenTracks } from "../hooks/useChosenTracks";
import { useState } from "react";
import { clearBuzzInsForTrack, removeBuzzIn } from "../lib/gameApi";
import { getScores, addScore as addScoreToStorage, setScore as setScoreInStorage } from "../lib/scoresStorage";

export default function HostPage() {
  const { state, setCurrentTrack, updateRevealed } = useGameState();
  const [chosenTrackIds, markChosen] = useChosenTracks();
  const [scores, setScores] = useState(getScores);
  const selectedTrackId = state.currentTrackId;
  const buzzIns = useBuzzIns(selectedTrackId ?? null);
  const selectedTrack = selectedTrackId ? getTrackById(selectedTrackId) : null;

  const handleTrackSelect = (trackId: string) => {
    markChosen(trackId);
    setCurrentTrack(trackId);
  };

  const handleCloseModal = async () => {
    if (selectedTrackId) {
      await clearBuzzInsForTrack(selectedTrackId);
    }
    setCurrentTrack(null);
  };

  const handleRevealToggle = () => {
    updateRevealed(!state.revealed);
  };

  const handleRemoveBuzzIn = (teamId: string) => {
    if (selectedTrackId) void removeBuzzIn(selectedTrackId, teamId);
  };

  const handleAwardScore = (teamKey: string, teamName: string) => {
    if (!selectedTrack) return;
    setScores(addScoreToStorage(teamKey, teamName, selectedTrack.points));
    if (selectedTrackId) void removeBuzzIn(selectedTrackId, teamKey);
  };

  const handleScoreChange = (teamKey: string, teamName: string, newScore: number) => {
    setScores(setScoreInStorage(teamKey, teamName, newScore));
  };

  const columnCount = CATEGORIES.length;

  return (
    <div className="flex h-screen flex-col overflow-hidden p-3">
      <header className="flex shrink-0 items-center justify-between gap-2">
        <h1 className="m-0 text-2xl font-bold md:text-3xl">Music Guess Game</h1>
        <Link to="/" className="text-lg font-semibold text-white underline underline-offset-2">
          Player view (phones)
        </Link>
      </header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <div
          className="grid min-h-0 flex-1 gap-2 overflow-auto"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {CATEGORIES.map((category, index) => (
            <CategoryBoard
              key={category.id}
              category={category}
              chosenTrackIds={chosenTrackIds}
              colorIndex={index}
              onTrackSelect={handleTrackSelect}
            />
          ))}
        </div>
        {scores.length > 0 && (
          <div className="flex shrink-0 flex-col rounded-2xl bg-black/20 px-4 py-3">
            <div className="mb-2 text-base font-bold text-white/90">Scores</div>
            <div className="flex flex-col gap-1">
              {scores.map(({ teamKey, teamName, score }) => (
                <div key={teamKey} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-lg font-semibold text-white">
                    {teamName}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={score}
                    onChange={(e) => {
                      const v = e.target.value;
                      const n = v === "" ? 0 : Math.max(0, Math.floor(Number(v)) || 0);
                      handleScoreChange(teamKey, teamName, n);
                    }}
                    onBlur={(e) => {
                      const n = Math.max(0, Math.floor(Number(e.target.value)) || 0);
                      handleScoreChange(teamKey, teamName, n);
                    }}
                    className="w-16 shrink-0 rounded bg-white/15 px-1 py-0.5 text-right text-xl font-bold tabular-nums text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {selectedTrack && (
        <TrackModal
          track={selectedTrack}
          onClose={handleCloseModal}
          buzzIns={buzzIns}
          onRemoveBuzzIn={handleRemoveBuzzIn}
          onAwardScore={handleAwardScore}
          revealed={state.revealed}
          onReveal={handleRevealToggle}
        />
      )}
    </div>
  );
}
