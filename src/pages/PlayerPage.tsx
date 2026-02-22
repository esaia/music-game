import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref, onValue, runTransaction } from "firebase/database";
import { db } from "../lib/firebase";
import { useGameState } from "../hooks/useGameState";
import { useScoresFromFirebase } from "../hooks/useScoresFromFirebase";
import { teamNameToKey } from "../lib/teamKey";

export default function PlayerPage() {
  const { state } = useGameState();
  const scores = useScoresFromFirebase();
  const [teamName, setTeamName] = useState("");
  const [buzzed, setBuzzed] = useState(false);

  const currentTrackId = state.currentTrackId;
  const teamKey = teamNameToKey(teamName);
  const canBuzz = Boolean(currentTrackId && teamKey);

  useEffect(() => {
    setBuzzed(false);
  }, [currentTrackId]);

  useEffect(() => {
    if (!currentTrackId || !teamKey) {
      setBuzzed(false);
      return;
    }
    const buzzRef = ref(db, `game/buzzIns/${currentTrackId}/${teamKey}`);
    const unsub = onValue(buzzRef, (snapshot) => {
      setBuzzed(snapshot.val() != null);
    });
    return () => unsub();
  }, [currentTrackId, teamKey]);

  const handleBuzzIn = async () => {
    if (!canBuzz || buzzed) return;
    const name = teamName.trim();
    const buzzRef = ref(db, `game/buzzIns/${currentTrackId}/${teamKey}`);
    await runTransaction(buzzRef, (current) => {
      if (current == null) return { teamName: name, timestamp: Date.now() };
      return undefined;
    });
    setBuzzed(true);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center overflow-hidden p-4">
      <header className="mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="m-0 text-2xl font-bold">Music Guess</h1>
      </header>
      <div className="flex w-full max-w-md flex-col gap-4">
        <label htmlFor="team-name" className="text-lg font-bold">
          Team name
        </label>
        <input
          id="team-name"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Enter your team name"
          disabled={buzzed}
          className="rounded-2xl border-0 bg-white/20 px-5 py-4 text-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleBuzzIn}
          disabled={!canBuzz || buzzed}
          className="cursor-pointer rounded-2xl bg-white px-6 py-4 text-xl font-bold text-[#46178f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          We have answer
        </button>
        {scores.length > 0 && (
          <div className="w-full rounded-2xl bg-white/10 p-4">
            <h3 className="mb-2 text-lg font-bold text-white">Scores</h3>
            <ul className="flex flex-col gap-1">
              {scores.map(({ teamKey, teamName: name, score }) => (
                <li
                  key={teamKey}
                  className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-white"
                >
                  <span className="font-medium">{name}</span>
                  <span className="tabular-nums font-bold">{score}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!currentTrackId && (
          <p className="m-0 text-lg text-white/80">
            Waiting for host to select a track…
          </p>
        )}
        {currentTrackId && !teamName.trim() && (
          <p className="m-0 text-lg text-white/80">
            Enter your team name and click when you know the answer.
          </p>
        )}
        {buzzed && (
          <p className="m-0 text-lg font-bold text-white">
            Your team already buzzed in!
          </p>
        )}
      </div>
    </div>
  );
}
