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

const POINTS = [5, 10, 15, 20, 25, 30, 35] as const;

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
    tracks: POINTS.map((points, i) => ({
      id: `${categoryId}-${points}`,
      points,
      youtubeVideoId: items[i]?.videoId ?? "dQw4w9WgXcQ",
      title: items[i]?.title ?? `${categoryName} Track ${i + 1}`,
      photoUrl: thumb(items[i]?.videoId ?? "dQw4w9WgXcQ"),
    })),
  };
}

const FALLBACK_VIDEO_ID = "dQw4w9WgXcQ";

export const CATEGORIES: Category[] = [
  makeTracks("modern", "Modern", [
    { videoId: "G7KNmW9a75Y", title: "Flowers – Miley Cyrus" },
    { videoId: "4NRXx6U8ABQ", title: "Blinding Lights – The Weeknd" },
    { videoId: "H5v3kku4y6Q", title: "As It Was – Harry Styles" },
    { videoId: "eVli-tstM5E", title: "Espresso – Sabrina Carpenter" },
    { videoId: "ZAfAud_M_fo", title: "Anti-Hero – Taylor Swift" },
    { videoId: "Nj2U6rhnucI", title: "Levitating – Dua Lipa" },
    { videoId: "RlPNh_PBZb4", title: "Vampire – Olivia Rodrigo" },
  ]),
  makeTracks("oldclassic", "Old Classics", [
    { videoId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody – Queen" },
    { videoId: "Zi_XLOBDo_Y", title: "Billie Jean – Michael Jackson" },
    { videoId: "09839DpTctU", title: "Hotel California – Eagles" },
    { videoId: "xFrGuyw1V8s", title: "Dancing Queen – ABBA" },
    { videoId: "1w7OgIMMRc4", title: "Sweet Child O' Mine – Guns N' Roses" },
    { videoId: "fNFzfwOE66U", title: "Stayin' Alive – Bee Gees" },
    { videoId: "hTWKbfoikeg", title: "Smells Like Teen Spirit – Nirvana" },
  ]),
  makeTracks("georgian", "Georgia Hits", [
    {
      videoId: FALLBACK_VIDEO_ID,
      title: "Samshoblo (სამშობლო) – Nato Gelashvili / Various",
    },
    {
      videoId: FALLBACK_VIDEO_ID,
      title: "Qari Qris (ქარი ქრის) – Stepane & 3G",
    },
    {
      videoId: FALLBACK_VIDEO_ID,
      title: "Kviteli Fotlebi (ყვითელი ფოთლები) – Giya Kancheli",
    },
    { videoId: FALLBACK_VIDEO_ID, title: "Tbilisi – Mgzavrebi" },
    { videoId: FALLBACK_VIDEO_ID, title: "Sulkhan-Saba – Trio Mandili" },
    {
      videoId: FALLBACK_VIDEO_ID,
      title: "Ghazali (ღაზალი) – Hamlet Gonashvili",
    },
    { videoId: FALLBACK_VIDEO_ID, title: "Is evari – Tbilisuri Quarteti" },
  ]),
  makeTracks("movie", "Movie Music", [
    {
      videoId: "91zaz3DiEic",
      title: "My Heart Will Go On – Celine Dion (Titanic)",
    },
    { videoId: "btPJPFnesV4", title: "Eye of the Tiger – Survivor (Rocky)" },
    {
      videoId: "DtB7pFkVFp0",
      title: "Imperial March – John Williams (Star Wars)",
    },
    {
      videoId: "3K0R2jJK5oE",
      title:
        "He's a Pirate – Klaus Badelt/Hans Zimmer (Pirates of the Caribbean)",
    },
    {
      videoId: "tan5p4b4N_s",
      title: "Shallow – Lady Gaga & Bradley Cooper (A Star Is Born)",
    },
    {
      videoId: "GibiNy4d4gc",
      title: "Circle of Life – Elton John (The Lion King)",
    },
    {
      videoId: "Htaj3o3JD7I",
      title: "Hedwig's Theme – John Williams (Harry Potter)",
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
