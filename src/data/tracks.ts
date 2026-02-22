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

const POINTS = [5, 10, 15, 20, 25] as const;

function thumb(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function makeTracks(
  categoryId: string,
  categoryName: string,
  items: { videoId: string; title: string }[]
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

export const CATEGORIES: Category[] = [
  makeTracks("modern", "Modern", [
    { videoId: "oygrmJFKYZY", title: "Dua Lipa – Don't Start Now" },
    { videoId: "gdZLi9oWNZg", title: "BTS – Dynamite" },
    { videoId: "4NRXx6U8ABQ", title: "The Weeknd – Blinding Lights" },
    { videoId: "Nj2U6rhnucI", title: "Dua Lipa – Break My Heart" },
    { videoId: "vImvzQCb0o8", title: "Demi Lovato – I Love Me" },
  ]),
  makeTracks("georgian", "Georgian", [
    { videoId: "wp43OdtAAkM", title: "11111 Basiani Ensemble – Georgian Polyphony (Religious Songs)" },
    { videoId: "ZkuXyTsMRTI", title: "Ansambli Qartvelo – Polyphonic Georgian Songs" },
    { videoId: "TNblli7kZik", title: "Georgian traditional polyphonic – Shen xar venaxi" },
    { videoId: "mC9oh_Q6UDo", title: "Nanina – Iruli chqimda (Georgian polyphonic)" },
    { videoId: "X7E91Pe_5dA", title: "Georgian Folk – Polyphonic Song from Svaneti" },
  ]),
  makeTracks("oldclassic", "Old classic", [
    { videoId: "NbaImWFT89U", title: "Righteous Brothers – Unchained Melody" },
    { videoId: "3P4XB3bM9iA", title: "Golden Oldies – 60s & 70s Hits" },
    { videoId: "NoNw_b2vcDQ", title: "Oldies But Goodies – 50s & 60s" },
    { videoId: "Y-9Y4CCIWnM", title: "Chuck Berry – Johnny B. Goode" },
    { videoId: "-eHJ12Vhpyc", title: "Elvis Presley – Hound Dog" },
  ]),
  makeTracks("movie", "Movie music", [
    { videoId: "5fH2FOn1V5g", title: "The Sound of Music – Opening" },
    { videoId: "fJ9rUzIMcZQ", title: "Queen – Bohemian Rhapsody" },
    { videoId: "IMD5-Sc6v9g", title: "John Williams – Schindler's List Theme" },
    { videoId: "78N2SP6JFaI", title: "John Williams – Superman Main Theme" },
    { videoId: "tCr5BhPqUjk", title: "James Bond Theme (Dr. No)" },
  ]),
];

export function getTrackById(trackId: string): Track | undefined {
  for (const cat of CATEGORIES) {
    const track = cat.tracks.find((t) => t.id === trackId);
    if (track) return track;
  }
  return undefined;
}
