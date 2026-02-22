import { Link } from "react-router-dom";
import { CATEGORIES, getTrackById } from "../data/tracks";
import CategoryBoard from "../components/CategoryBoard";
import TrackModal from "../components/TrackModal";
import { useGameState } from "../hooks/useGameState";
import { usePlayerState } from "../hooks/usePlayerState";
import { useBuzzIns } from "../hooks/useBuzzIns";
import { useChosenTracks } from "../hooks/useChosenTracks";
import { useState, useEffect } from "react";
import {
  clearBuzzInsForTrack,
  removeBuzzIn,
  writeScoresToFirebase,
} from "../lib/gameApi";
import {
  getScores,
  addScore as addScoreToStorage,
  setScore as setScoreInStorage,
  removeTeam as removeTeamFromStorage,
} from "../lib/scoresStorage";
import type { PlayerState } from "../hooks/usePlayerState";

export default function HostPage() {
  const { state, setCurrentTrack, updateRevealed } = useGameState();
  const { setPlayerState } = usePlayerState();
  const [chosenTrackIds, markChosen] = useChosenTracks();
  const [scores, setScores] = useState(getScores);
  const selectedTrackId = state.currentTrackId;
  const buzzIns = useBuzzIns(selectedTrackId ?? null);
  const selectedTrack = selectedTrackId ? getTrackById(selectedTrackId) : null;

  const resetPlayerState = () =>
    void setPlayerState({ isPlaying: false, seekTime: 0 });

  const handleTrackSelect = (trackId: string) => {
    markChosen(trackId);
    setCurrentTrack(trackId);
    resetPlayerState();
  };

  const handleCloseModal = async () => {
    if (selectedTrackId) {
      await clearBuzzInsForTrack(selectedTrackId);
    }
    setCurrentTrack(null);
    resetPlayerState();
  };

  const handleRevealToggle = () => {
    updateRevealed(!state.revealed);
  };

  const handleRemoveBuzzIn = (teamId: string) => {
    if (selectedTrackId) void removeBuzzIn(selectedTrackId, teamId);
  };

  const handleAwardScore = (teamKey: string, teamName: string) => {
    if (!selectedTrack) return;
    const newScores = addScoreToStorage(
      teamKey,
      teamName,
      selectedTrack.points,
    );
    setScores(newScores);
    void writeScoresToFirebase(newScores);
    if (selectedTrackId) void removeBuzzIn(selectedTrackId, teamKey);
  };

  const handleScoreChange = (
    teamKey: string,
    teamName: string,
    newScore: number,
  ) => {
    const newScores = setScoreInStorage(teamKey, teamName, newScore);
    setScores(newScores);
    void writeScoresToFirebase(newScores);
  };

  const handleRemoveTeam = (teamKey: string) => {
    const newScores = removeTeamFromStorage(teamKey);
    setScores(newScores);
    void writeScoresToFirebase(newScores);
  };

  useEffect(() => {
    void writeScoresToFirebase(getScores());
  }, []);

  const handleClearLocalStorage = () => {
    if (
      window.confirm(
        "Clear all local data? This will reset scores and chosen tracks.",
      )
    ) {
      localStorage.removeItem("music-game-scores");
      localStorage.removeItem("music-game-chosen-tracks");
      window.location.reload();
    }
  };

  const columnCount = CATEGORIES.length;

  return (
    <div className="flex h-screen flex-col overflow-hidden p-3">
      <header className="flex shrink-0 items-center justify-between gap-2 mb-4">
        <h1 className="m-0 text-2xl font-bold md:text-3xl">Music Guess Game</h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onDoubleClick={handleClearLocalStorage}
            className="cursor-pointer text-lg font-semibold text-white underline underline-offset-2 hover:text-white/90"
          >
            Clear local storage
          </button>
          <Link
            to="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-white underline underline-offset-2"
          >
            Projector view
          </Link>
          <Link
            to="/"
            className="text-lg font-semibold text-white underline underline-offset-2"
          >
            Player view (phones)
          </Link>
        </div>
      </header>
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
              onTrackSelect={handleTrackSelect}
            />
          ))}
        </div>
        {scores.length > 0 && (
          <div className="flex shrink-0 flex-col rounded-2xl bg-black/20 px-4 py-3">
            <div className="mb-2 text-base font-bold text-white/90">Scores</div>
            <div className="flex flex-col gap-1">
              {scores.map(({ teamKey, teamName, score }) => (
                <div
                  key={teamKey}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="min-w-0 truncate text-lg font-semibold text-white">
                    {teamName}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={score}
                      onChange={(e) => {
                        const v = e.target.value;
                        const n =
                          v === ""
                            ? 0
                            : Math.max(0, Math.floor(Number(v)) || 0);
                        handleScoreChange(teamKey, teamName, n);
                      }}
                      onBlur={(e) => {
                        const n = Math.max(
                          0,
                          Math.floor(Number(e.target.value)) || 0,
                        );
                        handleScoreChange(teamKey, teamName, n);
                      }}
                      className="w-14 rounded bg-white/15 px-1 py-0.5 text-right text-xl font-bold tabular-nums text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTeam(teamKey)}
                      aria-label={`Remove ${teamName}`}
                      title={`Remove ${teamName}`}
                      className="cursor-pointer rounded-full p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
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
          onPlayerStateChange={(update: Partial<PlayerState>) =>
            void setPlayerState(update)
          }
          alwaysShowTitleAndPreview
        />
      )}
    </div>
  );
}
