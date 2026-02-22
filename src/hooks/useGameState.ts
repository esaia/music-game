import { useEffect, useState } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../lib/firebase";

export type GameState = {
  currentTrackId: string | null;
  revealed: boolean;
};

const STATE_PATH = "game/state";

export function useGameState() {
  const [state, setState] = useState<GameState>({ currentTrackId: null, revealed: false });

  useEffect(() => {
    const stateRef = ref(db, STATE_PATH);
    const unsub = onValue(stateRef, (snapshot) => {
      const val = snapshot.val();
      setState({
        currentTrackId: val?.currentTrackId ?? null,
        revealed: Boolean(val?.revealed),
      });
    });
    return () => unsub();
  }, []);

  const setCurrentTrack = (trackId: string | null) => {
    const stateRef = ref(db, STATE_PATH);
    set(stateRef, {
      currentTrackId: trackId,
      revealed: false,
    });
  };

  const updateRevealed = async (revealed: boolean) => {
    const stateRef = ref(db, STATE_PATH);
    const snapshot = await get(stateRef);
    const current = snapshot.val() ?? {};
    set(stateRef, { ...current, revealed });
  };

  return { state, setCurrentTrack, updateRevealed };
}
