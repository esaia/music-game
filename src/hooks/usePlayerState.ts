import { useEffect, useState } from "react";
import { ref, onValue, set, get } from "firebase/database";
import { db } from "../lib/firebase";

export type PlayerState = {
  isPlaying: boolean;
  seekTime: number;
};

const PLAYER_PATH = "game/player";

export function usePlayerState() {
  const [playerState, setPlayerStateLocal] = useState<PlayerState>({
    isPlaying: false,
    seekTime: 0,
  });

  useEffect(() => {
    const playerRef = ref(db, PLAYER_PATH);
    const unsub = onValue(playerRef, (snapshot) => {
      const val = snapshot.val();
      setPlayerStateLocal({
        isPlaying: Boolean(val?.isPlaying),
        seekTime: typeof val?.seekTime === "number" ? val.seekTime : 0,
      });
    });
    return () => unsub();
  }, []);

  const setPlayerState = async (update: Partial<PlayerState>) => {
    const playerRef = ref(db, PLAYER_PATH);
    const snapshot = await get(playerRef);
    const current = snapshot.val() ?? {};
    set(playerRef, { ...current, ...update });
  };

  return { playerState, setPlayerState };
}
