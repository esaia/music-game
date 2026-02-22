import { useState, useEffect } from "react";
import { getScores, type ScoreEntry } from "../lib/scoresStorage";

const CHOSEN_KEY = "music-game-chosen-tracks";
const SCORES_KEY = "music-game-scores";

function loadChosenIds(): string[] {
  try {
    const raw = localStorage.getItem(CHOSEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useProjectorSync(): { chosenTrackIds: Set<string>; scores: ScoreEntry[] } {
  const [chosenIds, setChosenIds] = useState<string[]>(loadChosenIds);
  const [scores, setScores] = useState<ScoreEntry[]>(getScores);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CHOSEN_KEY) setChosenIds(loadChosenIds());
      if (e.key === SCORES_KEY) setScores(getScores());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return { chosenTrackIds: new Set(chosenIds), scores };
}
