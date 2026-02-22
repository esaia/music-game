import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";

const BUZZ_INS_PATH = "game/buzzIns";

export type BuzzInEntry = { teamId: string; teamName: string; timestamp?: number };

function parseBuzzValue(val: unknown): { teamName: string; timestamp?: number } {
  if (typeof val === "string") return { teamName: val };
  if (val && typeof val === "object" && "teamName" in val) {
    const o = val as { teamName?: string; timestamp?: number };
    return {
      teamName: String(o.teamName ?? ""),
      timestamp: typeof o.timestamp === "number" ? o.timestamp : undefined,
    };
  }
  return { teamName: "" };
}

export function useBuzzIns(trackId: string | null): BuzzInEntry[] {
  const [entries, setEntries] = useState<BuzzInEntry[]>([]);

  useEffect(() => {
    if (!trackId) {
      setEntries([]);
      return;
    }
    const buzzRef = ref(db, `${BUZZ_INS_PATH}/${trackId}`);
    const unsub = onValue(buzzRef, (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val === "object") {
        setEntries(
          Object.entries(val).map(([id, v]) => {
            const { teamName, timestamp } = parseBuzzValue(v);
            return { teamId: id, teamName, timestamp };
          })
        );
      } else {
        setEntries([]);
      }
    });
    return () => unsub();
  }, [trackId]);

  return entries;
}
