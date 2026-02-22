import { ref, set } from "firebase/database";
import { db } from "./firebase";

const SCORES_PATH = "game/scores";

export type ScoreEntry = { teamKey: string; teamName: string; score: number };

export async function writeScoresToFirebase(entries: ScoreEntry[]): Promise<void> {
  const data: Record<string, { teamName: string; score: number }> = {};
  entries.forEach((e) => {
    data[e.teamKey] = { teamName: e.teamName, score: e.score };
  });
  await set(ref(db, SCORES_PATH), data);
}

export async function clearBuzzInsForTrack(trackId: string): Promise<void> {
  const buzzRef = ref(db, `game/buzzIns/${trackId}`);
  await set(buzzRef, null);
}

export async function removeBuzzIn(trackId: string, teamId: string): Promise<void> {
  const buzzRef = ref(db, `game/buzzIns/${trackId}/${teamId}`);
  await set(buzzRef, null);
}
