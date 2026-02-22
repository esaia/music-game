import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "music-game-chosen-tracks";

function loadChosenTrackIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveChosenTrackIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function useChosenTracks(): [Set<string>, (trackId: string) => void] {
  const [chosenIds, setChosenIds] = useState<string[]>(() => loadChosenTrackIds());

  useEffect(() => {
    saveChosenTrackIds(chosenIds);
  }, [chosenIds]);

  const markChosen = useCallback((trackId: string) => {
    setChosenIds((prev) => (prev.includes(trackId) ? prev : [...prev, trackId]));
  }, []);

  return [new Set(chosenIds), markChosen];
}
