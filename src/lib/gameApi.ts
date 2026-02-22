import { ref, set } from "firebase/database";
import { db } from "./firebase";

export async function clearBuzzInsForTrack(trackId: string): Promise<void> {
  const buzzRef = ref(db, `game/buzzIns/${trackId}`);
  await set(buzzRef, null);
}

export async function removeBuzzIn(trackId: string, teamId: string): Promise<void> {
  const buzzRef = ref(db, `game/buzzIns/${trackId}/${teamId}`);
  await set(buzzRef, null);
}
