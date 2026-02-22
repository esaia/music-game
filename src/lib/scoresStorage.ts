const STORAGE_KEY = "music-game-scores";

export type ScoreEntry = { teamKey: string; teamName: string; score: number };

function load(): Record<string, { score: number; teamName: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, { score: number; teamName: string }>) : {};
  } catch {
    return {};
  }
}

function save(data: Record<string, { score: number; teamName: string }>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getScores(): ScoreEntry[] {
  const data = load();
  return Object.entries(data)
    .map(([teamKey, v]) => ({
      teamKey,
      teamName: String(v?.teamName ?? ""),
      score: Number(v?.score) || 0,
    }))
    .sort((a, b) => b.score - a.score);
}

export function addScore(
  teamKey: string,
  teamName: string,
  points: number
): ScoreEntry[] {
  const data = load();
  const prev = data[teamKey];
  const newScore = (prev?.score ?? 0) + points;
  data[teamKey] = { score: newScore, teamName };
  save(data);
  return getScores();
}

export function setScore(
  teamKey: string,
  teamName: string,
  score: number
): ScoreEntry[] {
  const data = load();
  const value = Math.max(0, Math.floor(Number(score)) || 0);
  data[teamKey] = { score: value, teamName };
  save(data);
  return getScores();
}
