export type Track = {
  id: string;
  points: number;
  youtubeVideoId: string;
  title: string;
  photoUrl: string;
};

export type Category = {
  id: string;
  name: string;
  tracks: Track[];
};

/** Returns false for empty or invalid YouTube video ids so we can skip opening the player modal. */
export function isValidYoutubeVideoId(id: string): boolean {
  return (
    typeof id === "string" && id.length === 11 && /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

const POINTS = [5, 10, 15] as const;

const FALLBACK_VIDEO_ID = "dQw4w9WgXcQ";

function thumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function makeTracks(
  categoryId: string,
  categoryName: string,
  items: { videoId: string; title: string }[],
): Category {
  return {
    id: categoryId,
    name: categoryName,
    tracks: items.map((item, i) => {
      const points = POINTS[i % POINTS.length];
      return {
        id: `${categoryId}-${i}`,
        points,
        youtubeVideoId: item?.videoId ?? FALLBACK_VIDEO_ID,
        title: item?.title ?? `${categoryName} Track ${i + 1}`,
        photoUrl: thumb(item?.videoId ?? FALLBACK_VIDEO_ID),
      };
    }),
  };
}

export const CATEGORIES: Category[] = [
  makeTracks("modern", "Modern", [
    { videoId: "G7KNmW9a75Y", title: "Flowers – Miley Cyrus" },
    { videoId: "oygrmJFKYZY", title: "Dua Lipa - Don't Start Now" },
    { videoId: "H5v3kku4y6Q", title: "As It Was – Harry Styles" },
    { videoId: "eVli-tstM5E", title: "Espresso – Sabrina Carpenter" },
    { videoId: "GxldQ9eX2wo", title: "Stephen Sanchez - Until I Found You" },
    { videoId: "1_MmmpDkbgo", title: "Ed Sheeran - Perfect" },
    { videoId: "EZKjxn14gO4", title: "ORDINARY" },
  ]),
  makeTracks("oldclassic", "Old Classics", [
    { videoId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody – Queen" },
    { videoId: "Zi_XLOBDo_Y", title: "Billie Jean – Michael Jackson" },
    { videoId: "09839DpTctU", title: "Hotel California – Eagles" },
    { videoId: "xFrGuyw1V8s", title: "Dancing Queen – ABBA" },
    { videoId: "1w7OgIMMRc4", title: "Sweet Child O' Mine – Guns N' Roses" },
    { videoId: "Q2FzZSBD5LE", title: "Deep Purple - Smoke On the Water" },
  ]),
  makeTracks("georgian", "Georgia Hits", [
    {
      videoId: "1gQWf_ujY04",
      title: "Me gadmovcurav Zgvas!",
    },
    {
      videoId: "r4HaxuxNaRI",
      title: "ჩემო თბილის ქალაქო",
    },
    { videoId: "l7bjfR9muNs", title: "Tamada - Piramde" },
    {
      videoId: "gry3SYqLfl0",
      title: "სამშობლო",
    },
    { videoId: "im93RBMcuXc", title: "LOUDspeakers - World In My Eyes" },
    {
      videoId: "1X3xW-KHS-Q",
      title: "როგორ არ დამელია",
    },

    {
      videoId: "Uc0KAemR-NI",
      title: "MGZAVREBI - Chveni Ambavi",
    },
  ]),
  makeTracks("movie", "Movie Music", [
    {
      videoId: "91zaz3DiEic",
      title: "My Heart Will Go On – Celine Dion (Titanic)",
    },
    { videoId: "btPJPFnesV4", title: "Eye of the Tiger – Survivor (Rocky)" },
    {
      videoId: "wp43OdtAAkM",
      title: "Running Up That Hill",
    },

    {
      videoId: "GibiNy4d4gc",
      title: "Circle of Life – Elton John (The Lion King)",
    },
    {
      videoId: "Xry6B0I3pT8",
      title: "Shakira - Zootopia 2",
    },

    {
      videoId: "fNFzfwLM72c",
      title: "Bee Gees - Stayin' Alive",
    },

    {
      videoId: "D8zlUUrFK-M",
      title: "Jurassic Park theme song",
    },

    {
      videoId: "hdcTmpvDO0I",
      title: "Madagascar - I Like To Move It",
    },
  ]),
];

export function getTrackById(trackId: string): Track | undefined {
  for (const cat of CATEGORIES) {
    const track = cat.tracks.find((t) => t.id === trackId);
    if (track) return track;
  }
  return undefined;
}

export function getCategoryByTrackId(trackId: string): Category | undefined {
  for (const cat of CATEGORIES) {
    if (cat.tracks.some((t) => t.id === trackId)) return cat;
  }
  return undefined;
}
