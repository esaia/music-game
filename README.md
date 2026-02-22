# Music Guess Game

A real-time music guessing game: host shows categories and plays tracks (YouTube, video hidden; progress bar visible). Players on phones enter their team name and buzz in when they know the answer. Team names appear on the host modal.

## Setup

```bash
npm install
npm run dev
```

- **Host view:** open [http://localhost:5173/](http://localhost:5173/) (or `/host`) — categories with stars, click a star to open the track modal.
- **Player view:** open [http://localhost:5173/play](http://localhost:5173/play) on phones — enter team name, click "We have answer" to buzz in.

## Firebase

The app uses Firebase Realtime Database for game state and buzz-ins. Your config is in `src/lib/firebase.ts`.

To deploy optional security rules (edit in Firebase Console or use CLI):

```bash
firebase deploy --only database
```

Rules are in `database.rules.json` (permissive for development).

## Content

Edit `src/data/tracks.ts` to set the four categories (Modern, Georgian, Old classic, Movie music), 5 tracks each with points 5–25, and add real `youtubeVideoId`, `title`, and `photoUrl` for each track.
