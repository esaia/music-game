/**
 * Normalizes a team name to a stable key so "Team 1", "team 1", "  Team 1  " map to the same key.
 * Used for: one buzz per team (multiple phones can join same team by entering the same name).
 */
export function teamNameToKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "";
}
