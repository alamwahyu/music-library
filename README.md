# AWH Digital Music Library

Browser-based music library for AWH Digital, built with Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Zustand, and Lucide icons.

## Features

- Music library at `/music`
- Dynamic categories with create, edit, delete, counts, and filtering
- MP3 upload to local `/uploads/music` through a storage abstraction
- YouTube URL support with video ID extraction and thumbnail defaults
- REST API for music, categories, playlists, and upload
- Global bottom music player with MP3 and YouTube adapters
- Queue, play next, previous, shuffle, repeat, progress, volume, mute
- Favorites, tags, search debounce, source filter, sort, empty state, skeleton loading
- Playlist create/delete and add song flow

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Point `DATABASE_URL` to a PostgreSQL database, then run:

```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev
```

4. Open `http://localhost:3000/music`.

Uploaded MP3 files are saved under `uploads/music` and served through `/uploads/music/:file`.

## Subpath Deployment

For deployment under `https://your-domain/music-library`, set these before building:

```bash
NEXT_PUBLIC_APP_URL="https://your-domain"
NEXT_PUBLIC_BASE_PATH="/music-library"
PUBLIC_UPLOAD_BASE_URL="/music-library/uploads/music"
```

`NEXT_PUBLIC_BASE_PATH` is inlined at build time by Next.js, so rebuild after changing it.
# music-library
