import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import type { ScoreEntry } from "../lib/gameApi";

const SCORES_PATH = "game/scores";

export function useScoresFromFirebase(): ScoreEntry[] {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    const scoresRef = ref(db, SCORES_PATH);
    const unsub = onValue(scoresRef, (snapshot) => {
      const val = snapshot.val();
      if (!val || typeof val !== "object") {
        setScores([]);
        return;
      }
      const entries: ScoreEntry[] = Object.entries(
        val as Record<string, { teamName?: string; score?: number }>
      )
        .map(([teamKey, v]) => ({
          teamKey,
          teamName: String(v?.teamName ?? ""),
          score: Number(v?.score) || 0,
        }))
        .sort((a, b) => b.score - a.score);
      setScores(entries);
    });
    return () => unsub();
  }, []);

  return scores;
}
